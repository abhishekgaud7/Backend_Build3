import { createApp } from "./app.js";
import "dotenv/config";
const app = createApp();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API base URL: http://localhost:${PORT}/api`);
  console.log(`🔒 CORS origin: ${CORS_ORIGIN}`);
});

export default app;
