# unrollmyGmail

Unsubscribe unwanted emails and move them to the Spam folder — quickly reclaim your inbox.

---

## Description

unrollmyGmail is a lightweight JavaScript tool that helps you unsubscribe from newsletters and mailing lists and move unwanted emails to your Gmail Spam folder. It automates the repetitive steps of identifying unsubscribe links, unsubscribing when possible, and moving persistent senders to Spam — saving you time and reducing inbox clutter.

The tool uses your explicit authorization to operate on your Gmail account (via Google APIs / OAuth). It performs operations only after you grant consent and runs locally (or on a server you control) so your email data isn't shared with third parties.

---

## Target users

- Individuals overwhelmed by newsletters and promotional emails
- People who want to regain control of their inbox without manually unsubscribing from dozens of senders
- Productivity enthusiasts, freelancers, and small teams who manage email-heavy workflows

---

## Top 3 benefits

1. Save time — Automatically finds and processes unsubscribe links so you don't have to open each newsletter manually.
2. Reduce noise — Moves repeat unwanted senders directly to Spam, improving the signal-to-noise ratio in your inbox.
3. Safer cleanup — Runs only with your explicit OAuth consent and performs actions that you can review and undo in Gmail.

---

## Features (high level)

- Scan messages for unsubscribe links
- Trigger unsubscribe actions where available
- Move messages and senders to Spam when unsubscribe isn't supported
- Dry-run / preview mode so you can review actions before they run (if available)
- Logs actions so you can audit what was changed

---

## Quick setup guide

Below are generic setup instructions. Adjust command names and filenames if the repository uses different script names or structure.

### Prerequisites
- Node.js (v14 or newer recommended) and npm
- A Google account and a Google Cloud project with the Gmail API enabled
- OAuth 2.0 credentials (Client ID and Client Secret) from Google Cloud Console

### Steps

1. Clone the repository
   - git clone https://github.com/Priyanshu-Sahu/unrollmyGmail.git
   - cd unrollmyGmail

2. Install dependencies
   - npm install

3. Create Google OAuth credentials
   - Go to https://console.cloud.google.com/
   - Create a project (or use an existing one)
   - Enable the Gmail API for the project
   - Create OAuth 2.0 Client ID credentials (type: Desktop app or Web app depending on usage)
   - Download the credentials JSON (commonly named `credentials.json`) or copy CLIENT_ID and CLIENT_SECRET

4. Configure environment variables
   - Create a `.env` file at the project root (or set env variables in your environment)
   - Example `.env`:
     CLIENT_ID=your-client-id.apps.googleusercontent.com
     CLIENT_SECRET=your-client-secret
     REDIRECT_URI=http://localhost:3000/oauth2callback
     (or) CREDENTIALS_PATH=./credentials.json

   - Note: Replace values with those from your Google Cloud credentials.

5. Authorize the app (first run)
   - If the repository includes an auth script, run it (example):
     - npm run auth
     - or node scripts/authorize.js
   - Follow the printed URL to authorize the app in your browser and paste the returned code when prompted.
   - The tool should save tokens (e.g., `token.json`) for future runs.

6. Run the tool
   - npm start
   - or node index.js
   - Use any available CLI flags for preview/dry-run mode (e.g., `--dry-run`) if supported.

7. Verify actions in Gmail
   - Review the actions performed in your Gmail account (Spam folder and message labels)
   - Undo any changes from the Gmail web UI if needed

---

## Safety & privacy

- This tool requires access to your Gmail account via OAuth. Only grant permissions you understand.
- Tokens and credentials are stored locally. Keep them secure and do not commit them to source control.
- Review the source code before running to ensure it only performs actions you expect.
- If running on a server, secure the server and follow best practices for credentials management.

---

## Troubleshooting

- Authorization errors: Re-check your OAuth credentials and redirect URIs configured in Google Cloud Console.
- Missing scripts: If commands above fail, inspect package.json for available scripts and update commands accordingly.
- API quota errors: Ensure your Google Cloud project has sufficient Gmail API quota and usage is within limits.

---

## Contributing

Contributions, issues and feature requests are welcome. Please open an issue on GitHub: https://github.com/Priyanshu-Sahu/unrollmyGmail/issues

---

## Connect

- GitHub: [Priyanshu-Sahu](https://github.com/Priyanshu-Sahu)
- LinkedIn: Replace the placeholder below with your LinkedIn profile URL so users can connect directly:
  - Example (replace with your real profile): https://www.linkedin.com/in/PRIYANSHU-LINKEDIN-USERNAME

If you'd like, provide your exact LinkedIn URL and I will update this README to include it.

---

Thank you for using unrollmyGmail — reclaim your inbox, one unsubscribe at a time.
