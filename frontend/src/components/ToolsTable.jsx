import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function ToolLinkCell(params) {
  const name = params.value;
  const url = params.data?._raw?.LINK || params.data?._raw?.link;

  if (!url) return <span>{name}</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: "underline", color: "#1e5aa8", fontWeight: 500 }}
    >
      {name}
    </a>
  );
}

function EulaCell(params) {
  const eula = params.data?._raw?.EULA_LINK || params.data?._raw?.eula_link;
  if (!eula) return null;

  return (
    <a href={eula} target="_blank" rel="noreferrer" title="Open EULA">
      🌐
    </a>
  );
}

function EyeCell(params) {
  const navigate = useNavigate();
  const infraId =
    params.data?._raw?.INFRA_ID ||
    params.data?._raw?.infra_id ||
    params.data?.infraId ||
    params.data?.toolName;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
      <button
        title="View tool details"
        onClick={() => navigate(`/tool/${encodeURIComponent(infraId)}`)}
        style={{
          fontSize: 20,
          lineHeight: "20px",
          padding: "6px 8px",
          borderRadius: 8,
          cursor: "pointer",
          color: "#1e5aa8",
          background: "transparent",
          border: "1px solid #cfe0f7"
        }}
      >
        👁️
      </button>
    </div>
  );
}

export default function ToolsTable({ rows, view = "tech" }) {
  const gridRef = useRef(null);
  const [search, setSearch] = useState("");

  const commonTailCol = {
    headerName: "",
    field: "_actions",
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    pinned: "right",
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: EyeCell,
    cellStyle: { padding: 0 }
  };

  const techCols = useMemo(
    () => [
      { field: "toolName", headerName: "Tool Name", pinned: "left", cellRenderer: ToolLinkCell },
      { field: "tasks", headerName: "Tasks", valueFormatter: p => (p.value || []).join(", ") },
      { field: "softwareType", headerName: "Software Type" },
      { field: "expectedInput", headerName: "Expected Input", valueFormatter: p => (p.value || []).join(", ") },
      { field: "generatedOutput", headerName: "Generated Output", valueFormatter: p => (p.value || []).join(", ") },
      { field: "modelType", headerName: "Model Type" },
      { field: "foundationalModel", headerName: "Foundational Model" },
      { field: "inferenceLocation", headerName: "Inference Location" },
      {
        field: "hasApi",
        headerName: "Has API",
        valueFormatter: p =>
          p.value === null ? "Info Not Public" : (p.value ? "YES" : "NO")
      },
      { field: "yearLaunched", headerName: "Year Launched" },
      commonTailCol
    ],
    []
  );

  const bizCols = useMemo(
    () => [
      { field: "toolName", headerName: "Tool Name", pinned: "left", cellRenderer: ToolLinkCell },
      { field: "tasks", headerName: "Tasks", valueFormatter: p => (p.value || []).join(", ") },
      { field: "parentOrg", headerName: "Parent Org" },
      { field: "orgMaturity", headerName: "Org Maturity" },
      { field: "fundingType", headerName: "Funding" },
      { field: "businessModel", headerName: "Business Model" },
      { field: "ipCreationPotential", headerName: "Potential for IP Creation" },
      {
        headerName: "EULA",
        field: "_raw",
        width: 80,
        cellRenderer: EulaCell,
        sortable: false,
        filter: false
      },
      {
        field: "legalCasePending",
        headerName: "Legal Case Pending",
        valueFormatter: p =>
          p.value === null ? "Info Not Public" : (p.value ? "YES" : "NO")
      },
      { field: "yearCompanyFounded", headerName: "Year Company Founded" },
      commonTailCol
    ],
    []
  );

  const colDefs = view === "biz" ? bizCols : techCols;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (r.toolName || "").toLowerCase().includes(q));
  }, [rows, search]);

  const onQuickFilterChange = (val) => {
    setSearch(val);
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(val);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <input
          className="w-full max-w-md border rounded-lg px-3 py-2 text-sm"
          placeholder="Search tools by name..."
          value={search}
          onChange={(e) => onQuickFilterChange(e.target.value)}
        />
        {search && (
          <button
            className="text-sm text-blue-700 underline"
            onClick={() => onQuickFilterChange("")}
          >
            clear
          </button>
        )}
      </div>

      <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={filteredRows}
          columnDefs={colDefs}
          animateRows
          pagination
          paginationPageSize={25}
          rowHeight={54}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            wrapText: true,
            autoHeight: true
          }}
        />
      </div>
    </div>
  );
}
