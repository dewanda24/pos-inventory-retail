import { Router } from 'express';
import { dbStore } from '../../src/db/store';

const router = Router();

router.get('/catalog', async (req, res) => {
  try {
    const products = await dbStore.getProducts();
    const categories = await dbStore.getCategories();

    // Filter only ACTIVE products
    const activeProducts = products.filter(p => p.status === 'ACTIVE');

    // Map products to remove sensitive data
    const publicProducts = activeProducts.map(p => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      sellPrice: p.sellPrice,
      stock: p.stock,
      imageUrl: p.imageUrl,
      barcode: p.barcode,
      status: p.status
    }));

    res.json({
      products: publicProducts,
      categories: categories
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch public catalog' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { customerName, tableNumber, items, subtotal } = req.body;
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: 'Data pesanan tidak lengkap' });
    }
    const order = await dbStore.createPendingOrder({ customerName, tableNumber, items, subtotal });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
