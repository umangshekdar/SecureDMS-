import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env is loaded before process.env is read, regardless of cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Validates essential environment variables and exposes configuration object.
 */
const requiredEnvVars = [];

// Validate if any strictly critical variables are missing
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.warn(`[WARN] Environment variable ${varName} is missing.`);
  }
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securedms',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_securedms_2026_demo_secure_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export default env;
