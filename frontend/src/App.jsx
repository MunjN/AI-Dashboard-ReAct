import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import { FiltersProvider } from "./context/FiltersContext.jsx";
import Details from "./pages/Details.jsx";
import Overview from "./pages/Overview.jsx";
import ToolDetails from "./pages/ToolDetails.jsx";

export default function App() {
  return (
    <DataProvider>
      <FiltersProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/details" />} />
          <Route path="/details" element={<Details />} />
          <Route path="/overview" element={<Overview />} />

          {/* NEW: tool details page */}
          <Route path="/tool/:infraId" element={<ToolDetails />} />

          <Route path="*" element={<Navigate to="/details" />} />
        </Routes>
      </FiltersProvider>
    </DataProvider>
  );
}
