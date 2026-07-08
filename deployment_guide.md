# 100% Free Deployment Guide for ResumeAI

This guide details how to host your entire **ResumeAI** application online for free using Vercel, Render, and Aiven.

---

## 📋 The Free Tier Stack

1. **Database:** **Aiven.io** (Free MySQL instance, 1GB storage, permanently free).
2. **Backend:** **Render.com** (Free Node.js Web Service, 512MB RAM, sleeps when inactive).
3. **Frontend:** **Vercel.com** (Free static hosting, high performance).

---

## 🛠️ Step 1: Set Up Your Free Database (Aiven)

1. Sign up for a free account at **[Aiven.io](https://aiven.io/)**.
2. Click **Create Service**.
3. Choose **MySQL** as the service type.
4. Under **Plan**, select the **Free** tier (located in the plans selection).
5. Choose a region close to you (e.g., `aws-eu-west-1` or `aws-us-east-1`).
6. Click **Create Service**.
7. Once the service is running, copy the **URI** connection string. It will look like this:
   `mysql://avnadmin:password@mysql-xxxxx.aivencloud.com:port/defaultdb?ssl-mode=REQUIRED`

> [!IMPORTANT]
> Aiven MySQL uses SSL by default. Ensure your Prisma connection string ends with `?ssl-mode=REQUIRED` or `?sslmode=require` so it can connect securely.

---

## 🛠️ Step 2: Deploy Your Backend (Render)

1. Sign up on **[Render.com](https://render.com/)**.
2. Click **New +** on the dashboard and select **Web Service**.
3. Connect your GitHub repository (`badr554/Resume`).
4. Configure the Web Service:
   - **Name:** `resumeai-backend`
   - **Environment:** `Node`
   - **Region:** Choose the same region as your Aiven database.
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Build Command:** `npm run prisma:generate && npx prisma migrate deploy && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Select **Free** ($0/month).
5. Click **Advanced** and add the following **Environment Variables**:
   - `DATABASE_URL` = (Paste your Aiven MySQL URI from Step 1)
   - `JWT_SECRET` = (A secure random string)
   - `JWT_REFRESH_SECRET` = (Another secure random string)
   - `ANTHROPIC_API_KEY` = (Your Claude API Key)
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app` (You will update this once Vercel is set up)
   - `PORT` = `10000` (Render's default port)
   - `NODE_ENV` = `production`
6. Click **Create Web Service**.

> [!NOTE]
> Render's free tier web services spin down after 15 minutes of inactivity. When someone loads your app after a period of inactivity, the backend will take 30-50 seconds to wake up (subsequent requests will be fast).

---

## 🛠️ Step 3: Deploy Your Frontend (Vercel)

1. Sign up on **[Vercel.com](https://vercel.com/)**.
2. Click **Add New** > **Project** and import your GitHub repository.
3. Configure the Project:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the following **Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com/api` (The URL of your running Render backend from Step 2).
5. Click **Deploy**. Vercel will build your static files and give you a public URL (e.g., `https://resume-badr.vercel.app`).

---

## 🛠️ Step 4: Final Link

Once your Vercel project is deployed, update your Render backend's CORS setting:
1. Copy your Vercel frontend URL.
2. Go to your **Render Dashboard** > select your backend service > **Environment**.
3. Edit the `CLIENT_URL` variable to match your Vercel URL (e.g., `https://resume-badr.vercel.app`).
4. Save changes (Render will automatically redeploy the backend).

Your full-stack AI resume builder is now live online for 100% free!
