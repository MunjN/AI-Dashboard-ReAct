// // import React, { useMemo, useRef, useState } from "react";
// // import { AgGridReact } from "ag-grid-react";
// // import { useNavigate } from "react-router-dom";
// // import "ag-grid-community/styles/ag-grid.css";
// // import "ag-grid-community/styles/ag-theme-alpine.css";

// // function ToolLinkCell(params) {
// //   const name = params.value;
// //   const url = params.data?._raw?.LINK || params.data?._raw?.link;

// //   if (!url) return <span>{name}</span>;

// //   return (
// //     <a
// //       href={url}
// //       target="_blank"
// //       rel="noreferrer"
// //       style={{ textDecoration: "underline", color: "#1e5aa8", fontWeight: 500 }}
// //     >
// //       {name}
// //     </a>
// //   );
// // }

// // function EulaCell(params) {
// //   const eula = params.data?._raw?.EULA_LINK || params.data?._raw?.eula_link;
// //   if (!eula) return null;

// //   return (
// //     <a href={eula} target="_blank" rel="noreferrer" title="Open EULA">
// //       🌐
// //     </a>
// //   );
// // }

// // function EyeCell(params) {
// //   const navigate = useNavigate();
// //   const infraId =
// //     params.data?._raw?.INFRA_ID ||
// //     params.data?._raw?.infra_id ||
// //     params.data?.infraId ||
// //     params.data?.toolName;

// //   return (
// //     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
// //       <button
// //         title="View tool details"
// //         onClick={() => navigate(`/tool/${encodeURIComponent(infraId)}`)}
// //         style={{
// //           fontSize: 20,
// //           lineHeight: "20px",
// //           padding: "6px 8px",
// //           borderRadius: 8,
// //           cursor: "pointer",
// //           color: "#1e5aa8",
// //           background: "transparent",
// //           border: "1px solid #cfe0f7"
// //         }}
// //       >
// //         👁️
// //       </button>
// //     </div>
// //   );
// // }

// // export default function ToolsTable({ rows, view = "tech" }) {
// //   const gridRef = useRef(null);
// //   const [search, setSearch] = useState("");

// //   const commonTailCol = {
// //     headerName: "",
// //     field: "_actions",
// //     width: 70,
// //     minWidth: 70,
// //     maxWidth: 70,
// //     pinned: "right",
// //     sortable: false,
// //     filter: false,
// //     resizable: false,
// //     cellRenderer: EyeCell,
// //     cellStyle: { padding: 0 }
// //   };

// //   const techCols = useMemo(
// //     () => [
// //       { field: "toolName", headerName: "Tool Name", pinned: "left", cellRenderer: ToolLinkCell },
// //       { field: "tasks", headerName: "Tasks", valueFormatter: p => (p.value || []).join(", ") },
// //       { field: "softwareType", headerName: "Software Type" },
// //       { field: "expectedInput", headerName: "Expected Input", valueFormatter: p => (p.value || []).join(", ") },
// //       { field: "generatedOutput", headerName: "Generated Output", valueFormatter: p => (p.value || []).join(", ") },
// //       { field: "modelType", headerName: "Model Type" },
// //       { field: "foundationalModel", headerName: "Foundational Model" },
// //       { field: "inferenceLocation", headerName: "Inference Location" },
// //       {
// //         field: "hasApi",
// //         headerName: "Has API",
// //         valueFormatter: p =>
// //           p.value === null ? "Info Not Public" : (p.value ? "YES" : "NO")
// //       },
// //       { field: "yearLaunched", headerName: "Year Launched" },
// //       commonTailCol
// //     ],
// //     []
// //   );

// //   const bizCols = useMemo(
// //     () => [
// //       { field: "toolName", headerName: "Tool Name", pinned: "left", cellRenderer: ToolLinkCell },
// //       { field: "tasks", headerName: "Tasks", valueFormatter: p => (p.value || []).join(", ") },
// //       { field: "parentOrg", headerName: "Parent Org" },
// //       { field: "orgMaturity", headerName: "Org Maturity" },
// //       { field: "fundingType", headerName: "Funding" },
// //       { field: "businessModel", headerName: "Business Model" },
// //       { field: "ipCreationPotential", headerName: "Potential for IP Creation" },
// //       {
// //         headerName: "EULA",
// //         field: "_raw",
// //         width: 80,
// //         cellRenderer: EulaCell,
// //         sortable: false,
// //         filter: false
// //       },
// //       {
// //         field: "legalCasePending",
// //         headerName: "Legal Case Pending",
// //         valueFormatter: p =>
// //           p.value === null ? "Info Not Public" : (p.value ? "YES" : "NO")
// //       },
// //       { field: "yearCompanyFounded", headerName: "Year Company Founded" },
// //       commonTailCol
// //     ],
// //     []
// //   );

