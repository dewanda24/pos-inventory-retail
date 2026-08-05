import { Router } from 'express';
import { dbStore } from '../../src/db/store';
import { authenticateToken, requireRole } from '../middlewares/auth';
const router = Router();
router.get('/expenses', authenticateToken, requireRole('OWNER'), async (req, res) => {
  res.json({ expenses: await dbStore.getExpenses(), categories: await dbStore.getExpenseCategories() });
});
router.post('/expenses', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { type, categoryId, amount, description } = req.body;
    const cats = await dbStore.getExpenseCategories();
    const cat = cats.find((c) => c.id === categoryId);
    const exp = await dbStore.createExpense({ date: new Date().toISOString(), type, categoryId, categoryName: cat?.name || 'Umum', amount, description, userId: req.user.id, userName: req.user.name }, req.user.id, req.user.name);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'CREATE_EXPENSE', 'FINANCIAL', `Mencatat ${type}: ${description} (Rp ${amount})`);
    res.status(201).json(exp);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.delete('/expenses/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    await dbStore.deleteExpense(req.params.id, req.user.id, req.user.name);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
export default router;
