import pool from "./database.js";

async function testDatabase() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL connected successfully!");
    console.log("🕒 Database time:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testDatabase();