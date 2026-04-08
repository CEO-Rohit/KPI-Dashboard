# Production Setup Guide

To get the dashboard working on the live URL, follow these steps to deploy the backend and connect it to your Vercel frontend.

## 1. Deploy the Backend (Recommended: Render)

Since your project uses **Socket.io** and **PostgreSQL**, I recommend using [Render](https://render.com/) or [Railway](https://railway.app/).

### Steps for Render:
1.  **Create a New Web Service**: Connect your GitHub repository.
2.  **Root Directory**: Set this to `backend`.
3.  **Environment**: Select `Docker`.
4.  **Plan**: Select the "Starter" or "Free" tier.
5.  **Environment Variables**: Add the following:
    -   `DATABASE_URL`: Your PostgreSQL connection string (e.g. `postgres://...`).
    -   `NODE_ENV`: `production`
    -   `PORT`: `3001`

---

## 2. Setup PostgreSQL

You need a live PostgreSQL database. You can create one on Render or use [Supabase](https://supabase.com/).
1.  Get the **Connection String** (something like `postgres://user:pass@host:port/db`).
2.  Add it as `DATABASE_URL` to your backend environment variables.
3.  Run the database initialization (Render allows you to run a "Pre-deploy" command: `npm run db:init && npm run seed`).

---

## 3. Configure Vercel (The "Exact Values")

Now that your backend is deployed, you need to tell your Vercel frontend where to find it.

1.  Go to your **Vercel Dashboard** > **Project Settings** > **Environment Variables**.
2.  Add the following variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend-url.onrender.com/api` | The base URL for REST API calls. |
| `VITE_API_URL` | `https://your-backend-url.onrender.com` | The base URL for Socket.io. |

> [!IMPORTANT]
> **Remove the trailing slash** from `VITE_API_URL`.
> If your backend is at `https://fnb-dashboard-api.onrender.com`, then:
> - `VITE_API_BASE_URL` = `https://fnb-dashboard-api.onrender.com/api`
> - `VITE_API_URL` = `https://fnb-dashboard-api.onrender.com`

---

## 4. Finalizing

1.  **Push Changes**: Commit and push the changes I've made locally to your GitHub repo.
    ```bash
    git add .
    git commit -m "chore: prepare for production deployment"
    git push origin main
    ```
2.  **Verify**: Once Vercel finishes the build, visit your site. It should now be "Initializing..." and then load the data from your live backend.

---

## Summary of Changes Made
- Added `backend/Dockerfile` and `.dockerignore`.
- Updated `backend/src/server.js` to allow CORS from your Vercel URL.
- Updated `frontend/src/services/api.js` to support environment variables.
- Updated `frontend/src/context/DataProvider.jsx` to support environment variables for Sockets.
