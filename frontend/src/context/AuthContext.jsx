import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  userPool,
  signupUser,
  confirmUser,
  loginUser
} from "../lib/cognito.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const allowedGroups = (import.meta.env.VITE_ALLOWED_GROUPS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // cognito user session payload
  const [status, setStatus] = useState("");        // UX message
  const [loading, setLoading] = useState(true);

  // restore session on refresh
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    currentUser.getSession((err, session) => {
      if (err || !session?.isValid()) {
        setLoading(false);
        return;
      }
      const idToken = session.getIdToken().getJwtToken();
      const payload = session.getIdToken().decodePayload();
      Cookies.set("idToken", idToken, { sameSite: "Strict", secure: true });
      setUser(payload);
      setLoading(false);
    });
  }, []);

  const signUp = async ({ fullName, email, password }) => {
    setStatus("");
    const pendingUser = await signupUser({ fullName, email, password });
    return pendingUser;
  };

  const verify = async ({ email, code }) => {
    setStatus("");
    await confirmUser({ email, code });
  };

  const signIn = async ({ email, password }) => {
    setStatus("");
    const result = await loginUser({ email, password });
    const idToken = result.getIdToken();
    const jwt = idToken.getJwtToken();
    const payload = idToken.decodePayload();
    const groups = payload["cognito:groups"] || [];

    const ok =
      allowedGroups.length === 0 ||
      groups.some(g => allowedGroups.includes(g));

    if (!ok) {
      setStatus("Awaiting Admin Approval. You cannot access the dashboard yet.");
      Cookies.remove("idToken");
      userPool.getCurrentUser()?.signOut();
      return false;
    }

    Cookies.set("idToken", jwt, { sameSite: "Strict", secure: true });
    setUser(payload);
    return true;
  };

  const signOut = () => {
    Cookies.remove("idToken");
    userPool.getCurrentUser()?.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, status, setStatus, signUp, verify, signIn, signOut }),
    [user, loading, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
