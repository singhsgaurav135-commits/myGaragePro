import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Get vehicles with search
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const whereClause: any = {};
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        customer: true,
        jobCards: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle with full history
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        jobCards: {
          include: {
            tasks: { include: { mechanic: true } },
            partsUsed: { include: { sparePart: true } },
            invoice: true,
            inspection: true,
            qualityCheck: true,
            deliveryRecord: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        inwardRecords: {
          orderBy: { inwardDate: 'desc' },
        },
        reminders: true,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add vehicle to customer
router.post('/', async (req, res) => {
  const { registrationNumber, make, model, year, fuelType, mileage, color, vin, customerId } = req.body;

  if (!registrationNumber || !customerId) {
    return res.status(400).json({ error: 'Registration number and Customer ID are required' });
  }

  const cleanRegNo = registrationNumber.toUpperCase().trim();

  try {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: cleanRegNo },
    });
    if (existing) {
      return res.status(400).json({ error: `Vehicle ${cleanRegNo} is already registered in the system` });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: cleanRegNo,
        make: make || 'Unknown',
        model: model || 'Unknown',
        year: Number(year) || new Date().getFullYear(),
        fuelType: fuelType || 'Petrol',
        mileage: Number(mileage) || 0,
        color,
        vin,
        customerId,
      },
      include: { customer: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        details: `Added vehicle ${cleanRegNo} for customer ${vehicle.customer.name}`,
      },
    });

    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  const { make, model, year, fuelType, mileage, color, vin } = req.body;
  try {
    const updated = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        make,
        model,
        year: Number(year),
        fuelType,
        mileage: Number(mileage),
        color,
        vin,
      },
      include: { customer: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

