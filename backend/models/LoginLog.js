import mongoose from "mongoose";

const LoginLogSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, required: true },

    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },

    // track which app/link they used
    lastAppId: { type: String },

    // optional extras (nice to have)
    lastIp: String,
    lastUserAgent: String,

    // raw login events
    events: [
      {
        at: Date,
        appId: String,
        ip: String,
        ua: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("LoginLog", LoginLogSchema);
