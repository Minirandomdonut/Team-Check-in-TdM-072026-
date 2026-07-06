# Team Check-In — AI Leadership Intensive

A small web portal where each team logs its name, members (with LinkedIn),
first PM, and a one-sentence idea. Built for the Berkeley Innovation Group
AI Leadership Intensive as a live vibe-coding demo.

## What it does
- Students submit one entry per team (up to six members; one marked as first PM).
- Instructors open a passcode-gated roster with per-team cards and CSV/JSON export.

## Project structure
```
index.js            Express server + API
package.json        Dependencies and start script
public/index.html   The portal UI (form + roster)
```

## Run locally
```
npm install
npm start
```
Then open http://localhost:3000

## Deploy on Replit
Import this repo (Create App -> Import from GitHub), press Run,
then Deploy -> Autoscale for a public URL.

## Instructor passcode
Defaults to `roster2026`. Override by setting a `PASSCODE` environment
variable (in Replit: Tools -> Secrets).

## Data
Submissions are stored in Replit's built-in key-value database under `team:*` keys.
