import { Router } from 'express';
import { prisma } from '../prisma';
import { JobStatus, Priority, TaskStatus, EstimateStatus, StockType } from '@prisma/client';

const router = Router();

// Get all job cards with filtering and search
router.get('/', async (req, res) => {
  const { status, search, mechanicId } = req.query;
  try {
    const whereClause: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (mechanicId && typeof mechanicId === 'string') {
      whereClause.tasks = {
        some: { mechanicId },
      };
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { jobCardNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { registrationNumber: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const jobCards = await prisma.jobCard.findMany({
      where: whereClause,
      include: {
        customer: true,
        vehicle: true,
        tasks: {
          include: { mechanic: true },
        },
        estimate: true,
        invoice: true,
        partsUsed: {
          include: { sparePart: true },
        },
        inspection: true,
        qualityCheck: true,
        deliveryRecord: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobCards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job card by ID
router.get('/:id', async (req, res) => {
  try {
    const jobCard = await prisma.jobCard.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        vehicle: true,
        inwardRecord: true,
        inspection: {
          include: { inspector: true },
        },
        estimate: {
          include: { items: true },
        },
        tasks: {
          include: { mechanic: true },
        },
        partsUsed: {
          include: { sparePart: true },
        },
        qualityCheck: {
          include: { inspector: true },
        },
        deliveryRecord: true,
        invoice: {
          include: { payments: true },
        },
        complaints: true,
        warrantyClaims: true,
      },
    });

    if (!jobCard) {
      return res.status(404).json({ error: 'Job Card not found' });
    }

    res.json(jobCard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Job Card
router.post('/', async (req, res) => {
  const { customerId, vehicleId, serviceType, customerConcerns, priority, promisedDate, estimatedCost } = req.body;

  if (!customerId || !vehicleId) {
    return res.status(400).json({ error: 'Customer ID and Vehicle ID are required' });
  }

  try {
    const count = await prisma.jobCard.count();
    const jobCardNumber = `JC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newJob = await prisma.jobCard.create({
      data: {
        jobCardNumber,
        customerId,
        vehicleId,
        serviceType: serviceType || 'Full Service',
        customerConcerns,
        priority: (priority as Priority) || Priority.NORMAL,
        promisedDate: promisedDate ? new Date(promisedDate) : new Date(Date.now() + 24 * 3600 * 1000),
        estimatedCost: Number(estimatedCost) || 0,
        status: JobStatus.RECEIVED,
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'JobCard',
        entityId: newJob.id,
        details: `Created Job Card ${jobCardNumber} for ${newJob.vehicle.registrationNumber}`,
      },
    });

    res.status(201).json(newJob);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Job Card status (Kanban stage change)
router.patch('/:id/status', async (req, res) => {
  const { status, remarks } = req.body;

  try {
    const updated = await prisma.jobCard.update({
      where: { id: req.params.id },
      data: {
        status: status as JobStatus,
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'STATUS_CHANGE',
        entity: 'JobCard',
        entityId: updated.id,
        details: `Updated Job Card ${updated.jobCardNumber} to ${status}. ${remarks || ''}`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add Task to Job Card
router.post('/:id/tasks', async (req, res) => {
  const { description, mechanicId, laborCost } = req.body;
  try {
    const task = await prisma.jobTask.create({
      data: {
        jobCardId: req.params.id,
        description,
        mechanicId,
        laborCost: Number(laborCost) || 0,
        status: TaskStatus.PENDING,
      },
      include: { mechanic: true },
    });

    // Update actualCost of job card
    const allTasks = await prisma.jobTask.findMany({ where: { jobCardId: req.params.id } });
    const allParts = await prisma.partUsage.findMany({ where: { jobCardId: req.params.id } });
    const totalLabor = allTasks.reduce((sum, t) => sum + t.laborCost, 0);
    const totalParts = allParts.reduce((sum, p) => sum + p.total, 0);

    await prisma.jobCard.update({
      where: { id: req.params.id },
      data: { actualCost: totalLabor + totalParts },
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Task status
router.patch('/tasks/:taskId', async (req, res) => {
  const { status, mechanicId, laborCost } = req.body;
  try {
    const updated = await prisma.jobTask.update({
      where: { id: req.params.taskId },
      data: {
        ...(status && { status: status as TaskStatus }),
        ...(mechanicId && { mechanicId }),
        ...(laborCost !== undefined && { laborCost: Number(laborCost) }),
      },
      include: { mechanic: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Issue Spare Part to Job Card (Inventory Transaction!)
router.post('/:id/parts', async (req, res) => {
  const { sparePartId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const part = await tx.sparePart.findUnique({ where: { id: sparePartId } });
      if (!part) {
        throw new Error('Spare part not found');
      }

      if (part.stockQuantity < qty) {
        throw new Error(`Insufficient stock for ${part.name}. Available: ${part.stockQuantity}, Requested: ${qty}`);
      }

      const total = part.sellingPrice * qty;

      // 1. Create part usage
      const usage = await tx.partUsage.create({
        data: {
          jobCardId: req.params.id,
          sparePartId,
          quantity: qty,
          unitPrice: part.sellingPrice,
          total,
        },
        include: { sparePart: true },
      });

      // 2. Decrement stock
      const newStock = part.stockQuantity - qty;
      await tx.sparePart.update({
        where: { id: sparePartId },
        data: { stockQuantity: newStock },
      });

      // 3. Log stock movement
      await tx.stockMovement.create({
        data: {
          sparePartId,
          type: StockType.USAGE,
          quantity: qty,
          balanceAfter: newStock,
          reason: `Issued to Job Card`,
          referenceNo: req.params.id,
        },
      });

      // 4. Update actual cost on job card
      const allTasks = await tx.jobTask.findMany({ where: { jobCardId: req.params.id } });
      const allParts = await tx.partUsage.findMany({ where: { jobCardId: req.params.id } });
      const totalLabor = allTasks.reduce((sum, t) => sum + t.laborCost, 0);
      const totalParts = allParts.reduce((sum, p) => sum + p.total, 0);

      await tx.jobCard.update({
        where: { id: req.params.id },
        data: { actualCost: totalLabor + totalParts },
      });

      return usage;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Vehicle Inspection Checklist Save
router.post('/:id/inspection', async (req, res) => {
  const { engineOil, brakeCondition, tyreCondition, batteryHealth, electricalLights, suspension, bodyDamageDetails, overallPassed, inspectionNotes } = req.body;

  try {
    const inspection = await prisma.vehicleInspection.upsert({
      where: { jobCardId: req.params.id },
      update: {
        engineOil: engineOil || 'GOOD',
        brakeCondition: brakeCondition || 'GOOD',
        tyreCondition: tyreCondition || 'GOOD',
        batteryHealth: batteryHealth || 'GOOD',
        electricalLights: electricalLights || 'GOOD',
        suspension: suspension || 'GOOD',
        bodyDamageDetails,
        overallPassed: overallPassed !== undefined ? overallPassed : true,
        inspectionNotes,
      },
      create: {
        jobCardId: req.params.id,
        engineOil: engineOil || 'GOOD',
        brakeCondition: brakeCondition || 'GOOD',
        tyreCondition: tyreCondition || 'GOOD',
        batteryHealth: batteryHealth || 'GOOD',
        electricalLights: electricalLights || 'GOOD',
        suspension: suspension || 'GOOD',
        bodyDamageDetails,
        overallPassed: overallPassed !== undefined ? overallPassed : true,
        inspectionNotes,
      },
    });

    await prisma.jobCard.update({
      where: { id: req.params.id },
      data: { status: JobStatus.ESTIMATION },
    });

    res.json(inspection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update Estimate & Items
router.post('/:id/estimate', async (req, res) => {
  const { items, customerNotes } = req.body;

  try {
    const count = await prisma.estimate.count();
    const estimateNumber = `EST-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    let subtotal = 0;
    const formattedItems = (items || []).map((item: any) => {
      const lineTotal = Number(item.quantity || 1) * Number(item.unitPrice || 0);
      subtotal += lineTotal;
      return {
        description: item.description,
        itemType: item.itemType || 'LABOR',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: lineTotal,
      };
    });

    const taxAmount = (subtotal * 18.0) / 100;
    const grandTotal = subtotal + taxAmount;

    // Remove existing estimate if any
    const existing = await prisma.estimate.findUnique({ where: { jobCardId: req.params.id } });
    if (existing) {
      await prisma.estimateItem.deleteMany({ where: { estimateId: existing.id } });
      await prisma.estimate.delete({ where: { id: existing.id } });
    }

    const estimate = await prisma.estimate.create({
      data: {
        estimateNumber,
        jobCardId: req.params.id,
        subtotal,
        taxRate: 18.0,
        taxAmount,
        grandTotal,
        status: EstimateStatus.SENT,
        customerNotes,
        items: {
          create: formattedItems,
        },
      },
      include: { items: true },
    });

    await prisma.jobCard.update({
      where: { id: req.params.id },
      data: {
        estimatedCost: grandTotal,
        status: JobStatus.PENDING_APPROVAL,
      },
    });

    res.status(201).json(estimate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Approval on Estimate
router.patch('/:id/estimate/approval', async (req, res) => {
  const { approved, notes } = req.body;

  try {
    const estimate = await prisma.estimate.findUnique({ where: { jobCardId: req.params.id } });
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    const updated = await prisma.estimate.update({
      where: { id: estimate.id },
      data: {
        status: approved ? EstimateStatus.APPROVED : EstimateStatus.REJECTED,
        approvedAt: approved ? new Date() : null,
        customerNotes: notes || (approved ? 'Approved by customer' : 'Customer declined additional work'),
      },
    });

    await prisma.jobCard.update({
      where: { id: req.params.id },
      data: {
        status: approved ? JobStatus.APPROVED : JobStatus.CANCELLED,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quality Check Record
router.post('/:id/quality-check', async (req, res) => {
  const { roadTestDone, cleanlinessDone, allTasksVerified, passed, comments } = req.body;

  try {
    const qc = await prisma.qualityInspection.upsert({
      where: { jobCardId: req.params.id },
      update: {
        roadTestDone: !!roadTestDone,
        cleanlinessDone: !!cleanlinessDone,
        allTasksVerified: !!allTasksVerified,
        passed: passed !== undefined ? !!passed : true,
        comments,
      },
      create: {
        jobCardId: req.params.id,
        roadTestDone: !!roadTestDone,
        cleanlinessDone: !!cleanlinessDone,
        allTasksVerified: !!allTasksVerified,
        passed: passed !== undefined ? !!passed : true,
        comments,
      },
    });

    if (qc.passed) {
      await prisma.jobCard.update({
        where: { id: req.params.id },
        data: { status: JobStatus.COMPLETED },
      });
    }

    res.json(qc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicle Delivery Gate Pass
router.post('/:id/delivery', async (req, res) => {
  const { deliveredTo, exitOdometer, fuelLevelOnExit, customerRating, feedback } = req.body;

  try {
    const count = await prisma.deliveryRecord.count();
    const gatePassNumber = `GP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const delivery = await prisma.deliveryRecord.create({
      data: {
        jobCardId: req.params.id,
        gatePassNumber,
        deliveredTo: deliveredTo || 'Customer',
        exitOdometer: exitOdometer ? Number(exitOdometer) : null,
        fuelLevelOnExit,
        customerRating: Number(customerRating) || 5,
        feedback,
      },
    });

    await prisma.jobCard.update({
      where: { id: req.params.id },
      data: { status: JobStatus.DELIVERED },
    });

    res.status(201).json(delivery);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

