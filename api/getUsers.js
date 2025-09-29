import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT id, email, credits, created_at FROM users ORDER BY id ASC");
    client.release();
    res.status(200).json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
