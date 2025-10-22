// pages/api/debug-env.js
export default function handler(req, res) {
  res.status(200).json({
    postgres: process.env.POSTGRES_URL ? 'Connected ✅' : 'Not configured ❌',
    blob: process.env.BLOB_READ_WRITE_TOKEN ? 'Connected ✅' : 'Not configured ❌',
    stripe: process.env.STRIPE_SECRET_KEY ? 'Connected ✅' : 'Not configured ❌',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}
