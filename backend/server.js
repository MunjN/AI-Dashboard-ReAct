// import express from "express";
// import cors from "cors";
// import csv from "csvtojson";
// import path from "path";
// import mongoose from "mongoose";
// import ExportLog from "./models/ExportLog.js";
// import LoginLog from "./models/LoginLog.js";
// import jwt from "jsonwebtoken";
// import jwksClient from "jwks-rsa";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";

// dotenv.config();

// const REGION = process.env.COGNITO_REGION;
// const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
// const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

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

// async function requireUser(req, res) {
//   const auth = req.headers.authorization || "";
//   const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
//   if (!token) {
//     res.status(401).json({ error: "Missing token" });
//     return null;
//   }

//   try {
//     const decoded = await verifyCognitoToken(token);

//     const email =
//       decoded.email ||
//       decoded["cognito:username"] ||
//       decoded.username;

//     if (!email) {
//       res.status(400).json({ error: "No email in token" });
//       return null;
//     }

//     return { email, decoded, token };
//   } catch (e) {
//     res.status(401).json({ error: "Invalid token" });
//     return null;
//   }
// }

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const DATA_PATH = path.join(__dirname, "data", "tools.csv");

// let toolsCache = [];

// const toList = (v) => {
//   if (!v) return [];
//   if (Array.isArray(v)) return v;

//   const s = String(v).trim();
//   if (!s) return [];

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

//   toolsCache = rows.map((row) => {
//     const orgId = pick(row, ["ORG_ID", "org_id", "Org ID"]);
//     const orgName = pick(row, ["ORG_NAME", "org_name", "Organization", "Org Name"]);
//     const hqCountry = pick(row, ["HQ_COUNTRY", "hq_country", "Country"]);
//     const foundedYear = toNum(pick(row, ["FOUNDED_YEAR", "founded_year", "Founded"]));
//     const employeeCount = toNum(pick(row, ["EMPLOYEE_COUNT", "employee_count"]));
//     const orgSizing = pick(row, ["ORG_SIZING", "org_sizing", "Sizing"]);

//     const infra = toList(pick(row, ["INFRA_NAME", "infra_name", "Infrastructure"]));
//     const services = toList(pick(row, ["SERVICES", "services"]));
//     const contentTypes = toList(pick(row, ["CONTENT_TYPES", "content_types"]));

//     const isVendor = toBool(pick(row, ["IS_VENDOR", "is_vendor"]));
//     const isCreator = toBool(pick(row, ["IS_CREATOR", "is_creator"]));

//     return {
//       orgId,
//       orgName,
//       hqCountry,
//       foundedYear,
//       employeeCount,
//       orgSizing,
//       infra,
//       services,
//       contentTypes,
//       isVendor,
//       isCreator,
//       raw: row,
//     };
//   });
// }

// const app = express();

// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://ai-dashboard-react.netlify.app",
//     "https://ai-dashboard-react.onrender.com"
//   ],
//   credentials: true,
// }));

// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB error:", err));

/* ---------------------------
   ✅ Login tracking route
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

    if (!email) {
      return res.status(400).json({ error: "No email in token" });
    }

    const now = new Date();
    const appId = req.body?.appId || "unknown";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const ua = req.headers["user-agent"] || "";

    const doc = await LoginLog.findOneAndUpdate(
      { email },
      {
        $set: {
          lastLoginAt: now,
          lastIp: ip,
          lastUserAgent: ua,
          lastAppId: appId
        },
        $inc: { loginCount: 1 },
        $push: {
          events: { at: now, appId, ip, ua }
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      ok: true,
      email: doc.email,
      loginCount: doc.loginCount,
      lastAppId: doc.lastAppId
    });
  } catch (e) {
    console.error("track-login error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   ✅ Login stats (last 30 days + top users)
---------------------------- */
app.get("/api/login-stats", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  // Optional: limit to company domain
  if (!String(user.email).toLowerCase().endsWith("@fx-dmz.com")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const totalLoginsAgg = await LoginLog.aggregate([
      { $group: { _id: null, total: { $sum: "$loginCount" } } }
    ]);
    const totalLogins = totalLoginsAgg[0]?.total || 0;

    const uniqueUsers = await LoginLog.countDocuments({});

    const topUsers = await LoginLog.find({})
      .sort({ loginCount: -1 })
      .limit(10)
      .select({ email: 1, loginCount: 1, lastLoginAt: 1 })
      .lean();

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendAgg = await LoginLog.aggregate([
      { $unwind: "$events" },
      { $match: { "events.at": { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$events.at" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trendLast30Days = trendAgg.map(r => ({
      day: r._id,
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
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   Export tracking / credits
---------------------------- */
app.post("/api/export", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { email, decoded } = user;

  const infraIds = req.body?.infraIds;

  if (!Array.isArray(infraIds) || infraIds.length === 0) {
    return res.status(400).json({ error: "infraIds required" });
  }

  if (infraIds.length > 10) {
    return res.status(400).json({ error: "Max 5 infraIds per export" });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // load user export log
  let log = await ExportLog.findOne({ email });
  if (!log) log = await ExportLog.create({ email, events: [] });

  // count exports in last 24h
  const recentExports = log.events.filter((e) => e.at >= since).length;
  if (recentExports >= 5) {
    return res.status(429).json({ error: "Daily export limit reached" });
  }

  // ✅ session-based credits
  const authTime = decoded?.auth_time;
  if (!authTime) {
    return res.status(400).json({ error: "Missing auth_time in token" });
  }

  const sessionIdx = log.sessions.findIndex(s => s.authTime === authTime);

  if (sessionIdx === -1) {
    log.sessions.push({ authTime, exportCreditsLeft: 5 });
  }

  const session = log.sessions.find(s => s.authTime === authTime);

  if (!session || session.exportCreditsLeft <= 0) {
    return res.status(429).json({ error: "No export credits left for this session" });
  }

  session.exportCreditsLeft -= 1;

  log.events.push({
    at: now,
    infraIds
  });

  await log.save();

  res.json({
    ok: true,
    exportCreditsLeft: session.exportCreditsLeft
  });
});

/* ---------------------------
   Static + data endpoints
---------------------------- */
app.get("/", (req, res) => {
  res.send("AI Dashboard backend ok");
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
