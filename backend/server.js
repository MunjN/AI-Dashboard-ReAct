// import express from "express";
// import cors from "cors";
// import csv from "csvtojson";
// import path from "path";
// import { fileURLToPath } from "url";
// import mongoose from "mongoose";

// // ✅ Cognito verify + logging
// import jwt from "jsonwebtoken";
// import jwksClient from "jwks-rsa";
// import LoginLog from "./models/LoginLog.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Mongo connect
// const MONGO_URI = process.env.MONGO_URI;
// mongoose.connect(MONGO_URI)
//   .then(() => console.log("✅ Mongo connected"))
//   .catch(err => console.error("❌ Mongo connection error:", err));

// /* ---------------------------
//    ✅ Cognito JWT verification
// ---------------------------- */
// const REGION = process.env.COGNITO_REGION;
// const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// const jwks = jwksClient({
//   jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
// });

// function getKey(header, callback) {
//   jwks.getSigningKey(header.kid, function (err, key) {
//     const signingKey = key?.getPublicKey();
//     callback(err, signingKey);
//   });
// }

// function verifyCognitoToken(token) {
//   return new Promise((resolve, reject) => {
//     jwt.verify(
//       token,
//       getKey,
//       {
//         issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
//       },
//       (err, decoded) => {
//         if (err) return reject(err);
//         resolve(decoded);
//       }
//     );
//   });
// }

// /* ---------------------------
//    Existing CSV loading logic
// ---------------------------- */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const DATA_PATH = path.join(__dirname, "data", "tools.csv");

// let toolsCache = [];

// const toList = (v) => {
//   if (!v) return [];
//   if (Array.isArray(v)) return v;

//   const s = String(v).trim();
//   if (!s) return [];

//   if (s.startsWith("[") && s.endsWith("]")) {
//     try {
//       const arr = JSON.parse(s);
//       if (Array.isArray(arr)) {
//         return arr.map(x => String(x).trim()).filter(Boolean);
//       }
//     } catch {
//       // fall through
//     }
//   }

//   return s.split(/[,|;]/).map(x => x.trim()).filter(Boolean);
// };

// const toBool = (v) => {
//   if (v === true || v === false) return v;
//   const s = String(v || "").trim().toLowerCase();
//   if (["yes", "y", "true", "1"].includes(s)) return true;
//   if (["no", "n", "false", "0"].includes(s)) return false;
//   return null;
// };

// const toNum = (v) => {
//   const n = Number(String(v || "").replace(/[^\d.-]/g, ""));
//   return Number.isFinite(n) ? n : null;
// };

// const pick = (row, keys, fallback = null) => {
//   for (const k of keys) {
//     if (row[k] != null && String(row[k]).trim() !== "") return row[k];
//   }
//   return fallback;
// };

// async function loadData() {
//   const rows = await csv().fromFile(DATA_PATH);

//   toolsCache = rows.map((r) => {
//     const toolName = pick(r, ["NAME", "Tool Name", "toolName", "tool_name", "Name"]);
//     const infraName = pick(
//       r,
//       ["INFRA_NAME", "Infra Name", "infraName", "infra_name", "NAME", "Tool Name"],
//       toolName
//     );
//     const parentOrg = pick(
//       r,
//       ["PARENT_ORGANIZATION", "Parent Org", "parentOrg", "parent_org", "Provider Org"]
//     );

//     return {
//       // Technology
//       toolName,
//       infraName,
//       tasks: toList(pick(r, ["TASKS", "Tasks", "tasks"])),
//       softwareType: pick(r, ["SOFTWARE_TYPE", "Software Type", "softwareType", "software_type"]),
//       expectedInput: toList(pick(r, ["EXPECTED_INPUT", "Expected Input", "expectedInput", "expected_input"])),
//       generatedOutput: toList(pick(r, ["GENERATED_OUTPUT", "Generated Output", "generatedOutput", "generated_output"])),
//       modelType: pick(r, ["MODEL_PRIVATE_OR_PUBLIC", "Model Type", "modelType", "model_type"]),
//       foundationalModel: pick(r, ["FOUNDATIONAL_MODEL", "Foundational Model", "foundationalModel", "foundational_model"]),
//       inferenceLocation: pick(r, ["INFERENCE_LOCATION", "Inference Location", "inferenceLocation", "inference_location"]),
//       hasApi: toBool(pick(r, ["HAS_API", "Has API", "hasApi", "has_api"])),
//       yearLaunched: toNum(pick(r, ["YEAR_LAUNCHED", "Year Launched", "yearLaunched", "year_launched"])),

