import { Router } from 'express';
import { dbStore } from '../../src/db/store';
import { authenticateToken, requireRole } from '../middlewares/auth';
const router = Router();
router.get('/dashboard', authenticateToken, async (req, res) => {
  res.json(await dbStore.getDashboardSummary());
});
router.get('/audit-logs', authenticateToken, requireRole('OWNER'), async (req, res) => {
  res.json(await dbStore.getAuditLogs());
});
router.get('/settings', authenticateToken, async (req, res) => {
  res.json(await dbStore.getSettings());
});
router.put('/settings', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  const newSettings = req.body;
  const updated = await dbStore.updateSettings(newSettings);
  await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'UPDATE_SETTINGS', 'SYSTEM', 'Mengubah pengaturan toko');
  res.json(updated);
});
router.get('/notifications', authenticateToken, async (req, res) => {
  res.json(await dbStore.getNotifications());
});
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  await dbStore.markNotificationRead(req.params.id);
  res.json({ success: true });
});
export default router;
