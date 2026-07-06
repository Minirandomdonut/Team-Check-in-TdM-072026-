// AI Leadership Intensive - team check-in server
// Serves the portal and stores submissions in Replit's built-in database.
const express = require("express");
const Database = require("@replit/database");

const db = new Database();
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Change the passcode by adding a Secret named PASSCODE in Replit (Tools > Secrets).
const PASSCODE = process.env.PASSCODE || "roster2026";

function checkCode(req) {
  const code = (req.query.code || (req.body && req.body.code) || "").toString();
  return code === PASSCODE;
}

app.post("/api/submit", async (req, res) => {
  try {
    const { teamName, members, idea } = req.body || {};
    if (!teamName || !Array.isArray(members) || members.length === 0 || !idea) {
      return res.status(400).json({ error: "Missing team name, members, or idea." });
    }
    const clean = {
      teamName: String(teamName).slice(0, 120),
      idea: String(idea).slice(0, 240),
      members: members.filter(m => m && m.name).slice(0, 6).map(m => ({
        name: String(m.name).slice(0, 120),
        linkedin: String(m.linkedin || "").slice(0, 300),
        isPM: !!m.isPM
      })),
      ts: Date.now()
    };
    const key = "team:" + clean.ts + "_" + Math.random().toString(36).slice(2, 7);
    await db.set(key, clean);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Save failed." });
  }
});

async function loadAll() {
  const keys = await db.list("team:");
  const out = [];
  for (const k of keys) { const v = await db.get(k); if (v) out.push({ key: k, ...v }); }
  out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return out;
}
function dedupe(raw) {
  const byName = {};
  for (const r of raw) byName[(r.teamName || "-").trim().toLowerCase()] = r;
  return Object.values(byName).sort((a, b) => (a.teamName || "").localeCompare(b.teamName || ""));
}

app.get("/api/roster", async (req, res) => {
  if (!checkCode(req)) return res.status(401).json({ error: "Bad passcode." });
  try { res.json({ teams: dedupe(await loadAll()) }); }
  catch (e) { res.status(500).json({ error: "Load failed." }); }
});

app.post("/api/clear", async (req, res) => {
  if (!checkCode(req)) return res.status(401).json({ error: "Bad passcode." });
  try { const keys = await db.list("team:"); for (const k of keys) await db.delete(k); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: "Clear failed." }); }
});

app.get("/api/export.csv", async (req, res) => {
  if (!checkCode(req)) return res.status(401).send("Unauthorized");
  const teams = dedupe(await loadAll());
  const lines = [["team", "member", "linkedin", "isPM", "idea", "submittedAt"].join(",")];
  for (const t of teams) {
    const when = new Date(t.ts).toISOString();
    (t.members || []).forEach(m => {
      lines.push([t.teamName, m.name, m.linkedin || "", m.isPM ? "yes" : "", t.idea || "", when]
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=team-checkins.csv");
  res.send(lines.join("\n"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Portal running on port " + PORT));
