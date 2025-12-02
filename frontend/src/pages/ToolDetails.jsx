import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";

export default function ToolDetails() {
  const { infraId } = useParams();
  const { tools, loading, error } = useData();

  const tool = useMemo(() => {
    const id = decodeURIComponent(infraId);
    return tools.find(t =>
      (t._raw?.INFRA_ID || t._raw?.infra_id || t.infraId || t.toolName) == id
    );
  }, [tools, infraId]);

  const exportJSON = () => {
    const payload = tool || {};
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${tool?.toolName || "tool"}-details.json`);
  };

  const exportCSV = () => {
    if (!tool) return;
    const flat = { ...tool, ...tool._raw };
    delete flat._raw;

    const keys = Object.keys(flat);
    const vals = keys.map(k => {
      const v = flat[k];
      if (Array.isArray(v)) return `"${v.join(", ")}"`;
      if (v == null) return "";
      return `"${String(v).replace(/"/g, '""')}"`;
    });

    const csv = `${keys.join(",")}\n${vals.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `${tool.toolName}-details.csv`);
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tool) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">Tool not found.</div>
        <Link to="/details" className="text-blue-700 underline">Back to dashboard</Link>
      </div>
    );
  }

  const raw = tool._raw || {};

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/details" className="text-blue-700 underline text-sm">
          ← Back to dashboard
        </Link>

        <div className="flex gap-3">
          <button
            onClick={exportJSON}
            className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800"
          >
            Export JSON
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-blue-100 text-blue-900 text-sm hover:bg-blue-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
        <h1 className="text-3xl font-bold text-blue-950">{tool.toolName}</h1>
        <div className="text-sm text-blue-900/70 mt-2 flex flex-wrap gap-4">
          <Meta label="Infra ID" value={raw.INFRA_ID || raw.infra_id || "—"} />
          <Meta label="Parent Org" value={tool.parentOrg || "—"} />
          <Meta label="Year Launched" value={tool.yearLaunched || "—"} />
          <Meta label="Website" value={
            raw.LINK ? (
              <a className="underline text-blue-700" href={raw.LINK} target="_blank" rel="noreferrer">
                {raw.LINK}
              </a>
            ) : "—"
          }/>
        </div>
      </div>

      {/* main two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Technology */}
        <Section title="Technology">
          <Field label="Tasks" value={(tool.tasks || []).join(", ") || "—"} />
          <Field label="Software Type" value={tool.softwareType || "—"} />
          <Field label="Expected Input" value={(tool.expectedInput || []).join(", ") || "—"} />
          <Field label="Generated Output" value={(tool.generatedOutput || []).join(", ") || "—"} />
          <Field label="Model Type" value={tool.modelType || "—"} />
          <Field label="Foundational Model" value={tool.foundationalModel || "—"} />
          <Field label="Inference Location" value={tool.inferenceLocation || "—"} />
          <Field label="Has API" value={tool.hasApi == null ? "Info Not Public" : (tool.hasApi ? "YES" : "NO")} />
          <Field label="Description" value={raw.DESCRIPTION || "—"} />
        </Section>

        {/* Business */}
        <Section title="Business">
          <Field label="Parent Organization" value={tool.parentOrg || "—"} />
          <Field label="Org Maturity" value={tool.orgMaturity || "—"} />
          <Field label="Funding Type" value={tool.fundingType || "—"} />
          <Field label="Business Model" value={tool.businessModel || "—"} />
          <Field label="Potential for IP Creation" value={tool.ipCreationPotential || "—"} />
          <Field label="Reason for IP" value={raw.REASON_FOR_IP || "—"} />
          <Field label="Legal Case Pending" value={tool.legalCasePending == null ? "Info Not Public" : (tool.legalCasePending ? "YES" : "NO")} />
          <Field label="Year Company Founded" value={tool.yearCompanyFounded || "—"} />
          <Field label="EULA Link" value={
            raw.EULA_LINK ? (
              <a className="underline text-blue-700" href={raw.EULA_LINK} target="_blank" rel="noreferrer">
                Open EULA
              </a>
            ) : "—"
          }/>
        </Section>
      </div>

      {/* raw record */}
      <details className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
        <summary className="cursor-pointer font-semibold text-blue-950">
          Full Raw Record (all fields)
        </summary>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.entries(raw).map(([k, v]) => (
            <div key={k} className="border rounded-lg p-3">
              <div className="font-semibold text-blue-900">{k}</div>
              <div className="text-slate-700 break-words mt-1">
                {String(v ?? "—")}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/* ---------- tiny UI helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border">
      <h2 className="text-xl font-bold text-blue-950 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs uppercase tracking-wide text-blue-900/60">{label}</div>
      <div className="text-sm text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <span className="text-xs uppercase text-blue-900/60">{label}:</span>{" "}
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
