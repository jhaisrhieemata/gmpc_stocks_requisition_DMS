/**
 * Server Entry Point
 * GMPC Requisition System
 */

import app from "./src/app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
