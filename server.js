import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createApiRoutes } from "./src/routes/apiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;
const __filename = fileURLToPath(import.meta.url);
const publicDir = path.join(dirname(__filename), "public");
// --- START: Replace app.use(cors()) with this entire block ---

// Define the list of websites that are allowed to make requests to this API
const whitelist = [
  'https://animod.dev',
  'https://www.animod.dev',
  'http://localhost:5173' // Keep this for your local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (whitelist.indexOf(origin) !== -1) {
      // If the incoming origin is in our whitelist, allow it
      callback(null, true);
    } else {
      // Otherwise, block it
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  credentials: true
};

// Use the new, more specific CORS options
app.use(cors(corsOptions));

// --- END: Replacement block ---

app.use(express.static(publicDir, { redirect: false }));

const jsonResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, results: data });

const jsonError = (res, message = "Internal server error", status = 500) =>
  res.status(status).json({ success: false, message });

createApiRoutes(app, jsonResponse, jsonError);

app.get("*", (req, res) => {
  const filePath = path.join(publicDir, "404.html");
  if (fs.existsSync(filePath)) {
    res.status(404).sendFile(filePath);
  } else {
    res.status(500).send("Error loading 404 page.");
  }
});

app.listen(PORT, () => {
  console.info(`Listening at ${PORT}`);
});
