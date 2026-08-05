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

export default router;
