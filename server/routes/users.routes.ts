import { Router } from 'express';
import { dbStore } from '../../src/db/store';
import { authenticateToken, requireRole } from '../middlewares/auth';
const router = Router();
router.get('/', authenticateToken, requireRole('OWNER'), async (req, res) => {
  res.json(await dbStore.getUsers());
});
router.post('/', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { username, password, name, role, status, pin } = req.body;
    const existing = await dbStore.findUserByUsername(username);
    if (existing) return res.status(400).json({ error: 'Username sudah digunakan' });
    const newUser = await dbStore.createUser({ username, name, role, status: status || 'ACTIVE' }, password, pin);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'CREATE_USER', 'USERS', `Membuat akun pengguna: ${username}`);
    res.status(201).json(newUser);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.put('/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, status, pin } = req.body;
    const updated = await dbStore.updateUser(id, { username, name, role, status }, password, pin);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'UPDATE_USER', 'USERS', `Mengubah data pengguna: ${username}`);
    res.json(updated);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.delete('/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { id } = req.params;
    await dbStore.deleteUser(id, req.user.id);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
export default router;
