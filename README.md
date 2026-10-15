# OmniTool

Useful tools for everyday work in one responsive workspace. Built with React and Vite; designed for browser-first processing.

## Included
- Responsive dashboard, search and category filters
- Word counter, text case converter and text comparison
- JSON formatter/validator and Base64 encoder/decoder
- Random password generator, percentage calculator and EMI calculator
- Unix timestamp/date converter, QR code generator and quick checklist
- Favorites, recent tools, theme toggle and local profile

## Run
Requires Node.js LTS.
```bash
npm install
npm run dev
npm run build
```

## Deploy to Vercel
Import this repository, choose **Vite**, use build command `npm run build` and output directory `dist`. The current browser-only version requires no environment variables.

## Important account limitation
The profile dialog is not real authentication. It stores a display name and optional email in this browser only. Favorites and recent tools are device-local. Secure accounts, account recovery, and cross-device cloud sync require a trusted authentication and persistent backend. Those are not configured in this starter, and it would be unsafe to pretend a frontend-only site provides them.

Text tools process inputs in the browser. QR codes are generated locally in the browser using a bundled library; no QR service or API key is required. Advanced image/document processing and secure account/cloud-sync features are not included in this starter. No AI API key is needed for the included utilities.

## License
MIT
