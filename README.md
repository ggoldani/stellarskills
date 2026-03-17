# stellarskills

> Stellar Network knowledge for AI agents — fetch any skill URL and instantly know how to build on Stellar.

**stellarskills.com** • MIT License

---

## Usage

Give any AI agent a skill URL. It fetches the Markdown, reads it, and knows how to build.

```
"Read stellarskills.com/SKILL.md before you start building on Stellar"
```

```bash
curl -s https://stellarskills.com/SKILL.md
curl -s https://stellarskills.com/accounts/SKILL.md
curl -s https://stellarskills.com/soroban/SKILL.md
```

Works in Claude, ChatGPT, Cursor, Copilot, or any agent that can fetch URLs.

---

## Skills

| Skill | URL |
|-------|-----|
| Root (start here) | `stellarskills.com/SKILL.md` |
| Accounts & Keypairs | `stellarskills.com/accounts/SKILL.md` |
| Assets & Trustlines | `stellarskills.com/assets/SKILL.md` |
| Soroban Smart Contracts | `stellarskills.com/soroban/SKILL.md` |
| SEP Standards (payments, auth) | `stellarskills.com/seps/SKILL.md` |
| Horizon API | `stellarskills.com/horizon/SKILL.md` |
| Soroban RPC | `stellarskills.com/rpc/SKILL.md` |
| Fees | `stellarskills.com/fees/SKILL.md` |
| DEX & AMM | `stellarskills.com/dex/SKILL.md` |
| Operations reference | `stellarskills.com/operations/SKILL.md` |
| Anchors | `stellarskills.com/anchors/SKILL.md` |
| Tools & SDKs | `stellarskills.com/tools/SKILL.md` |
| Security | `stellarskills.com/security/SKILL.md` |
| Testing | `stellarskills.com/testing/SKILL.md` |
| Frontend | `stellarskills.com/frontend/SKILL.md` |
| Why Stellar | `stellarskills.com/why/SKILL.md` |

---

## Vercel Deployment

This repo is designed to be deployed on Vercel as a static site. Each `SKILL.md` is served directly.

### vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
      ]
    }
  ]
}
```

---

## Contributing

Something wrong or missing? Open a PR.

- Each skill lives in its own folder: `/<skill-name>/SKILL.md`
- Keep it factual, dense, and agent-friendly (no fluff)
- Code examples must be current and runnable
- Verify contract addresses and API endpoints before adding

---

## License

MIT
