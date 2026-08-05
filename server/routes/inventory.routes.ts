import { Router } from 'express';
import { dbStore } from '../../src/db/store';
import { authenticateToken, requireRole } from '../middlewares/auth';
const router = Router();
router.get('/categories', authenticateToken, async (req, res) => { res.json(await dbStore.getCategories()); });
router.post('/categories', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });
  const newCat = await dbStore.createCategory({ name, description });
  await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'CREATE_CATEGORY', 'MASTER', `Menambah kategori: ${name}`);
  res.status(201).json(newCat);
});
router.put('/categories/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const updated = await dbStore.updateCategory(req.params.id, req.body);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'UPDATE_CATEGORY', 'MASTER', `Mengubah kategori: ${updated?.name}`);
    res.json(updated);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.delete('/categories/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    await dbStore.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.get('/suppliers', authenticateToken, async (req, res) => { res.json(await dbStore.getSuppliers()); });
router.post('/suppliers', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  const newSup = await dbStore.createSupplier(req.body);
  res.status(201).json(newSup);
});
router.put('/suppliers/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  res.json(await dbStore.updateSupplier(req.params.id, req.body));
});
router.delete('/suppliers/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    await dbStore.deleteSupplier(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.get('/products', authenticateToken, async (req, res) => { res.json(await dbStore.getProducts()); });
router.post('/products', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { sku, barcode, name, categoryId, supplierId, buyPrice, sellPrice, stock, minStock, imageUrl } = req.body;
    const cats = await dbStore.getCategories();
    const sups = await dbStore.getSuppliers();
    const cat = cats.find((c) => c.id === categoryId);
    const sup = sups.find((s) => s.id === supplierId);
    const newProd = await dbStore.createProduct({
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`, barcode: barcode || `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name, categoryId, categoryName: cat?.name || 'Umum', supplierId, supplierName: sup?.name,
      buyPrice: Number(buyPrice), sellPrice: Number(sellPrice), stock: Number(stock || 0), minStock: Number(minStock || 10),
      status: 'ACTIVE', imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'
    }, req.user.id, req.user.name);
    await dbStore.addAuditLog(req.user.id, req.user.name, 'OWNER', 'CREATE_PRODUCT', 'PRODUCTS', `Menambah produk baru: ${name}`);
    res.status(201).json(newProd);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.put('/products/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    const { name, categoryId, supplierId, buyPrice, sellPrice, minStock, status, imageUrl, barcode } = req.body;
    const cats = await dbStore.getCategories();
    const sups = await dbStore.getSuppliers();
    const cat = cats.find((c) => c.id === categoryId);
    const sup = sups.find((s) => s.id === supplierId);
    const updated = await dbStore.updateProduct(req.params.id, {
      ...(name && { name }), ...(categoryId && { categoryId, categoryName: cat?.name }), ...(supplierId && { supplierId, supplierName: sup?.name }),
      ...(buyPrice !== undefined && { buyPrice: Number(buyPrice) }), ...(sellPrice !== undefined && { sellPrice: Number(sellPrice) }),
      ...(minStock !== undefined && { minStock: Number(minStock) }), ...(status && { status }), ...(imageUrl !== undefined && { imageUrl }), ...(barcode && { barcode })
    }, req.user.id, req.user.name);
    res.json(updated);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
router.delete('/products/:id', authenticateToken, requireRole('OWNER'), async (req: any, res) => {
  try {
    await dbStore.deleteProduct(req.params.id, req.user.id, req.user.name);
    res.json({ success: true });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});
export default router;