// //   const colDefs = view === "biz" ? bizCols : techCols;

// //   const filteredRows = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return rows;
// //     return rows.filter(r => (r.toolName || "").toLowerCase().includes(q));
// //   }, [rows, search]);

// //   const onQuickFilterChange = (val) => {
// //     setSearch(val);
// //     if (gridRef.current?.api) {
// //       gridRef.current.api.setQuickFilter(val);
// //     }
// //   };

// //   return (
// //     <div>
// //       <div className="mb-2 flex items-center gap-2">
// //         <input
// //           className="w-full max-w-md border rounded-lg px-3 py-2 text-sm"
// //           placeholder="Search tools by name..."
// //           value={search}
// //           onChange={(e) => onQuickFilterChange(e.target.value)}
// //         />
// //         {search && (
// //           <button
// //             className="text-sm text-blue-700 underline"
// //             onClick={() => onQuickFilterChange("")}
// //           >
// //             clear
// //           </button>
// //         )}
// //       </div>

// //       <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
// //         <AgGridReact
// //           ref={gridRef}
// //           rowData={filteredRows}
// //           columnDefs={colDefs}
// //           animateRows
// //           pagination
// //           paginationPageSize={25}
// //           rowHeight={54}
// //           defaultColDef={{
// //             resizable: true,
// //             sortable: true,
// //             filter: true,
// //             wrapText: true,
// //             autoHeight: true
// //           }}
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// import { useMemo, useRef, useState } from "react";
// import { AgGridReact } from "ag-grid-react";
// import Cookies from "js-cookie";
// import { Link } from "react-router-dom";

// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

// const MAX_SELECT = 10;

// export default function ToolsTable({ rows = [], view = "tech" }) {
//   const gridRef = useRef(null);

//   const [selectedIds, setSelectedIds] = useState([]);
//   const [exportCreditsLeft, setExportCreditsLeft] = useState(null);
//   const [exporting, setExporting] = useState(false);
//   const [notice, setNotice] = useState("");

//   // --- helper: infraId for routing/export
//   const getInfraId = (r) =>
//     r?.infraId ||
//     r?._raw?.INFRA_ID ||
//     r?._raw?.infra_id ||
//     r?.INFRA_ID ||
//     r?.infra_id ||
//     null;

//   // --- subtle notice
//   const flashNotice = (msg) => {
//     setNotice(msg);
//     setTimeout(() => setNotice(""), 1800);
//   };

//   // --- columns
//   const techCols = [
//     {
//       headerName: "",
//       field: "__select",
//       checkboxSelection: true,
//       headerCheckboxSelection: false,
//       width: 44,
//       pinned: "left",
//       suppressMenu: true,
//       sortable: false,
//       resizable: false
//     },
//     {
//       headerName: "Tool Name",
//       field: "toolName",
//       pinned: "left",
//       minWidth: 180,
//       flex: 1,
//       cellRenderer: (p) => {
//         const infraId = getInfraId(p.data);
//         if (!infraId) return p.value || "";
//         return (
//           <Link
//             to={`/tool/${infraId}`}
//             className="text-blue-700 font-semibold hover:underline"
//           >
//             {p.value}
//           </Link>
//         );
//       }
//     },
//     {
//       headerName: "Tasks",
//       field: "tasks",
//       minWidth: 260,
//       flex: 2,
//       valueFormatter: (p) => (p.value || []).join(", ")
//     },
//     { headerName: "Software Type", field: "softwareType", minWidth: 170 },
//     {
//       headerName: "Expected Input",
//       field: "expectedInput",
//       minWidth: 170,
//       valueFormatter: (p) => (p.value || []).join(", ")
//     },
//     {
//       headerName: "Generated Output",
//       field: "generatedOutput",
//       minWidth: 170,
//       valueFormatter: (p) => (p.value || []).join(", ")
//     },
//     { headerName: "Model Type", field: "modelType", minWidth: 130 },
//     { headerName: "Foundational Model", field: "foundationalModel", minWidth: 170 },
//     { headerName: "Inference Location", field: "inferenceLocation", minWidth: 160 },
//     {
//       headerName: "Has API",
//       field: "hasApi",
//       minWidth: 100,
//       valueFormatter: (p) =>
//         p.value === true ? "YES" : p.value === false ? "NO" : "—"
//     },
//     {
//       headerName: "Year Launched",
//       field: "yearLaunched",
//       minWidth: 120
//     }
//   ];

