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
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 1. Cross-Domain CORS (Item 2 resolution: explicit origin + credentials: true)
app.use(
  cors({
    origin: CLIENT_URL,
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
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Digital Heroes API] Running on http://localhost:${PORT}`);
      console.log(`[Digital Heroes API] Cross-Origin Allowed Client: ${CLIENT_URL}`);
    });
  });
}

export default app;
