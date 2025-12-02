import express from "express";
import cors from "cors";
import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "data", "tools.csv");

let toolsCache = [];

const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;

  const s = String(v).trim();
  if (!s) return [];

  // handles JSON array strings like '["A","B"]'
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        return arr.map(x => String(x).trim()).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  // handles comma, pipe, semicolon separated values
  return s.split(/[,|;]/).map(x => x.trim()).filter(Boolean);
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  const s = String(v || "").trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return true;
  if (["no", "n", "false", "0"].includes(s)) return false;
  return null;
};

const toNum = (v) => {
  const n = Number(String(v || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Flexible getter: tries multiple possible header names
const pick = (row, keys, fallback = null) => {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return row[k];
  }
  return fallback;
};

async function loadData() {
  const rows = await csv().fromFile(DATA_PATH);

  toolsCache = rows.map((r) => {
    const toolName = pick(r, ["NAME", "Tool Name", "toolName", "tool_name", "Name"]);
    const infraName = pick(
      r,
      ["INFRA_NAME", "Infra Name", "infraName", "infra_name", "NAME", "Tool Name"],
      toolName
    );
    const parentOrg = pick(
      r,
      ["PARENT_ORGANIZATION", "Parent Org", "parentOrg", "parent_org", "Provider Org"]
    );

    return {
      // Technology
      toolName,
      infraName,
      tasks: toList(pick(r, ["TASKS", "Tasks", "tasks"])),
      softwareType: pick(r, ["SOFTWARE_TYPE", "Software Type", "softwareType", "software_type"]),
      expectedInput: toList(pick(r, ["EXPECTED_INPUT", "Expected Input", "expectedInput", "expected_input"])),
      generatedOutput: toList(pick(r, ["GENERATED_OUTPUT", "Generated Output", "generatedOutput", "generated_output"])),
      modelType: pick(r, ["MODEL_PRIVATE_OR_PUBLIC", "Model Type", "modelType", "model_type"]),
      foundationalModel: pick(r, ["FOUNDATIONAL_MODEL", "Foundational Model", "foundationalModel", "foundational_model"]),
      inferenceLocation: pick(r, ["INFERENCE_LOCATION", "Inference Location", "inferenceLocation", "inference_location"]),
      hasApi: toBool(pick(r, ["HAS_API", "Has API", "hasApi", "has_api"])),
      yearLaunched: toNum(pick(r, ["YEAR_LAUNCHED", "Year Launched", "yearLaunched", "year_launched"])),

      // Business
      parentOrg,
      orgMaturity: pick(r, ["ORGANIZATION_MATURITY", "Org Maturity", "orgMaturity", "org_maturity", "Maturity"]),
      fundingType: pick(r, ["FUNDING", "Funding", "fundingType", "funding_type", "Funding Type"]),
      businessModel: pick(r, ["BUSINESS_MODEL", "Business Model", "businessModel", "business_model"]),
      ipCreationPotential: pick(r, ["POTENTIAL_FOR_IP", "Potential for IP Creation", "ipCreationPotential", "ip_creation_potential"]),
      yearCompanyFounded: toNum(pick(r, ["YEAR_COMPANY_FOUNDED", "Year Company Founded", "yearCompanyFounded", "year_company_founded"])),
      legalCasePending: toBool(pick(r, ["LEGAL_CASE_PENDING", "Legal Case Pending", "legalCasePending", "legal_case_pending"])),

      // Keep raw row for safety / future columns
      _raw: r
    };
  });

  console.log(`Loaded ${toolsCache.length} rows from tools.csv`);
}

await loadData();

// Routes
app.get("/", (req, res) => {
  res.send("AI Tools backend is running. Try /api/tools");
});

app.get("/api/tools", (req, res) => {
  res.json(toolsCache);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Optional hot reload (nice for local dev)
app.post("/api/reload", async (req, res) => {
  try {
    await loadData();
    res.json({ ok: true, rows: toolsCache.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
