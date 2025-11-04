# Quick Start Prompt (Copy-Paste This)

**Paste this at the start of each Claude Code session:**

```
Hi Claude! This is the Meteo Weather App project.

CRITICAL INSTRUCTIONS:
1. Read CLAUDE.md FIRST before doing anything
2. Workflow: Code locally → Commit → Push → STOP AND WAIT → User tests → User says "deploy" → Deploy to beta
3. NEVER deploy without explicit "deploy" command
4. Localhost uses Dockerfile.dev (webpack), Beta uses Dockerfile (nginx) - they're different
5. Always verify localhost works BEFORE deploying to beta
6. Use TodoWrite for multi-step tasks
7. Check docs/DEPLOYMENT_TESTING_CHECKLIST.md before deploying

Current status:
- Localhost: [working/broken/untested]
- Beta: [working/broken/needs update]
- Last deploy: [timestamp or "unknown"]

What I want to work on: [describe task]

Browser console errors (if any): [paste here]
```

---

## Even Shorter Version (Minimal)

```
Hi! Meteo Weather App.

Read CLAUDE.md first.
Workflow: Code → Commit → Push → WAIT → User tests → "deploy" → Deploy
Never deploy without explicit approval.
Use TodoWrite for tasks.

Task: [what you want to work on]
Status: Localhost [ok/broken], Beta [ok/broken]
```
