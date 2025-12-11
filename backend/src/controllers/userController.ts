import pool from '../database/db';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // For demo: return user info. In production, return JWT or session.
    return res.status(200).json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
};
