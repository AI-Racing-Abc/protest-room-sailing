# Deploy — Protest Room Sailing Game

## Live
- **Production:** https://protest-room-sailing.pages.dev/
- Deployment id: `7a2e48a3-dca5-4d99-94b1-2cb76f812953` (success, 2026-10-20 Asia/Shanghai)
- Verified HTTP 200: `/`, `style.css`, `game.js`, `robots.txt`, `sitemap.xml`, `og.jpg`

## Repo
- GitHub: https://github.com/AI-Racing-Abc/protest-room-sailing
- Branch: `main`
- Static site, no build step

## Cloudflare
- Account: Ai.racing.abc@gmail.com's Account (`3711186658018da3223747d60278efa7`)
- Project: `protest-room-sailing` (Direct Upload Pages)
- Independent of airacing.hk and roadster-kickflip

## Redeploy
Prefer `npx wrangler pages deploy . --project-name=protest-room-sailing --branch=main` with Pages-scoped API token, or repeat Direct Upload (upload-token → assets → deployments manifest).
