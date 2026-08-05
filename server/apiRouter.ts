import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import inventoryRoutes from './routes/inventory.routes';
import posRoutes from './routes/pos.routes';
import financeRoutes from './routes/finance.routes';
import systemRoutes from './routes/system.routes';
import publicRoutes from './routes/public.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/', inventoryRoutes);
apiRouter.use('/', posRoutes);
apiRouter.use('/', financeRoutes);
apiRouter.use('/', systemRoutes);
apiRouter.use('/public', publicRoutes);

export default apiRouter;
