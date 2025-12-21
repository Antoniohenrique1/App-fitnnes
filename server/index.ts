import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const MemStore = MemoryStore(session);

// Session middleware - using in-memory store for development
app.use(
  session({
    store: new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// FOR VERCEL: We need a way to ensure routes are registered
// before the first request hits.
let routesRegistered = false;
const registrationPromise = registerRoutes(app).then(() => {
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }
  routesRegistered = true;
  log("Agreste Server: Routes and Static files initialized");
}).catch(err => {
  console.error("Critical: Failed to initialize Agreste Server", err);
});

// Middleware to wait for registration in a serverless environment
app.use(async (_req, _res, next) => {
  if (!routesRegistered) {
    await registrationPromise;
  }
  next();
});

// Handling local dev server
if (process.env.NODE_ENV !== "production") {
  (async () => {
    // Already handled by the promise above for initialization logic,
    // but we need to start the listener locally.
    const server = await registrationPromise.then(() => registerRoutes(app)); // Re-get server instance for local listen
    await setupVite(app, server);
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  })();
}

export default app;
