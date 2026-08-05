import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../../src/db/store';
import { authenticateToken } from '../middlewares/auth';
import { JWT_SECRET } from '../config';
const router = Router();
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await dbStore.findUserByUsername(username);
  if (!user || user.status !== 'ACTIVE') return res.status(401).json({ error: 'Username atau password salah / Akun tidak aktif' });
  const valid = await dbStore.verifyPassword(user.id, password);
  if (!valid) return res.status(401).json({ error: 'Username atau password salah' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
  await dbStore.addAuditLog(user.id, user.name, user.role, 'LOGIN', 'AUTH', 'User berhasil login ke sistem');
  res.json({ token, user });
});
router.get('/me', authenticateToken, async (req: any, res) => {
  const users = await dbStore.getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json({ user });
});
export default router;
