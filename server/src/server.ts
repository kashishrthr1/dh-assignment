import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";

// Route imports
import authRoutes from "./routes/authRoutes";
import scoreRoutes from "./routes/scoreRoutes";
import drawRoutes from "./routes/drawRoutes";
import charityRoutes from "./routes/charityRoutes";
import winnerRoutes from "./routes/winnerRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const configuredClientUrl = (process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");

// 1. Resilient Cross-Domain CORS (handles trailing slashes, localhost, and Vercel domains)
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, health probes)
      if (!requestOrigin) return callback(null, true);

      const normalizedOrigin = requestOrigin.trim().replace(/\/+$/, "");

      // Match configured CLIENT_URL
      if (configuredClientUrl && normalizedOrigin === configuredClientUrl) {
        return callback(null, true);
      }

      // Allow local development
      if (/^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow Vercel deployments
      if (/\.vercel\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // Fallback reflection for credentials
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Cookie Parser for HTTP-only JWT Refresh Tokens
app.use(cookieParser());

// 3. Body parsers (Payment routes define their own raw parser for Stripe webhooks)
app.use("/api/payment", paymentRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Static uploads folder for local test file uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 5. Health Check Endpoint (For Render / Vercel deployment probes)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Digital Heroes REST API",
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount Domain REST Routes
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Express Error:", err);
  res.status(err.status || 500).json({
    error: err.name || "ServerError",
    message: err.message || "An unexpected error occurred.",
  });
});

// Connect to MongoDB and start HTTP listener
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Digital Heroes API] Running on http://localhost:${PORT}`);
    console.log(`[Digital Heroes API] CORS Allowed Client: ${configuredClientUrl || "Auto-detecting"}`);
  });

  connectDB().catch((err) => {
    console.error("[Database] Initial connection error:", err.message);
  });
}

export default app;
