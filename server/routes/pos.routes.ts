import { Router } from 'express';
import { dbStore } from '../../src/db/store';
import { authenticateToken, requireRole } from '../middlewares/auth';
const router = Router();
router.get('/goods-in', authenticateToken, async (req, res) => { res.json(await dbStore.getGoodsInDocs()); });
router.post('/goods-in', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { supplierId, invoiceNo, items, totalAmount, notes } = req.body;
    const sups = await dbStore.getSuppliers();
    const sup = sups.find((s) => s.id === supplierId);
    const doc = await dbStore.createGoodsInDoc({ date: new Date().toISOString(), supplierId, supplierName: sup?.name || 'Unknown', items, totalAmount, notes: invoiceNo ? `Invoice: ${invoiceNo}. ${notes || ''}` : notes, userId: req.user.id, userName: req.user.name }, req.user.id, req.user.name);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'RECEIVE_GOODS', 'INVENTORY', `Menerima barang dari ${doc.supplierName} (GR: ${doc.docNo})`);
    res.status(201).json(doc);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.get('/ledger', authenticateToken, requireRole('OWNER'), async (req, res) => { res.json(await dbStore.getLedger()); });
router.get('/sales', authenticateToken, async (req, res) => { res.json(await dbStore.getSales()); });
router.post('/sales', authenticateToken, async (req: any, res) => {
  try {
    const sale = await dbStore.createSale(req.body, req.user.id, req.user.name);
    res.status(201).json(sale);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.post('/sales/:id/void', authenticateToken, async (req: any, res) => {
  try {
    const { pin } = req.body;
    if (!pin) throw new Error('PIN Owner dibutuhkan untuk membatalkan transaksi.');
    await dbStore.voidSale(req.params.id, req.user.id, req.user.name, pin);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Pending Orders
router.get('/orders/pending', authenticateToken, async (req, res) => {
  res.json(await dbStore.getPendingOrders());
});

router.put('/orders/pending/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await dbStore.updatePendingOrderStatus(req.params.id, status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Shift routes
router.get('/shifts', authenticateToken, requireRole('OWNER'), async (req, res) => {
  res.json(await dbStore.getShifts());
});
router.get('/shifts/current', authenticateToken, async (req: any, res) => {
  res.json(await dbStore.getCurrentShift(req.user.id));
});
router.post('/shifts/start', authenticateToken, async (req: any, res) => {
  try {
    const shift = await dbStore.startShift(req.user.id, req.user.name, req.body.startingCash);
    res.status(201).json(shift);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.post('/shifts/:id/close', authenticateToken, async (req: any, res) => {
  try {
    const shift = await dbStore.closeShift(req.params.id, req.user.id, req.user.name, req.body.actualEndingCash, req.body.notes);
    res.json(shift);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.get('/opname', authenticateToken, async (req, res) => { res.json(await dbStore.getOpnames()); });
router.post('/opname', authenticateToken, async (req: any, res) => {
  try {
    const doc = await dbStore.createStockOpname(req.body, req.user.id, req.user.name);
    res.status(201).json(doc);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.post('/opname/:id/approve', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const doc = await dbStore.approveStockOpname(req.params.id, req.user.id, req.user.name);
    res.json(doc);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.post('/opname/:id/reject', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const doc = await dbStore.rejectStockOpname(req.params.id, req.user.id, req.user.name);
    res.json(doc);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
export default router;
