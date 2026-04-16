{
  "name": "project-xael-//-leax-integrated",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "node server.ts",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.41.0",
    "@prisma/client": "^6.1.0",
    "autoprefixer": "^10.4.24",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "firebase": "^12.12.0",
    "google-auth-library": "^10.6.2",
    "jsonwebtoken": "^9.0.3",
    "lucide-react": "^0.574.0",
    "motion": "^12.38.0",
    "postcss": "^8.5.6",
    "prisma": "^6.1.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "socket.io": "^4.8.3",
    "socket.io-client": "^4.8.3",
    "tailwindcss": "^3.4.4",
    "tsx": "^4.21.0"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
