<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/06bd1a24-8f8e-44b7-a746-0a82e2ec07f5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   # Weather Intelligence App

A responsive, client-side web application built to fetch real-time weather analytics and 7-day forecasts using the public Open-Meteo APIs.

## 🚀 AI Studio to GitHub Connection Instructions
1. Open the application prototype in **Google AI Studio App Build**.
2. Click the **Share/Export** dropdown menu in the top right header.
3. Select **Export to GitHub** (or GitHub Sync) and authorize your GitHub account.
4. Create a new repository name and sync the generated React/Vite source code.

## ☁️ Cloudflare Pages Deployment Instructions
1. Log into the **Cloudflare Dashboard** and navigate to **Workers & Pages**.
2. Click **Create** under the Pages tab and select **Connect to Git**.
3. Select this synchronized GitHub repository and click **Begin setup**.
4. Configure the production build settings exactly as follows:
   * **Framework preset:** Vite (or None/Custom)
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Click **Save and Deploy** to launch the live application.
