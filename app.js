const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const heroRoutes = require("./routes/heroRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const industryRoutes = require("./routes/industryRoutes");
const projectRoutes = require("./routes/projectRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const clientLogoRoutes = require("./routes/clientLogoRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const insightRoutes = require("./routes/insightRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const clientRoutes = require("./routes/clientRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

// ================================
// SECURITY
// ================================

app.use(helmet());

// ================================
// CORS
// ================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ================================
// BODY PARSER
// ================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ================================
// COOKIES
// ================================

app.use(cookieParser());

// ================================
// LOGGER
// ================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ================================
// RATE LIMITER
// ================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use(globalLimiter);

// ================================
// API ROUTES
// ================================

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/hero", heroRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/industries", industryRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/about", aboutRoutes);


app.use("/api/client-logos", clientLogoRoutes);

app.use("/api/testimonials", testimonialRoutes);

app.use("/api/insights", insightRoutes);

app.use("/api/enquiries", enquiryRoutes);

app.use("/api/newsletter", newsletterRoutes);

app.use("/api/media", mediaRoutes);

app.use("/api/solutions", solutionRoutes);

app.use("/api/users", userRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/clients", clientRoutes);

app.use("/api/chatbot", chatbotRoutes);

// ================================
// API ROOT
// ================================

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to ARDICADE API",
  });
});

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "ARDICADE API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ================================
// GLOBAL ERROR HANDLER
// ================================

app.use((error, req, res, next) => {
  console.error("Global Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.message || "Internal server error",
  });
});

// ================================
// EXPORT EXPRESS APP
// ================================

module.exports = app;