//       // Business
//       parentOrg,
//       orgMaturity: pick(r, ["ORGANIZATION_MATURITY", "Org Maturity", "orgMaturity", "org_maturity", "Maturity"]),
//       fundingType: pick(r, ["FUNDING", "Funding", "fundingType", "funding_type", "Funding Type"]),
//       businessModel: pick(r, ["BUSINESS_MODEL", "Business Model", "businessModel", "business_model"]),
//       ipCreationPotential: pick(r, ["POTENTIAL_FOR_IP", "Potential for IP Creation", "ipCreationPotential", "ip_creation_potential"]),
//       yearCompanyFounded: toNum(pick(r, ["YEAR_COMPANY_FOUNDED", "Year Company Founded", "yearCompanyFounded", "year_company_founded"])),
//       legalCasePending: toBool(pick(r, ["LEGAL_CASE_PENDING", "Legal Case Pending", "legalCasePending", "legal_case_pending"])),

//       _raw: r
//     };
//   });

//   console.log(`Loaded ${toolsCache.length} rows from tools.csv`);
// }

// await loadData();

// /* ---------------------------
//    ✅ Login tracking route
// ---------------------------- */
// app.post("/api/track-login", async (req, res) => {
//   try {
//     const auth = req.headers.authorization || "";
//     const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//     if (!token) return res.status(401).json({ error: "Missing token" });

//     const decoded = await verifyCognitoToken(token);

//     const email =
//       decoded.email ||
//       decoded["cognito:username"] ||
//       decoded.username;

//     if (!email) return res.status(400).json({ error: "No email found in token" });

//     const appId = req.body?.appId || "unknown-app";

//     const ip =
//       req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
//       req.ip;

//     const ua = req.headers["user-agent"] || "";
//     const now = new Date();

//     const doc = await LoginLog.findOneAndUpdate(
//       { email },
//       {
//         $set: {
//           lastLoginAt: now,
//           lastIp: ip,
//           lastUserAgent: ua,
//           lastAppId: appId
//         },
//         $inc: { loginCount: 1 },
//         $push: { events: { at: now, appId, ip, ua } }
//       },
//       { upsert: true, new: true }
//     );

//     res.json({
//       ok: true,
//       email: doc.email,
//       loginCount: doc.loginCount,
//       lastAppId: doc.lastAppId
//     });
//   } catch (e) {
//     console.error("track-login error:", e);
//     res.status(401).json({ error: "Invalid token" });
//   }
// });

// /* ---------------------------
//    ✅ NEW: Login stats (ME-DMZ only)
// ---------------------------- */
// app.get("/api/login-stats", async (req, res) => {
//   try {
//     const auth = req.headers.authorization || "";
//     const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//     if (!token) return res.status(401).json({ error: "Missing token" });

//     const decoded = await verifyCognitoToken(token);

//     const email =
//       decoded.email ||
//       decoded["cognito:username"] ||
//       decoded.username;

//     if (!email) return res.status(400).json({ error: "No email found in token" });

//     // ✅ Lock to @me-dmz.com emails
//     const ok = String(email).toLowerCase().endsWith("@me-dmz.com");
//     if (!ok) return res.status(403).json({ error: "Forbidden" });

//     // --- totals ---
//     const totalLoginsAgg = await LoginLog.aggregate([
//       { $group: { _id: null, total: { $sum: "$loginCount" } } }
//     ]);
//     const totalLogins = totalLoginsAgg[0]?.total || 0;

//     const uniqueUsers = await LoginLog.countDocuments();

//     // --- top users ---
//     const topUsers = await LoginLog.find({})
//       .sort({ loginCount: -1, lastLoginAt: -1 })
//       .limit(20)
//       .select({ email: 1, loginCount: 1, lastLoginAt: 1, lastAppId: 1 });

//     // --- last 30 days trend ---
//     const since = new Date();
//     since.setDate(since.getDate() - 30);

//     const trendAgg = await LoginLog.aggregate([
//       { $unwind: "$events" },
//       { $match: { "events.at": { $gte: since } } },
//       {
//         $group: {
//           _id: {
//             day: {
//               $dateToString: { format: "%Y-%m-%d", date: "$events.at" }
//             }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id.day": 1 } }
//     ]);

//     const trendLast30Days = trendAgg.map(r => ({
//       day: r._id.day,
//       count: r.count
//     }));

