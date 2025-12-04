// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import Cookies from "js-cookie";
// import {
//   userPool,
//   signupUser,
//   confirmUser,
//   loginUser
// } from "../lib/cognito.js";

// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// const allowedGroups = (import.meta.env.VITE_ALLOWED_GROUPS || "")
//   .split(",")
//   .map(s => s.trim())
//   .filter(Boolean);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);          // cognito user session payload
//   const [status, setStatus] = useState("");        // UX message
//   const [loading, setLoading] = useState(true);

//   // restore session on refresh
//   useEffect(() => {
//     const currentUser = userPool.getCurrentUser();
//     if (!currentUser) {
//       setLoading(false);
//       return;
//     }

//     currentUser.getSession((err, session) => {
//       if (err || !session?.isValid()) {
//         setLoading(false);
//         return;
//       }
//       const idToken = session.getIdToken().getJwtToken();
//       const payload = session.getIdToken().decodePayload();
//       Cookies.set("idToken", idToken, { sameSite: "Strict", secure: true });
//       setUser(payload);
//       setLoading(false);
//     });
//   }, []);

//   const signUp = async ({ fullName, email, password }) => {
//     setStatus("");
//     const pendingUser = await signupUser({ fullName, email, password });
//     return pendingUser;
//   };

//   const verify = async ({ email, code }) => {
//     setStatus("");
//     await confirmUser({ email, code });
//   };

//   const signIn = async ({ email, password }) => {
//     setStatus("");
//     const result = await loginUser({ email, password });
//     const idToken = result.getIdToken();
//     const jwt = idToken.getJwtToken();
//     const payload = idToken.decodePayload();
//     const groups = payload["cognito:groups"] || [];

//     const ok =
//       allowedGroups.length === 0 ||
//       groups.some(g => allowedGroups.includes(g));

//     if (!ok) {
//       setStatus("Awaiting Admin Approval. You cannot access the dashboard yet.");
//       Cookies.remove("idToken");
//       userPool.getCurrentUser()?.signOut();
//       return false;
//     }

//     Cookies.set("idToken", jwt, { sameSite: "Strict", secure: true });
//     setUser(payload);
//     return true;
//   };

//   const signOut = () => {
//     Cookies.remove("idToken");
//     userPool.getCurrentUser()?.signOut();
//     setUser(null);
//   };

//   const value = useMemo(
//     () => ({ user, loading, status, setStatus, signUp, verify, signIn, signOut }),
//     [user, loading, status]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

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

const API_BASE = import.meta.env.VITE_API_BASE;
const APP_ID = "ai-dashboard-react"; // change per app later
const LOGIN_QUEUE_KEY = "loginQueue_v1";

// --- queue helpers ---
function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setQueue(q) {
  localStorage.setItem(LOGIN_QUEUE_KEY, JSON.stringify(q));
}

function queueLoginEvent(evt) {
  const q = getQueue();
  q.push(evt);
  setQueue(q);
}

// Try to send queued events. If backend still asleep, keep them.
async function flushLoginQueue(jwt, maxAttempts = 3) {
  let q = getQueue();
  if (!q.length) return;

  let attempts = 0;

  while (q.length && attempts < maxAttempts) {
    try {
      const evt = q[0];

      await fetch(`${API_BASE}/api/track-login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(evt)
      });

      // success -> remove first item and continue
      q.shift();
      setQueue(q);
    } catch (err) {
      attempts += 1;

      // small backoff before retry
      await new Promise(r => setTimeout(r, 800 * attempts));
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // restore session on refresh
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    currentUser.getSession(async (err, session) => {
      if (err || !session?.isValid()) {
        setLoading(false);
        return;
      }

      const idToken = session.getIdToken().getJwtToken();
      const payload = session.getIdToken().decodePayload();

      Cookies.set("idToken", idToken, { sameSite: "Strict", secure: true });
      setUser(payload);

      // ✅ flush any queued events on load
      try {
        await flushLoginQueue(idToken);
      } catch {
        // silent — queue stays
      }

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

    // ✅ ALWAYS queue first (so we never lose it)
    queueLoginEvent({
      appId: APP_ID,
      queuedAt: new Date().toISOString()
    });

    // ✅ Now try sending queue (if backend asleep, stays queued)
    try {
      await flushLoginQueue(jwt);
    } catch {
      // silent
    }

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

