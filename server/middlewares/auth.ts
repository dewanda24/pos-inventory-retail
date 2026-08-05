import jwt from 'jsonwebtoken';
import { UserRole } from '../../src/types';
import { JWT_SECRET } from '../config';

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Sesi tidak ditemukan, silakan login.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Sesi telah kadaluarsa atau tidak valid.' });
    }
    req.user = user;
    next();
  });
};

export const requireRole = (role: UserRole) => {
  return (req: any, res: any, next: any) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: `Akses ditolak. Fitur ini hanya untuk ${role}.` });
    }
  };
};