//     res.json({
//       ok: true,
//       totalLogins,
//       uniqueUsers,
//       topUsers,
//       trendLast30Days
//     });
//   } catch (e) {
//     console.error("login-stats error:", e);
//     res.status(401).json({ error: "Invalid token" });
//   }
// });

// /* ---------------------------
//    Existing routes
// ---------------------------- */
// app.get("/", (req, res) => {
//   res.send("AI Tools backend is running. Try /api/tools");
// });

// app.get("/api/tools", (req, res) => {
//   res.json(toolsCache);
// });

// app.get("/api/health", (req, res) => {
//   res.json({ ok: true });
// });

// app.post("/api/reload", async (req, res) => {
//   try {
//     await loadData();
//     res.json({ ok: true, rows: toolsCache.length });
//   } catch (e) {
//     res.status(500).json({ ok: false, error: e.message });
//   }
// });

// const port = process.env.PORT || 8080;
// app.listen(port, () => {
//   console.log(`Backend running on http://localhost:${port}`);
// });


import express from "express";
import cors from "cors";
import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import LoginLog from "./models/LoginLog.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mongo connect
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.error("❌ Mongo connection error:", err));

/* ---------------------------
   ✅ Cognito JWT verification
---------------------------- */
const REGION = process.env.COGNITO_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

/* ---------------------------
   Existing CSV loading logic
---------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data", "tools.csv");

let toolsCache = [];

const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;

  const s = String(v).trim();
  if (!s) return [];

  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        return arr.map(x => String(x).trim()).filter(Boolean);
      }
    } catch {}
  }

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

      parentOrg,
      orgMaturity: pick(r, ["ORGANIZATION_MATURITY", "Org Maturity", "orgMaturity", "org_maturity", "Maturity"]),
      fundingType: pick(r, ["FUNDING", "Funding", "fundingType", "funding_type", "Funding Type"]),
      businessModel: pick(r, ["BUSINESS_MODEL", "Business Model", "businessModel", "business_model"]),
      ipCreationPotential: pick(r, ["POTENTIAL_FOR_IP", "Potential for IP Creation", "ipCreationPotential", "ip_creation_potential"]),
      yearCompanyFounded: toNum(pick(r, ["YEAR_COMPANY_FOUNDED", "Year Company Founded", "yearCompanyFounded", "year_company_founded"])),
      legalCasePending: toBool(pick(r, ["LEGAL_CASE_PENDING", "Legal Case Pending", "legalCasePending", "legal_case_pending"])),

      _raw: r
    };
  });

  console.log(`Loaded ${toolsCache.length} rows from tools.csv`);
}

await loadData();

// helper to get infraId from raw row
const getInfraId = (row) =>
  pick(row?._raw || {}, ["INFRA_ID", "Infra ID", "infraId", "infra_id", "ID", "Id"], row.infraName);

/* ---------------------------
   ✅ Login tracking route
   - also initializes export credits per login session
---------------------------- */
app.post("/api/track-login", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await verifyCognitoToken(token);

    const email =
      decoded.email ||
      decoded["cognito:username"] ||
      decoded.username;

    if (!email) return res.status(400).json({ error: "No email found in token" });

    const authTime = decoded.auth_time || null; // ✅ cognito login session marker
    const appId = req.body?.appId || "unknown-app";

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip;

    const ua = req.headers["user-agent"] || "";
    const now = new Date();

    let doc = await LoginLog.findOne({ email });

    if (!doc) doc = new LoginLog({ email, sessions: [] });

    // ✅ init export credits for this session if missing
    if (authTime != null) {
      const existing = doc.sessions.find(s => s.authTime === authTime);
      if (!existing) {
        doc.sessions.push({ authTime, exportCreditsLeft: 5 });
      }
    }

    doc.lastLoginAt = now;
    doc.lastIp = ip;
    doc.lastUserAgent = ua;
    doc.lastAppId = appId;
    doc.loginCount = (doc.loginCount || 0) + 1;

    doc.events.push({ at: now, appId, ip, ua, authTime });

    await doc.save();

    // credits left for current session (if any)
    const creditsLeft =
      authTime != null
        ? (doc.sessions.find(s => s.authTime === authTime)?.exportCreditsLeft ?? 5)
        : 5;

    res.json({
      ok: true,
      email: doc.email,
      loginCount: doc.loginCount,
      lastAppId: doc.lastAppId,
      exportCreditsLeft: creditsLeft
    });
  } catch (e) {
    console.error("track-login error:", e);
    res.status(401).json({ error: "Invalid token" });
  }
});

