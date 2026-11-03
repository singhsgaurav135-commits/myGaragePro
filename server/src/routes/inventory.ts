import { Router } from 'express';
import { prisma } from '../prisma';
import { StockType } from '@prisma/client';

const router = Router();

// Get inventory items
router.get('/', async (req, res) => {
  const { search, category, lowStock } = req.query;
  try {
    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = category;
    }

    const parts = await prisma.sparePart.findMany({
      where: whereClause,
      include: {
        movements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const filtered = lowStock === 'true'
      ? parts.filter((p) => p.stockQuantity <= p.minStockLevel)
      : parts;

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add spare part
router.post('/', async (req, res) => {
  const { partNumber, name, category, unit, costPrice, sellingPrice, stockQuantity, minStockLevel, rackLocation } = req.body;

  if (!partNumber || !name) {
    return res.status(400).json({ error: 'Part Number and Name are required' });
  }

  try {
    const existing = await prisma.sparePart.findUnique({
      where: { partNumber: partNumber.toUpperCase().trim() },
    });
    if (existing) {
      return res.status(400).json({ error: `Part number ${partNumber} already exists` });
    }

    const part = await prisma.$transaction(async (tx) => {
      const initialQty = Number(stockQuantity) || 0;
      const newPart = await tx.sparePart.create({
        data: {
          partNumber: partNumber.toUpperCase().trim(),
          name,
          category: category || 'General',
          unit: unit || 'pcs',
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          stockQuantity: initialQty,
          minStockLevel: Number(minStockLevel) || 5,
          rackLocation,
        },
      });

      if (initialQty > 0) {
        await tx.stockMovement.create({
          data: {
            sparePartId: newPart.id,
            type: StockType.PURCHASE,
            quantity: initialQty,
            balanceAfter: initialQty,
            reason: 'Opening Balance Inventory',
          },
        });
      }

      return newPart;
    });

    res.status(201).json(part);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Stock adjustment (Manual addition / deduction)
router.post('/:id/adjust', async (req, res) => {
  const { type, quantity, reason } = req.body; // type: PURCHASE, ADJUSTMENT, RETURN
  const qty = Number(quantity);

  if (!qty || qty <= 0) {
    return res.status(400).json({ error: 'Valid positive quantity required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const part = await tx.sparePart.findUnique({ where: { id: req.params.id } });
      if (!part) throw new Error('Part not found');

      let newBalance = part.stockQuantity;
      if (type === 'PURCHASE' || type === 'RETURN' || type === 'ADD') {
        newBalance += qty;
      } else {
        if (part.stockQuantity < qty) {
          throw new Error(`Cannot deduct ${qty}. Only ${part.stockQuantity} in stock.`);
        }
        newBalance -= qty;
      }

      const updatedPart = await tx.sparePart.update({
        where: { id: req.params.id },
        data: { stockQuantity: newBalance },
      });

      await tx.stockMovement.create({
        data: {
          sparePartId: part.id,
          type: (type === 'ADD' ? StockType.ADJUSTMENT : type) as StockType,
          quantity: qty,
          balanceAfter: newBalance,
          reason: reason || 'Inventory count adjustment',
        },
      });

      return updatedPart;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get stock movements
router.get('/movements', async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { sparePart: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

