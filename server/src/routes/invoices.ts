import { Router } from 'express';
import { prisma } from '../prisma';
import { PaymentStatus } from '@prisma/client';

const router = Router();

// Get all invoices
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  try {
    const whereClause: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status as PaymentStatus;
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: true,
        jobCard: {
          include: { vehicle: true },
        },
        payments: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });

    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        jobCard: {
          include: {
            vehicle: true,
            tasks: { include: { mechanic: true } },
            partsUsed: { include: { sparePart: true } },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Invoice from Job Card
router.post('/generate/:jobCardId', async (req, res) => {
  const { discount } = req.body;
  const discountVal = Number(discount) || 0;

  try {
    const jobCard = await prisma.jobCard.findUnique({
      where: { id: req.params.jobCardId },
      include: {
        customer: true,
        tasks: true,
        partsUsed: true,
        invoice: true,
      },
    });

    if (!jobCard) {
      return res.status(404).json({ error: 'Job Card not found' });
    }

    if (jobCard.invoice) {
      return res.json(jobCard.invoice); // Already generated
    }

    const laborTotal = jobCard.tasks.reduce((sum, t) => sum + t.laborCost, 0);
    const partsTotal = jobCard.partsUsed.reduce((sum, p) => sum + p.total, 0);
    const subtotal = laborTotal + partsTotal;

    const netSubtotal = Math.max(0, subtotal - discountVal);
    const taxRate = 18.0;
    const taxAmount = (netSubtotal * taxRate) / 100;
    const grandTotal = Math.round(netSubtotal + taxAmount);

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        jobCardId: jobCard.id,
        customerId: jobCard.customerId,
        subtotal,
        taxRate,
        taxAmount,
        discount: discountVal,
        grandTotal,
        paidAmount: 0,
        balanceAmount: grandTotal,
        status: PaymentStatus.UNPAID,
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
      include: { customer: true, jobCard: { include: { vehicle: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Invoice',
        entityId: invoice.id,
        details: `Generated Invoice ${invoiceNumber} for ₹${grandTotal}`,
      },
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Record Payment for Invoice
router.post('/:id/payments', async (req, res) => {
  const { amount, method, transactionRef, notes } = req.body;
  const paymentAmount = Number(amount);

  if (!paymentAmount || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: req.params.id },
      });

      if (!invoice) throw new Error('Invoice not found');

      if (paymentAmount > invoice.balanceAmount + 0.01) {
        throw new Error(`Payment ₹${paymentAmount} exceeds balance amount ₹${invoice.balanceAmount}`);
      }

      const pCount = await tx.payment.count();
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(pCount + 1).padStart(3, '0')}`;

      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: paymentAmount,
          method: method || 'UPI',
          transactionRef,
          notes,
        },
      });

      const newPaidAmount = invoice.paidAmount + paymentAmount;
      const newBalance = Math.max(0, invoice.grandTotal - newPaidAmount);

      let newStatus: PaymentStatus = PaymentStatus.PARTIAL;
      if (newBalance <= 0) {
        newStatus = PaymentStatus.PAID;
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          status: newStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT',
          entity: 'Payment',
          entityId: payment.id,
          details: `Recorded payment ${paymentNumber} of ₹${paymentAmount} via ${method}`,
        },
      });

      return payment;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

