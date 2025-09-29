import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { token, prompt } = JSON.parse(req.body);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const client = await pool.connect();
    const result = await client.query("SELECT credits FROM users WHERE id=$1", [userId]);
    if (result.rows[0].credits <= 0) {
      client.release();
      return res.status(403).json({ error: "No credits left" });
    }

    await client.query("INSERT INTO prompts (user_id, prompt) VALUES ($1, $2)", [userId, prompt]);
    await client.query("UPDATE users SET credits = credits - 1 WHERE id=$1", [userId]);

    client.release();
    res.status(200).json({ success: true, remainingCredits: result.rows[0].credits - 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