//   const bizCols = [
//     {
//       headerName: "",
//       field: "__select",
//       checkboxSelection: true,
//       headerCheckboxSelection: false,
//       width: 44,
//       pinned: "left",
//       suppressMenu: true,
//       sortable: false,
//       resizable: false
//     },
//     {
//       headerName: "Tool Name",
//       field: "toolName",
//       pinned: "left",
//       minWidth: 180,
//       flex: 1,
//       cellRenderer: (p) => {
//         const infraId = getInfraId(p.data);
//         if (!infraId) return p.value || "";
//         return (
//           <Link
//             to={`/tool/${infraId}`}
//             className="text-blue-700 font-semibold hover:underline"
//           >
//             {p.value}
//           </Link>
//         );
//       }
//     },
//     {
//       headerName: "Tasks",
//       field: "tasks",
//       minWidth: 260,
//       flex: 2,
//       valueFormatter: (p) => (p.value || []).join(", ")
//     },
//     { headerName: "Parent Org", field: "parentOrg", minWidth: 160 },
//     { headerName: "Org Maturity", field: "orgMaturity", minWidth: 120 },
//     { headerName: "Funding", field: "fundingType", minWidth: 120 },
//     { headerName: "Business Model", field: "businessModel", minWidth: 170 },
//     {
//       headerName: "Potential for IP Creation",
//       field: "ipCreationPotential",
//       minWidth: 185
//     },
//     {
//       headerName: "EULA",
//       field: "_raw",
//       minWidth: 70,
//       cellRenderer: (p) => {
//         const url =
//           p?.data?._raw?.EULA_LINK ||
//           p?.data?._raw?.eula_link ||
//           p?.data?._raw?.LINK;
//         return url ? (
//           <a
//             href={url}
//             target="_blank"
//             rel="noreferrer"
//             className="text-blue-700 hover:underline"
//           >
//             🌐
//           </a>
//         ) : (
//           "—"
//         );
//       }
//     },
//     {
//       headerName: "Legal Case Pending",
//       field: "legalCasePending",
//       minWidth: 145,
//       valueFormatter: (p) =>
//         p.value === true ? "YES" : p.value === false ? "NO" : "Info Not Public"
//     },
//     {
//       headerName: "Year Company Founded",
//       field: "yearCompanyFounded",
//       minWidth: 160
//     }
//   ];

//   const columnDefs = useMemo(
//     () => (view === "biz" ? bizCols : techCols),
//     [view]
//   );

//   // --- selection control (hard max 10)
//   const onSelectionChanged = () => {
//     const api = gridRef.current?.api;
//     if (!api) return;

//     const selected = api.getSelectedRows();
//     if (selected.length > MAX_SELECT) {
//       // remove the last-selected row
//       const last = selected[selected.length - 1];
//       api.deselectNode(api.getRowNode(last.__rowId));
//       flashNotice(`Max ${MAX_SELECT} selections per export.`);
//       return;
//     }

//     const ids = selected
//       .map(getInfraId)
//       .filter(Boolean);

//     setSelectedIds(ids);
//   };

//   // add stable row ids so deselect works properly
//   const rowData = useMemo(() => {
//     return rows.map((r, i) => ({
//       ...r,
//       __rowId: String(getInfraId(r) || i)
//     }));
//   }, [rows]);

//   const getRowId = (p) => p.data.__rowId;

//   // --- download helper
//   const downloadBlob = (content, filename, type) => {
//     const blob = new Blob([content], { type });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//   };

//   // --- export call
//   const doExport = async (format) => {
//     if (selectedIds.length === 0) return;
//     if (selectedIds.length > MAX_SELECT) {
//       flashNotice(`Select up to ${MAX_SELECT}.`);
//       return;
//     }

//     setExporting(true);
//     try {
//       const token = Cookies.get("idToken");
//       if (!token) {
//         flashNotice("Please sign in again.");
//         setExporting(false);
//         return;
//       }

