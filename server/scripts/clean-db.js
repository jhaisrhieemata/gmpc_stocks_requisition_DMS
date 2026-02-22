import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function cleanAndSetup() {
  const dbName = process.env.DB_NAME || "gmpc_requisition";

  try {
    // Connect without database
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log(`Dropping database '${dbName}' if it exists...`);
    try {
      await conn.query(`DROP DATABASE \`${dbName}\``);
      console.log("✓ Database dropped");
    } catch (err) {
      console.log("  (Database didn't exist)");
    }

    // Wait a moment
    await new Promise((r) => setTimeout(r, 1000));

    console.log(`Creating fresh database '${dbName}'...`);
    await conn.query(
      `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✓ Database created");

    await conn.end();
    console.log("\n✓ Ready to run migration! Run: npm run migrate");
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

cleanAndSetup();
