import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Get all inward gate entries
router.get('/', async (req, res) => {
  try {
    const records = await prisma.inwardRecord.findMany({
      include: {
        customer: true,
        vehicle: true,
        jobCard: true,
      },
      orderBy: { inwardDate: 'desc' },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new inward entry (and optionally auto-create Job Card)
router.post('/', async (req, res) => {
  const {
    vehicleId,
    customerId,
    odometerReading,
    fuelLevel,
    personalBelongings,
    scratchDamageNotes,
    createJobCard,
    serviceType,
    customerConcerns,
    priority,
  } = req.body;

  if (!vehicleId || !customerId) {
    return res.status(400).json({ error: 'Vehicle ID and Customer ID are required' });
  }

  try {
    const count = await prisma.inwardRecord.count();
    const gateEntryNumber = `GE-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const record = await prisma.$transaction(async (tx) => {
      // 1. Create inward record
      const newInward = await tx.inwardRecord.create({
        data: {
          gateEntryNumber,
          vehicleId,
          customerId,
          odometerReading: Number(odometerReading) || 0,
          fuelLevel: fuelLevel || '50%',
          personalBelongings,
          scratchDamageNotes,
          status: 'IN_GARAGE',
        },
      });

      // Update vehicle mileage
      if (odometerReading) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { mileage: Number(odometerReading) },
        });
      }

      // 2. Optionally create job card right away
      if (createJobCard) {
        const jcCount = await tx.jobCard.count();
        const jobCardNumber = `JC-${new Date().getFullYear()}-${String(jcCount + 1).padStart(3, '0')}`;

        await tx.jobCard.create({
          data: {
            jobCardNumber,
            vehicleId,
            customerId,
            inwardRecordId: newInward.id,
            status: 'RECEIVED',
            priority: priority || 'NORMAL',
            serviceType: serviceType || 'General Service',
            customerConcerns: customerConcerns || 'Standard Maintenance',
            promisedDate: new Date(Date.now() + 24 * 3600 * 1000),
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'InwardRecord',
          entityId: newInward.id,
          details: `Gate entry ${gateEntryNumber} recorded`,
        },
      });

      return newInward;
    });

    const fullRecord = await prisma.inwardRecord.findUnique({
      where: { id: record.id },
      include: { vehicle: true, customer: true, jobCard: true },
    });

    res.status(201).json(fullRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

