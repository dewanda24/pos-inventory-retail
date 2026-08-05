import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'pos_inventory_retail_super_secret_key_2026';
export const PORT = Number(process.env.PORT) || 3000;
