import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Get all customers with search & filter
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const whereClause: any = {};
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        vehicles: true,
        jobCards: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer details
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        vehicles: {
          include: {
            jobCards: {
              include: { invoice: true, tasks: true, partsUsed: { include: { sparePart: true } } },
            },
          },
        },
        appointments: true,
        invoices: {
          include: { payments: true },
        },
        complaints: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer with optional vehicle
router.post('/', async (req, res) => {
  const { name, phone, email, address, city, gstNumber, vehicle } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone are required' });
  }

  try {
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ error: 'A customer with this phone number already exists' });
    }

    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          name,
          phone,
          email,
          address,
          city,
          gstNumber,
        },
      });

      if (vehicle && vehicle.registrationNumber) {
        // Prevent duplicate vehicle
        const existingVehicle = await tx.vehicle.findUnique({
          where: { registrationNumber: vehicle.registrationNumber.toUpperCase().trim() },
        });

        if (existingVehicle) {
          throw new Error(`Vehicle ${vehicle.registrationNumber} already registered in system`);
        }

        await tx.vehicle.create({
          data: {
            registrationNumber: vehicle.registrationNumber.toUpperCase().trim(),
            make: vehicle.make || 'Unknown',
            model: vehicle.model || 'Unknown',
            year: Number(vehicle.year) || new Date().getFullYear(),
            fuelType: vehicle.fuelType || 'Petrol',
            mileage: Number(vehicle.mileage) || 0,
            color: vehicle.color,
            vin: vehicle.vin,
            customerId: newCustomer.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Customer',
          entityId: newCustomer.id,
          details: `Registered customer ${name} (${phone})`,
        },
      });

      return newCustomer;
    });

    const fullCustomer = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: { vehicles: true },
    });

    res.status(201).json(fullCustomer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  const { name, phone, email, address, city, gstNumber } = req.body;
  try {
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone, email, address, city, gstNumber },
      include: { vehicles: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

