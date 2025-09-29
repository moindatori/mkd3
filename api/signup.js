import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { email, password } = JSON.parse(req.body);
  try {
    const hash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    await client.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hash]);
    client.release();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
