import mysql from "mysql2/promise";

async function checkDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });

    console.log("✓ MySQL connection successful!");

    // Check if database exists
    const [dbs] = await conn.query(
      "SHOW DATABASES LIKE 'gmpc_requisition'"
    );

    if (dbs.length > 0) {
      console.log("✓ Database 'gmpc_requisition' exists");

      // Check tables
      const [tables] = await conn.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'gmpc_requisition'"
      );

      if (tables.length > 0) {
        console.log(`✓ Found ${tables.length} tables:`);
        tables.forEach((t) => {
          console.log(`  - ${t.TABLE_NAME}`);
        });
      } else {
        console.log("✗ No tables found in database");
      }
    } else {
      console.log("✗ Database 'gmpc_requisition' does not exist");
    }

    await conn.end();
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

checkDatabase();
