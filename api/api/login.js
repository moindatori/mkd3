import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { email, password } = JSON.parse(req.body);
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email=$1", [email]);
    client.release();

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, credits: user.credits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
