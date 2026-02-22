import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

try {
  const server = app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
  });

  // Handle errors
  server.on("error", (err) => {
    console.error("✗ Server error:", err);
  });
} catch (error) {
  console.error("✗ Failed to start server:", error.message);
  console.error(error);
  process.exit(1);
}
