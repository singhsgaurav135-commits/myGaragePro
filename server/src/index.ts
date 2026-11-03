import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import customerRoutes from './routes/customers';
import vehicleRoutes from './routes/vehicles';
import inwardRoutes from './routes/inward';
import jobcardRoutes from './routes/jobcards';
import inventoryRoutes from './routes/inventory';
import invoiceRoutes from './routes/invoices';
import operationsRoutes from './routes/operations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/inward', inwardRoutes);
app.use('/api/jobcards', jobcardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/operations', operationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Export for serverless / Vercel
export default app;

// Start server if run directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`GaragePro API Server listening on port ${PORT}`);
  });
}