//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE}/api/export`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             infraIds: selectedIds,
//             format
//           })
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         flashNotice(data?.error || "Export failed.");
//         setExporting(false);
//         return;
//       }

//       setExportCreditsLeft(data.exportCreditsLeft);

//       if (format === "json") {
//         downloadBlob(
//           JSON.stringify(data.rows, null, 2),
//           `ai-tools-export-${selectedIds.length}.json`,
//           "application/json"
//         );
//       } else {
//         // backend should send { csv: "..." } OR rows
//         const csvText =
//           data.csv ||
//           rowsToCSV(data.rows || []);
//         downloadBlob(
//           csvText,
//           `ai-tools-export-${selectedIds.length}.csv`,
//           "text/csv"
//         );
//       }

//       flashNotice("Exported ✓");
//     } catch (e) {
//       console.error(e);
//       flashNotice("Export failed.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   // fallback csv builder (only if backend doesn't send csv)
//   const rowsToCSV = (arr) => {
//     if (!arr.length) return "";
//     const keys = Object.keys(arr[0]).filter(k => k !== "_raw");
//     const header = keys.join(",");
//     const body = arr.map(r =>
//       keys.map(k => {
//         const v = r[k];
//         if (Array.isArray(v)) return `"${v.join("; ")}"`;
//         if (v == null) return "";
//         return `"${String(v).replace(/"/g, '""')}"`
//       }).join(",")
//     ).join("\n");
//     return `${header}\n${body}`;
//   };

//   return (
//     <div className="w-full">
//       {/* subtle toolbar */}
//       <div className="flex items-center justify-between mb-2 px-1">
//         <div className="text-sm text-blue-950/80">
//           Selected: <span className="font-semibold">{selectedIds.length}</span> / {MAX_SELECT}
//         </div>

//         <div className="flex items-center gap-3 text-sm">
//           {exportCreditsLeft != null && (
//             <div className="text-blue-950/70">
//               Exports left today:{" "}
//               <span className="font-semibold">{exportCreditsLeft}</span>
//             </div>
//           )}

//           <button
//             disabled={exporting || selectedIds.length === 0}
//             onClick={() => doExport("json")}
//             className={`
//               px-3 py-1.5 rounded-lg text-xs font-semibold transition
//               ${exporting || selectedIds.length === 0
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-blue-700 text-white hover:bg-blue-800"}
//             `}
//             title="Export selected as JSON"
//           >
//             Export JSON
//           </button>

