import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { userId, credits } = JSON.parse(req.body);
  try {
    const client = await pool.connect();
    await client.query("UPDATE users SET credits = credits + $1 WHERE id=$2", [credits, userId]);
    client.release();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
