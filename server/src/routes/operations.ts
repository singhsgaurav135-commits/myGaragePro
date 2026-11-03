import { Router } from 'express';
import { prisma } from '../prisma';
import { StockType } from '@prisma/client';

const router = Router();

// ================= APPOINTMENTS =================
router.get('/appointments', async (req, res) => {
  try {
    const list = await prisma.appointment.findMany({
      include: { customer: true, vehicle: true },
      orderBy: { appointmentDate: 'asc' },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/appointments', async (req, res) => {
  const { customerId, vehicleId, appointmentDate, serviceType, notes } = req.body;
  try {
    const count = await prisma.appointment.count();
    const appointmentNumber = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const apt = await prisma.appointment.create({
      data: {
        appointmentNumber,
        customerId,
        vehicleId,
        appointmentDate: new Date(appointmentDate),
        serviceType: serviceType || 'General Service',
        notes,
        status: 'CONFIRMED',
      },
      include: { customer: true, vehicle: true },
    });
    res.status(201).json(apt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= SUPPLIERS & PURCHASES =================
router.get('/suppliers', async (req, res) => {
  try {
    const list = await prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          include: { items: { include: { sparePart: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suppliers', async (req, res) => {
  const { name, contactPerson, phone, email, address, gstin } = req.body;
  try {
    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address, gstin },
    });
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/purchases', async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: { include: { sparePart: true } },
      },
      orderBy: { orderDate: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Purchase Order
router.post('/purchases', async (req, res) => {
  const { supplierId, items } = req.body;

  try {
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    let totalAmount = 0;
    const formattedItems = (items || []).map((it: any) => {
      const lineTotal = Number(it.quantity) * Number(it.unitCost);
      totalAmount += lineTotal;
      return {
        sparePartId: it.sparePartId,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost),
        total: lineTotal,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        totalAmount,
        status: 'ORDERED',
        items: {
          create: formattedItems,
        },
      },
      include: { supplier: true, items: { include: { sparePart: true } } },
    });

    res.status(201).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Receive Goods for PO (Database transaction: adds stock to spare parts & updates supplier balance)
router.post('/purchases/:id/receive', async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: req.params.id },
        include: { items: true, supplier: true },
      });

      if (!po) throw new Error('Purchase order not found');
      if (po.status === 'RECEIVED') throw new Error('PO already marked received');

      // Update stock for each item
      for (const item of po.items) {
        const part = await tx.sparePart.findUnique({ where: { id: item.sparePartId } });
        if (part) {
          const newQty = part.stockQuantity + item.quantity;
          await tx.sparePart.update({
            where: { id: item.sparePartId },
            data: { stockQuantity: newQty, costPrice: item.unitCost },
          });

          await tx.stockMovement.create({
            data: {
              sparePartId: item.sparePartId,
              type: StockType.PURCHASE,
              quantity: item.quantity,
              balanceAfter: newQty,
              reason: `Goods receipt from PO ${po.poNumber}`,
              referenceNo: po.poNumber,
            },
          });
        }
      }

      // Update PO status
      const updatedPo = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED', receivedDate: new Date() },
      });

      // Update supplier balance
      await tx.supplier.update({
        where: { id: po.supplierId },
        data: { balance: { increment: po.totalAmount } },
      });

      return updatedPo;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ================= EXPENSES =================
router.get('/expenses', async (req, res) => {
  try {
    const list = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses', async (req, res) => {
  const { category, amount, paymentMethod, description, paidTo } = req.body;
  try {
    const count = await prisma.expense.count();
    const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const exp = await prisma.expense.create({
      data: {
        expenseNumber,
        category: category || 'General',
        amount: Number(amount) || 0,
        paymentMethod: paymentMethod || 'CASH',
        description,
        paidTo,
      },
    });
    res.status(201).json(exp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= REMINDERS =================
router.get('/reminders', async (req, res) => {
  try {
    const reminders = await prisma.serviceReminder.findMany({
      include: { vehicle: true, customer: true },
      orderBy: { dueDate: 'asc' },
    });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reminders', async (req, res) => {
  const { vehicleId, customerId, reminderType, dueDate, notes } = req.body;
  try {
    const reminder = await prisma.serviceReminder.create({
      data: {
        vehicleId,
        customerId,
        reminderType: reminderType || 'PERIODIC_SERVICE',
        dueDate: new Date(dueDate),
        notes,
      },
      include: { vehicle: true, customer: true },
    });
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/reminders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await prisma.serviceReminder.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= COMPLAINTS & REWORK =================
router.get('/complaints', async (req, res) => {
  try {
    const list = await prisma.customerComplaint.findMany({
      include: {
        customer: true,
        jobCard: { include: { vehicle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complaints', async (req, res) => {
  const { jobCardId, customerId, description, reworkRequired } = req.body;
  try {
    const complaint = await prisma.customerComplaint.create({
      data: {
        jobCardId,
        customerId,
        description,
        reworkRequired: !!reworkRequired,
        status: 'OPEN',
      },
      include: { customer: true, jobCard: true },
    });
    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================= SETTINGS & AUDIT =================
router.get('/settings', async (req, res) => {
  try {
    const setting = await prisma.garageSetting.findUnique({
      where: { id: 'default' },
    });
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  const { garageName, tagline, phone, email, address, gstin, taxRatePercent, currencySymbol } = req.body;
  try {
    const updated = await prisma.garageSetting.upsert({
      where: { id: 'default' },
      update: {
        garageName,
        tagline,
        phone,
        email,
        address,
        gstin,
        taxRatePercent: Number(taxRatePercent) || 18.0,
        currencySymbol: currencySymbol || '₹',
      },
      create: {
        id: 'default',
        garageName: garageName || 'GaragePro',
        tagline,
        phone,
        email,
        address,
        gstin,
        taxRatePercent: Number(taxRatePercent) || 18.0,
        currencySymbol: currencySymbol || '₹',
      },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