//           <button
//             disabled={exporting || selectedIds.length === 0}
//             onClick={() => doExport("csv")}
//             className={`
//               px-3 py-1.5 rounded-lg text-xs font-semibold transition
//               ${exporting || selectedIds.length === 0
//                 ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 : "bg-blue-700 text-white hover:bg-blue-800"}
//             `}
//             title="Export selected as CSV"
//           >
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {notice && (
//         <div className="mb-2 text-xs text-blue-700 px-1">
//           {notice}
//         </div>
//       )}

//       <div
//         className="ag-theme-alpine"
//         style={{ width: "100%", height: "72vh" }}
//       >
//         <AgGridReact
//           ref={gridRef}
//           rowData={rowData}
//           columnDefs={columnDefs}
//           getRowId={getRowId}
//           rowSelection="multiple"
//           suppressRowClickSelection={true}
//           onSelectionChanged={onSelectionChanged}
//           pagination={true}
//           paginationPageSize={25}
//           paginationPageSizeSelector={[20, 25, 50, 100]}
//           defaultColDef={{
//             sortable: true,
//             filter: true,
//             resizable: true
//           }}
//         />
//       </div>
//     </div>
//   );
// }


import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const MAX_SELECT = 10;

export default function ToolsTable({ rows = [], view = "tech" }) {
  const gridRef = useRef(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [exportCreditsLeft, setExportCreditsLeft] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("");

  // --- helper: infraId for routing/export
  const getInfraId = (r) =>
    r?.infraId ||
    r?._raw?.INFRA_ID ||
    r?._raw?.infra_id ||
    r?.INFRA_ID ||
    r?.infra_id ||
    null;

  // --- subtle notice
  const flashNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2200);
  };

  // --- columns
  const techCols = [
    {
      headerName: "",
      field: "__select",
      checkboxSelection: true,
      headerCheckboxSelection: false,
      width: 44,
      pinned: "left",
      suppressMenu: true,
      sortable: false,
      resizable: false
    },
    {
      headerName: "Tool Name",
      field: "toolName",
      pinned: "left",
      minWidth: 180,
      flex: 1,
      cellRenderer: (p) => {
        const infraId = getInfraId(p.data);
        if (!infraId) return p.value || "";
        return (
          <Link
            to={`/tool/${infraId}`}
            className="text-blue-700 font-semibold hover:underline"
          >
            {p.value}
          </Link>
        );
      }
    },
    {
      headerName: "Tasks",
      field: "tasks",
      minWidth: 260,
      flex: 2,
      valueFormatter: (p) => (p.value || []).join(", ")
    },
    { headerName: "Software Type", field: "softwareType", minWidth: 170 },
    {
      headerName: "Expected Input",
      field: "expectedInput",
      minWidth: 170,
      valueFormatter: (p) => (p.value || []).join(", ")
    },
    {
      headerName: "Generated Output",
      field: "generatedOutput",
      minWidth: 170,
      valueFormatter: (p) => (p.value || []).join(", ")
    },
    { headerName: "Model Type", field: "modelType", minWidth: 130 },
    { headerName: "Foundational Model", field: "foundationalModel", minWidth: 170 },
    { headerName: "Inference Location", field: "inferenceLocation", minWidth: 160 },
    {
      headerName: "Has API",
      field: "hasApi",
      minWidth: 100,
      valueFormatter: (p) =>
        p.value === true ? "YES" : p.value === false ? "NO" : "—"
    },
    {
      headerName: "Year Launched",
      field: "yearLaunched",
      minWidth: 120
    }
  ];

  const bizCols = [
    {
      headerName: "",
      field: "__select",
      checkboxSelection: true,
      headerCheckboxSelection: false,
      width: 44,
      pinned: "left",
      suppressMenu: true,
      sortable: false,
      resizable: false
    },
    {
      headerName: "Tool Name",
      field: "toolName",
      pinned: "left",
      minWidth: 180,
      flex: 1,
      cellRenderer: (p) => {
        const infraId = getInfraId(p.data);
        if (!infraId) return p.value || "";
        return (
          <Link
            to={`/tool/${infraId}`}
            className="text-blue-700 font-semibold hover:underline"
          >
            {p.value}
          </Link>
        );
      }
    },
    {
      headerName: "Tasks",
      field: "tasks",
      minWidth: 260,
      flex: 2,
      valueFormatter: (p) => (p.value || []).join(", ")
    },
    { headerName: "Parent Org", field: "parentOrg", minWidth: 160 },
    { headerName: "Org Maturity", field: "orgMaturity", minWidth: 120 },
    { headerName: "Funding", field: "fundingType", minWidth: 120 },
    { headerName: "Business Model", field: "businessModel", minWidth: 170 },
    {
      headerName: "Potential for IP Creation",
      field: "ipCreationPotential",
      minWidth: 185
    },
    {
      headerName: "EULA",
      field: "_raw",
      minWidth: 70,
      cellRenderer: (p) => {
        const url =
          p?.data?._raw?.EULA_LINK ||
          p?.data?._raw?.eula_link ||
          p?.data?._raw?.LINK;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:underline"
          >
            🌐
          </a>
        ) : (
          "—"
        );
      }
    },
    {
      headerName: "Legal Case Pending",
      field: "legalCasePending",
      minWidth: 145,
      valueFormatter: (p) =>
        p.value === true ? "YES" : p.value === false ? "NO" : "Info Not Public"
    },
    {
      headerName: "Year Company Founded",
      field: "yearCompanyFounded",
      minWidth: 160
    }
  ];

  const columnDefs = useMemo(
    () => (view === "biz" ? bizCols : techCols),
    [view]
  );

  // add stable row ids so deselect works properly
  const rowData = useMemo(() => {
    return rows.map((r, i) => ({
      ...r,
      __rowId: String(getInfraId(r) || i)
    }));
  }, [rows]);

  const getRowId = (p) => p.data.__rowId;

  // --- selection control (hard max 10)
  const onSelectionChanged = () => {
    const api = gridRef.current?.api;
    if (!api) return;

    const selected = api.getSelectedRows();
    if (selected.length > MAX_SELECT) {
      // remove the last-selected row
      const last = selected[selected.length - 1];
      api.deselectNode(api.getRowNode(last.__rowId));
      flashNotice(`Max ${MAX_SELECT} selections per export.`);
      return;
    }

    const ids = selected.map(getInfraId).filter(Boolean);
    setSelectedIds(ids);
  };

  // --- select all / deselect all respecting max 10
  const toggleSelectAll = () => {
    const api = gridRef.current?.api;
    if (!api) return;

    if (selectedIds.length > 0) {
      api.deselectAll();
      setSelectedIds([]);
      return;
    }

    const ids = [];
    api.forEachNodeAfterFilterAndSort((node) => {
      if (ids.length < MAX_SELECT) {
        node.setSelected(true);
        ids.push(getInfraId(node.data));
      }
    });

    if (api.getSelectedRows().length > MAX_SELECT) {
      flashNotice(`Only first ${MAX_SELECT} rows were selected.`);
    }

    setSelectedIds(ids.filter(Boolean));
  };

  // --- download helper
  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // fallback csv builder (only if backend doesn't send csv)
  const rowsToCSV = (arr) => {
    if (!arr.length) return "";
    const keys = Object.keys(arr[0]).filter(k => k !== "_raw");
    const header = keys.join(",");
    const body = arr.map(r =>
      keys.map(k => {
        const v = r[k];
        if (Array.isArray(v)) return `"${v.join("; ")}"`;
        if (v == null) return "";
        return `"${String(v).replace(/"/g, '""')}"`
      }).join(",")
    ).join("\n");
    return `${header}\n${body}`;
  };

  // --- export call
  const doExport = async (format) => {
    if (selectedIds.length === 0) {
      flashNotice("Select up to 10 tools first.");
      return;
    }

    if (selectedIds.length > MAX_SELECT) {
      flashNotice(`Select max ${MAX_SELECT}.`);
      return;
    }

    // if we already know credits, guard locally too
    if (exportCreditsLeft != null && exportCreditsLeft <= 0) {
      flashNotice("No exports left for today.");
      return;
    }
    if (exportCreditsLeft != null && selectedIds.length > exportCreditsLeft) {
      flashNotice(`You only have ${exportCreditsLeft} exports left today.`);
      return;
    }

    setExporting(true);
    try {
      const token = Cookies.get("idToken");
      if (!token) {
        flashNotice("Please sign in again.");
        setExporting(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            infraIds: selectedIds,
            format
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        flashNotice(data?.error || "Export failed.");
        // server is source of truth for remaining credits
        if (data?.exportCreditsLeft != null) {
          setExportCreditsLeft(data.exportCreditsLeft);
        }
        setExporting(false);
        return;
      }

      setExportCreditsLeft(data.exportCreditsLeft);

      if (format === "json") {
        downloadBlob(
          JSON.stringify(data.rows, null, 2),
          `ai-tools-export-${selectedIds.length}.json`,
          "application/json"
        );
      } else {
        const csvText = data.csv || rowsToCSV(data.rows || []);
        downloadBlob(
          csvText,
          `ai-tools-export-${selectedIds.length}.csv`,
          "text/csv"
        );
      }

      flashNotice("Exported ✓");
    } catch (e) {
      console.error(e);
      flashNotice("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full">
      {/* subtle toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 text-sm text-blue-950/80">
          <button
            onClick={toggleSelectAll}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-blue-950"
            title={selectedIds.length ? "Deselect all" : "Select up to 10"}
          >
            {selectedIds.length ? "Deselect All" : "Select All"}
          </button>

          <div>
            Selected:{" "}
            <span className="font-semibold">{selectedIds.length}</span> / {MAX_SELECT}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {exportCreditsLeft != null && (
            <div className="text-blue-950/70">
              Exports left today:{" "}
              <span className="font-semibold">{exportCreditsLeft}</span>
            </div>
          )}

          <button
            disabled={exporting || selectedIds.length === 0}
            onClick={() => doExport("json")}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition
              ${exporting || selectedIds.length === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"}
            `}
            title="Export selected as JSON"
          >
            Export JSON
          </button>

          <button
            disabled={exporting || selectedIds.length === 0}
            onClick={() => doExport("csv")}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition
              ${exporting || selectedIds.length === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"}
            `}
            title="Export selected as CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-2 text-xs text-blue-700 px-1">
          {notice}
        </div>
      )}

      <div
        className="ag-theme-alpine"
        style={{ width: "100%", height: "72vh" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={getRowId}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={25}
          paginationPageSizeSelector={[20, 25, 50, 100]}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
        />
      </div>
    </div>
  );
}