/* ---------------------------
   ✅ NEW: Export endpoint
   - HARD limits on backend
   - max 5 rows per export
   - max 5 credits per login session
---------------------------- */
app.post("/api/export", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await verifyCognitoToken(token);

    const email =
      decoded.email ||
      decoded["cognito:username"] ||
      decoded.username;

    if (!email) return res.status(400).json({ error: "No email found in token" });

    const authTime = decoded.auth_time || null;

    const infraIds = Array.isArray(req.body?.infraIds) ? req.body.infraIds : [];
    const format = (req.body?.format || "json").toLowerCase();

    if (!infraIds.length) {
      return res.status(400).json({ error: "No infraIds provided" });
    }

    if (infraIds.length > 5) {
      return res.status(400).json({ error: "Max 5 tools per export" });
    }

    let doc = await LoginLog.findOne({ email });
    if (!doc) doc = new LoginLog({ email, sessions: [] });

    // ensure session exists
    if (authTime != null) {
      let session = doc.sessions.find(s => s.authTime === authTime);
      if (!session) {
        session = { authTime, exportCreditsLeft: 5 };
        doc.sessions.push(session);
      }

      if ((session.exportCreditsLeft || 0) < infraIds.length) {
        return res.status(403).json({
          error: "Export limit reached for this login",
          exportCreditsLeft: session.exportCreditsLeft || 0
        });
      }

      // decrement credits by number of rows exported
      session.exportCreditsLeft -= infraIds.length;
    }

    await doc.save();

    // pull selected rows
    const selected = toolsCache.filter(r =>
      infraIds.includes(String(getInfraId(r)))
    );

    // if some ids not found, still return what we have
    if (format === "csv") {
      const cols = [
        "toolName",
        "infraName",
        "parentOrg",
        "foundationalModel",
        "modelType",
        "softwareType",
        "inferenceLocation",
        "yearLaunched",
        "businessModel",
        "fundingType",
        "orgMaturity",
        "ipCreationPotential",
        "yearCompanyFounded",
        "hasApi",
        "legalCasePending"
      ];

      const header = cols.join(",");
      const rows = selected.map(r =>
        cols.map(c => {
          const val = r[c];
          const s = val == null ? "" : String(val).replace(/"/g, '""');
          return `"${s}"`;
        }).join(",")
      );

      const csvOut = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="tools-export.csv"`);
      return res.send(csvOut);
    }

    // default json
    res.json({
      ok: true,
      exportCreditsLeft:
        authTime != null
          ? (doc.sessions.find(s => s.authTime === authTime)?.exportCreditsLeft ?? 0)
          : 0,
      rows: selected
    });
  } catch (e) {
    console.error("export error:", e);
    res.status(401).json({ error: "Invalid token" });
  }
});

/* ---------------------------
   ✅ Login stats (ME-DMZ only)
---------------------------- */
app.get("/api/login-stats", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await verifyCognitoToken(token);

    const email =
      decoded.email ||
      decoded["cognito:username"] ||
      decoded.username;

    if (!email) return res.status(400).json({ error: "No email found in token" });

    const ok = String(email).toLowerCase().endsWith("@me-dmz.com");
    if (!ok) return res.status(403).json({ error: "Forbidden" });

    const totalLoginsAgg = await LoginLog.aggregate([
      { $group: { _id: null, total: { $sum: "$loginCount" } } }
    ]);
    const totalLogins = totalLoginsAgg[0]?.total || 0;

    const uniqueUsers = await LoginLog.countDocuments();

    const topUsers = await LoginLog.find({})
      .sort({ loginCount: -1, lastLoginAt: -1 })
      .limit(20)
      .select({ email: 1, loginCount: 1, lastLoginAt: 1, lastAppId: 1 });

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const trendAgg = await LoginLog.aggregate([
      { $unwind: "$events" },
      { $match: { "events.at": { $gte: since } } },
      {
        $group: {
          _id: {
            day: {
              $dateToString: { format: "%Y-%m-%d", date: "$events.at" }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    const trendLast30Days = trendAgg.map(r => ({
      day: r._id.day,
      count: r.count
    }));

    res.json({
      ok: true,
      totalLogins,
      uniqueUsers,
      topUsers,
      trendLast30Days
    });
  } catch (e) {
    console.error("login-stats error:", e);
    res.status(401).json({ error: "Invalid token" });
  }
});

/* ---------------------------
   Existing routes
---------------------------- */
app.get("/", (req, res) => {
  res.send("AI Tools backend is running. Try /api/tools");
});

app.get("/api/tools", (req, res) => {
  res.json(toolsCache);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

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

