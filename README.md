# Madrasa Live — Inter-Team Competition Management System

A Next.js 14 App Router application with Socket.IO for real-time live score displays, intended for large TV broadcasts at madrasa competitions.

## Architecture

This project uses a custom Node.js server (`server.mjs`) to host both the Next.js application and the Socket.IO server on the same HTTP port. This is required because serverless environments (like standard Next.js on Vercel) do not support the persistent WebSocket connections needed for real-time TV updates.

## Environment Variables

Create a `.env.local` file for development (or add to your Render environment variables in production):

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/madrasa_live?retryWrites=true&w=majority

# URL for Socket.IO Client (usually empty in prod as it defaults to current origin, but required in dev if proxying)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the custom development server:
   ```bash
   npm run dev
   ```
   *Note: This runs `node server.mjs` instead of the default `next dev`.*

3. Seed the database with sample data:
   Once the server is running, send a POST request to `/api/seed` (e.g., using Postman or cURL) or simply visit the Admin Display page and trigger the seed manually if you add a button, but for MVP:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

4. Open the applications:
   - **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
   - **TV Display**: [http://localhost:3000/tv](http://localhost:3000/tv)

## Deployment to Render

This application is designed to be deployed as a **Node.js Web Service** on Render.

1. Create a new Web Service on Render and connect your GitHub repository.
2. Configure the settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add your Environment Variables:
   - `MONGODB_URI`
   - `NODE_ENV` = `production`
4. Deploy! Render will maintain the Node.js process, allowing Socket.IO connections to persist.

## Current Limitations (MVP)
- No authentication on the `/admin` routes.
- Images/photos are stored as simple URL strings (Cloudinary integration pending).
- Assumes a fixed set of 4 teams.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- MongoDB (Mongoose)
- Socket.IO
- motion (Framer Motion)
