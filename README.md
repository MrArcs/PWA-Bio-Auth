<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zb2rqxnmbBDys_VlAtp4Ln8Bqnb0D4n5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create your env file:
   - Copy `sample.env` to `.env.local`
   - Set `GEMINI_API_KEY` inside `.env.local`
3. Run the app:
   `npm run dev`

## URLs

- **Local (dev server)**: `https://localhost:3000`
- **Production (Vercel)**: `https://pwa-bio-auth.vercel.app/`

## Production env (Vercel)

Set `GEMINI_API_KEY` as an environment variable in your Vercel project settings (don’t commit secrets into the repo).
