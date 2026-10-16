# OmniTool

Useful tools for everyday work in one responsive workspace. Built with React and Vite; designed for browser-first processing.

## Included
- Responsive dashboard, search and category filters
- Text analyzer (word/character/line counts and UTF-8 size), line organizer (sort, deduplicate, trim or reverse lines), text case converter and line-by-line text comparison with added/removed/unchanged summaries
- JSON formatter/validator with pretty-print and minify modes, plus Base64 encoder/decoder
- Random password generator, percentage calculator and EMI calculator
- Unix timestamp/date converter, QR code generator with PNG download, URL encoder/decoder, HTML escape/unescape and UUID generator
- CSV ↔ JSON converter with strict header/column validation, SHA-256 hashing for text/files, Unicode-aware text size analyzer, regex tester, Markdown live preview and HEX/RGB color converter
- Copy or download tool results as text files; one consolidated text analyzer avoids overlapping word-count tools
- Persistent quick checklist with clear-completed/clear-all controls
- Workspace backup export/import with validation of file format, tool IDs and checklist indexes before restoring theme, favorites, recent tools, local profile and checklist
- Favorites, recent tools, theme toggle and local profile

## Run
Requires Node.js LTS.
```bash
npm install
npm run dev
npm test
npm run build
```

## Deploy to Vercel
Import this repository, choose **Vite**, use build command `npm run build` and output directory `dist`. The current browser-only version requires no environment variables.

## Important account limitation
The profile dialog is not real authentication. It stores a display name and optional email in this browser only. Favorites, recent tools, theme preference, checklist and profile are device-local. Secure accounts, account recovery, and cross-device cloud sync require a trusted authentication and persistent backend. Those are not configured in this starter, and it would be unsafe to pretend a frontend-only site provides them.

All included utilities run in the browser; text hashing and file hashing use the Web Crypto API. Workspace import accepts only OmniTool-formatted JSON backups and reloads the page after restoring settings. CSV parsing supports quoted fields, escaped quotes, and embedded line breaks, and rejects malformed quote placement or trailing characters; CSV-to-JSON conversion rejects empty/duplicate headers and mismatched column counts. Text analysis counts Unicode code points and UTF-8 bytes. Text tools process inputs in the browser. QR codes are generated locally in the browser using a bundled library; no QR service or API key is required. Advanced image/document processing and secure account/cloud-sync features are not included in this starter. No AI API key is needed for the included utilities.

## License
MIT
