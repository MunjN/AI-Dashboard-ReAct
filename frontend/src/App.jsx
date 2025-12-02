import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import { FiltersProvider } from "./context/FiltersContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Details from "./pages/Details.jsx";
import Overview from "./pages/Overview.jsx";
import ToolDetails from "./pages/ToolDetails.jsx";
import AuthPage from "./pages/Auth.jsx";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <FiltersProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/details" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/details"
              element={
                <ProtectedRoute>
                  <Details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tool/:infraId"
              element={
                <ProtectedRoute>
                  <ToolDetails />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/details" />} />
          </Routes>
        </FiltersProvider>
      </DataProvider>
    </AuthProvider>
  );
}
