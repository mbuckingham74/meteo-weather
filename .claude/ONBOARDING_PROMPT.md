# Claude Code Session Onboarding Prompt

**Copy and paste this at the start of each new Claude Code session:**

---

## Quick Context

This is the **Meteo Weather App** - a Weather Spark clone with React frontend, Node.js/Express backend, MySQL database, and Claude AI integration.

## Critical Instructions

### 1. **Read .claude/INSTRUCTIONS.md First**
Before doing ANYTHING, read `/Users/michaelbuckingham/Documents/meteo-app/.claude/INSTRUCTIONS.md` - it contains:
- Development workflow (STOP AND WAIT after pushing to GitHub)
- Pre-deployment checklist (must verify localhost FIRST)
- Project architecture and features
- Security guidelines
- Localhost vs beta Docker differences

### 2. **Development Workflow (NON-NEGOTIABLE)**
```
1. Implement locally
2. Commit to git
3. Push to GitHub
4. ⛔ STOP AND WAIT - DO NOT DEPLOY
5. User tests localhost
6. User explicitly says "deploy"
7. Then deploy to beta
```

**NEVER deploy without explicit "deploy" command from user.**

### 3. **Docker Configuration**
- **Localhost:** Uses `Dockerfile.dev` with webpack-dev-server (hot reload)
- **Beta:** Uses `Dockerfile` (production) with nginx static build
- These ARE DIFFERENT and will produce different results
- Always test localhost before deploying to beta

### 4. **Deployment Testing Requirements**
See `docs/DEPLOYMENT_TESTING_CHECKLIST.md` for full checklist.

**User must provide BEFORE deployment:**
- ✅ Localhost verified in 2+ browsers
- ✅ Browser console checked (no errors)
- ✅ Screenshots for comparison
- ✅ Specific error messages (if any issues)

**DO NOT deploy if user hasn't completed these checks.**

### 5. **Server Access**
- Beta site: https://meteo-beta.tachyonfuture.com
- SSH: `ssh michael@tachyonfuture.com`
- Deploy script: `bash scripts/deploy-beta.sh` (run on server)
- **Ask before attempting to connect to server** (private key via biometric auth)

### 6. **Token-Saving Rules**
- Read existing documentation before asking questions
- Use TodoWrite for all multi-step tasks
- Check browser DevTools before troubleshooting styling issues
- Don't deploy multiple times - investigate first
- Reference CLAUDE.md, README.md, CHANGELOG.md for context

### 7. **Git Commit Standards**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Always include detailed commit body
- End with:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- Gitleaks pre-commit hook scans for secrets

### 8. **Documentation Standards**
- Update CHANGELOG.md for all user-facing changes
- Update CLAUDE.md for workflow/process changes
- Update README.md for setup/architecture changes
- Keep documentation in sync with code

### 9. **Common Gotchas**
- `react-router-dom` must be in package.json AND installed in Docker
- package-lock.json must be in sync (run `npm install` if mismatched)
- Environment variables: local uses `.env`, beta uses `.env.production`
- CSS: localhost may look different from beta due to build process
- Always check browser console for errors FIRST

### 10. **Project Structure Quick Reference**
```
/backend          - Express API, services, routes
/frontend         - React app (CRA), components, services
/database         - SQL schemas, migrations, seed data
/docs             - All documentation
/scripts          - Deployment and utility scripts
CLAUDE.md         - Main instructions for Claude Code
README.md         - Project overview for developers
CHANGELOG.md      - Version history and changes
```

## Your First Actions Each Session

1. **Read CLAUDE.md** - Essential context
2. **Check git status** - See what's changed
3. **Review recent commits** - `git log --oneline -5`
4. **Ask user** - "What would you like me to work on today?"
5. **Create TodoWrite list** - For multi-step tasks
6. **Test locally FIRST** - Before any deployment

## Questions to Ask User at Session Start

- "What's the current status of localhost? Working or broken?"
- "Are there any specific errors or issues you're seeing?"
- "Have you run the pre-deployment checklist if we're deploying?"
- "Do you have screenshots or console errors to share?"

## Red Flags to Watch For

🚩 User says "deploy" without mentioning localhost testing
🚩 Styling issues without browser console errors provided
🚩 Multiple deploy attempts without investigation
🚩 Vague descriptions like "it's broken" without specifics
🚩 Requests to modify files without reading them first

## Success Criteria

✅ User explicitly tested localhost before deployment
✅ Browser console checked for errors
✅ Git commits are descriptive and follow conventions
✅ Documentation updated to match code changes
✅ TodoWrite used for task tracking
✅ User explicitly says "deploy" before deploying to beta

---

**End of Onboarding Prompt**

Now you're ready to work efficiently! Ask me what I'd like to work on today.
