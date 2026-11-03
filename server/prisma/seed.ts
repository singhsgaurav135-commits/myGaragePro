import { PrismaClient, Role, JobStatus, Priority, TaskStatus, EstimateStatus, PaymentStatus, StockType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GaragePro database...');

  // 1. Settings
  await prisma.garageSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      garageName: 'GaragePro Auto Works',
      tagline: 'The OS for Modern Garages',
      phone: '+91 98765 43210',
      email: 'contact@garagepro.service',
      address: 'Plot 42, Automobile Hub, Sector 18, MIDC, Pune, MH',
      gstin: '27ABCDE1234F1Z5',
      taxRatePercent: 18.0,
      currencySymbol: '₹',
    },
  });

  // 2. Users
  const passwordHash = await bcrypt.hash('garage123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@garagepro.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@garagepro.com',
      passwordHash,
      role: Role.ADMIN,
      phone: '+91 98230 11111',
      avatar: 'AD',
    },
  });

  const advisor = await prisma.user.upsert({
    where: { email: 'advisor@garagepro.com' },
    update: {},
    create: {
      name: 'Rohan Deshmukh',
      email: 'advisor@garagepro.com',
      passwordHash,
      role: Role.SERVICE_ADVISOR,
      phone: '+91 98230 22222',
      specialty: 'Diagnostic & Customer Advisory',
    },
  });

  const mechanic1 = await prisma.user.upsert({
    where: { email: 'vikram.mechanic@garagepro.com' },
    update: {},
    create: {
      name: 'Vikram Shinde',
      email: 'vikram.mechanic@garagepro.com',
      passwordHash,
      role: Role.MECHANIC,
      phone: '+91 98230 33333',
      specialty: 'Engine & Transmission Specialist',
    },
  });

  const mechanic2 = await prisma.user.upsert({
    where: { email: 'suresh.mechanic@garagepro.com' },
    update: {},
    create: {
      name: 'Suresh Patil',
      email: 'suresh.mechanic@garagepro.com',
      passwordHash,
      role: Role.MECHANIC,
      phone: '+91 98230 44444',
      specialty: 'Brakes, Suspension & Alignment',
    },
  });

  const mechanic3 = await prisma.user.upsert({
    where: { email: 'ramesh.mechanic@garagepro.com' },
    update: {},
    create: {
      name: 'Ramesh Verma',
      email: 'ramesh.mechanic@garagepro.com',
      passwordHash,
      role: Role.MECHANIC,
      phone: '+91 98230 55555',
      specialty: 'Auto Electrical & AC Systems',
    },
  });

  const storeManager = await prisma.user.upsert({
    where: { email: 'store@garagepro.com' },
    update: {},
    create: {
      name: 'Ganesh Kulkarni',
      email: 'store@garagepro.com',
      passwordHash,
      role: Role.STORE_MANAGER,
      phone: '+91 98230 66666',
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@garagepro.com' },
    update: {},
    create: {
      name: 'Pooja Nair',
      email: 'accountant@garagepro.com',
      passwordHash,
      role: Role.ACCOUNTANT,
      phone: '+91 98230 77777',
    },
  });

  // 3. Customers & Vehicles
  const customersData = [
    {
      name: 'Rajesh Kumar',
      phone: '+91 98901 12345',
      email: 'rajesh.kumar@example.com',
      city: 'Pune',
      address: 'Flat 402, Green Meadows, Baner',
      vehicle: {
        registrationNumber: 'MH-12-AB-1234',
        make: 'Honda',
        model: 'City 2023',
        year: 2023,
        fuelType: 'Petrol',
        mileage: 18500,
        color: 'Platinum White',
        vin: 'MA3FNE81S00123456',
      },
    },
    {
      name: 'Amit Patel',
      phone: '+91 98902 23456',
      email: 'amit.patel@example.com',
      city: 'Mumbai',
      address: '12 Marine Drive, Nariman Point',
      vehicle: {
        registrationNumber: 'MH-01-EF-9012',
        make: 'Toyota',
        model: 'Fortuner 4x4',
        year: 2022,
        fuelType: 'Diesel',
        mileage: 42000,
        color: 'Super White',
        vin: 'MBJ11FE2000654321',
      },
    },
    {
      name: 'Neha Singh',
      phone: '+91 98903 34567',
      email: 'neha.singh@example.com',
      city: 'Pune',
      address: 'B-704, Marvel Zephyr, Kharadi',
      vehicle: {
        registrationNumber: 'MH-03-GH-3456',
        make: 'Hyundai',
        model: 'Creta SX(O)',
        year: 2021,
        fuelType: 'Diesel',
        mileage: 31000,
        color: 'Phantom Black',
        vin: 'MALC1236549871234',
      },
    },
    {
      name: 'Vikram Rao',
      phone: '+91 98904 45678',
      email: 'vikram.rao@example.com',
      city: 'Thane',
      address: 'Plot 88, Hiranandani Estate',
      vehicle: {
        registrationNumber: 'MH-02-JK-7890',
        make: 'Tata',
        model: 'Safari Dark Edition',
        year: 2022,
        fuelType: 'Diesel',
        mileage: 26000,
        color: 'Oberon Black',
        vin: 'MAT61287645391204',
      },
    },
    {
      name: 'Priya Sharma',
      phone: '+91 98905 56789',
      email: 'priya.sharma@example.com',
      city: 'Pune',
      address: 'Row House 14, Koregaon Park',
      vehicle: {
        registrationNumber: 'MH-04-CD-5678',
        make: 'Maruti Suzuki',
        model: 'Swift ZXi+',
        year: 2020,
        fuelType: 'Petrol',
        mileage: 38000,
        color: 'Solid Fire Red',
        vin: 'MA3EW82S003498127',
      },
    },
  ];

  const createdCustomers: any[] = [];
  const createdVehicles: any[] = [];

  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        address: c.address,
      },
    });
    createdCustomers.push(cust);

    const veh = await prisma.vehicle.upsert({
      where: { registrationNumber: c.vehicle.registrationNumber },
      update: {},
      create: {
        registrationNumber: c.vehicle.registrationNumber,
        make: c.vehicle.make,
        model: c.vehicle.model,
        year: c.vehicle.year,
        fuelType: c.vehicle.fuelType,
        mileage: c.vehicle.mileage,
        color: c.vehicle.color,
        vin: c.vehicle.vin,
        customerId: cust.id,
      },
    });
    createdVehicles.push(veh);
  }

  // 4. Spare Parts Inventory
  const partsData = [
    { partNumber: 'PART-ENG-001', name: 'Castrol Magnatec 5W-30 Full Synth (3.5L)', category: 'Lubricants', unit: 'Can', costPrice: 1600, sellingPrice: 2200, stockQuantity: 28, minStockLevel: 10, rackLocation: 'Rack A-1' },
    { partNumber: 'PART-FIL-002', name: 'Bosch Genuine Engine Oil Filter', category: 'Filters', unit: 'Pcs', costPrice: 220, sellingPrice: 450, stockQuantity: 42, minStockLevel: 15, rackLocation: 'Rack A-2' },
    { partNumber: 'PART-FIL-003', name: 'High Air Flow Cabin Air Filter', category: 'Filters', unit: 'Pcs', costPrice: 350, sellingPrice: 650, stockQuantity: 19, minStockLevel: 8, rackLocation: 'Rack A-3' },
    { partNumber: 'PART-BRK-004', name: 'Brembo Ceramic Front Brake Pads', category: 'Brakes', unit: 'Set', costPrice: 1800, sellingPrice: 2850, stockQuantity: 12, minStockLevel: 5, rackLocation: 'Rack B-1' },
    { partNumber: 'PART-BRK-005', name: 'DOT 4 High Performance Brake Fluid (500ml)', category: 'Brakes', unit: 'Bottle', costPrice: 180, sellingPrice: 320, stockQuantity: 25, minStockLevel: 10, rackLocation: 'Rack B-2' },
    { partNumber: 'PART-BAT-006', name: 'Amaron Pro 12V 45Ah Auto Battery', category: 'Electrical', unit: 'Unit', costPrice: 4200, sellingPrice: 5600, stockQuantity: 6, minStockLevel: 3, rackLocation: 'Rack C-1' },
    { partNumber: 'PART-WIP-007', name: 'Bosch Clear Advantage Frameless Wipers (Pair)', category: 'Accessories', unit: 'Pair', costPrice: 650, sellingPrice: 1100, stockQuantity: 14, minStockLevel: 5, rackLocation: 'Rack C-2' },
    { partNumber: 'PART-AC-008', name: 'DuPont R134a AC Refrigerant Gas Can', category: 'AC System', unit: 'Can', costPrice: 850, sellingPrice: 1450, stockQuantity: 8, minStockLevel: 4, rackLocation: 'Rack D-1' },
    { partNumber: 'PART-SPK-009', name: 'NGK Iridium Spark Plugs (Pack of 4)', category: 'Engine', unit: 'Pack', costPrice: 1200, sellingPrice: 1900, stockQuantity: 9, minStockLevel: 4, rackLocation: 'Rack D-2' },
    { partNumber: 'PART-CLT-010', name: 'Valeo Organic Clutch Plate & Release Bearing', category: 'Transmission', unit: 'Kit', costPrice: 3800, sellingPrice: 5400, stockQuantity: 4, minStockLevel: 2, rackLocation: 'Rack E-1' },
  ];

  const createdParts: any[] = [];
  for (const p of partsData) {
    const part = await prisma.sparePart.upsert({
      where: { partNumber: p.partNumber },
      update: {},
      create: p,
    });
    createdParts.push(part);
  }

  // 5. Suppliers
  const suppliersData = [
    { name: 'Bosch Automotive Components Ltd', contactPerson: 'Arun Deshpande', phone: '+91 97654 11223', email: 'orders@bosch-auto.in', address: 'Bhosari Industrial Estate, Pune', gstin: '27AABCB1234F1Z8', balance: 45000 },
    { name: 'Castrol Industrial & Lubricants', contactPerson: 'Vijay Kadam', phone: '+91 97654 33445', email: 'sales@castrol-west.in', address: 'Plot 9, Turbhe MIDC, Navi Mumbai', gstin: '27AACCC4321A1Z2', balance: 18000 },
    { name: 'Uno Minda Spares & Electricals', contactPerson: 'Dinesh Joshi', phone: '+91 97654 55667', email: 'distributor@unominda.in', address: 'Chakan Auto Park, Pune', gstin: '27AADCU9988C1Z9', balance: 0 },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.create({ data: s });
  }

  // 6. Inward Records & Job Cards
  // Job 1: Honda City - Received
  const inward1 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-001',
      vehicleId: createdVehicles[0].id,
      customerId: createdCustomers[0].id,
      odometerReading: 18520,
      fuelLevel: '75%',
      personalBelongings: 'Sunglasses, Dashcam memory card',
      scratchDamageNotes: 'Minor scratch on rear left bumper',
      status: 'IN_GARAGE',
    },
  });

  const jc1 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-001',
      customerId: createdCustomers[0].id,
      vehicleId: createdVehicles[0].id,
      inwardRecordId: inward1.id,
      status: JobStatus.RECEIVED,
      priority: Priority.URGENT,
      serviceType: 'Full Service',
      customerConcerns: 'Routine 20k maintenance, slight squeak when pressing brakes at low speed',
      estimatedCost: 6500,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  // Tasks for Job 1
  await prisma.jobTask.create({
    data: {
      jobCardId: jc1.id,
      description: 'Periodic 50-point engine and fluids inspection',
      mechanicId: mechanic1.id,
      laborCost: 1200,
      status: TaskStatus.PENDING,
    },
  });

  // Job 2: Maruti Swift - Received
  const inward2 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-002',
      vehicleId: createdVehicles[4].id,
      customerId: createdCustomers[4].id,
      odometerReading: 38240,
      fuelLevel: '50%',
      personalBelongings: 'Toolkit in boot, fastag attached',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc2 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-002',
      customerId: createdCustomers[4].id,
      vehicleId: createdVehicles[4].id,
      inwardRecordId: inward2.id,
      status: JobStatus.RECEIVED,
      priority: Priority.NORMAL,
      serviceType: 'AC Repair & Cabin Cleaning',
      customerConcerns: 'AC cooling very weak during daytime, cabin smell',
      estimatedCost: 3800,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 18 * 3600 * 1000),
    },
  });

  // Job 3: Toyota Fortuner - In Progress (Engine Overhaul / Check)
  const inward3 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-003',
      vehicleId: createdVehicles[1].id,
      customerId: createdCustomers[1].id,
      odometerReading: 42100,
      fuelLevel: '90%',
      personalBelongings: 'Luggage carrier empty, leather seats intact',
      scratchDamageNotes: 'Stone chips on front hood',
      status: 'IN_GARAGE',
    },
  });

  const jc3 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-003',
      customerId: createdCustomers[1].id,
      vehicleId: createdVehicles[1].id,
      inwardRecordId: inward3.id,
      status: JobStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      serviceType: 'Engine Overhaul & Major Tune-up',
      customerConcerns: 'Engine warning light ON, heavy carbon deposit & turbo lag under load',
      estimatedCost: 28500,
      actualCost: 14200,
      promisedDate: new Date(Date.now() + 48 * 3600 * 1000),
    },
  });

  await prisma.jobTask.createMany({
    data: [
      {
        jobCardId: jc3.id,
        description: 'Remove intercooler and clean intake manifold carbon',
        mechanicId: mechanic1.id,
        laborCost: 4500,
        status: TaskStatus.IN_PROGRESS,
      },
      {
        jobCardId: jc3.id,
        description: 'Injector pressure calibration & fuel line flush',
        mechanicId: mechanic1.id,
        laborCost: 3200,
        status: TaskStatus.PENDING,
      },
    ],
  });

  // Inspection for Job 3
  await prisma.vehicleInspection.create({
    data: {
      jobCardId: jc3.id,
      inspectorId: advisor.id,
      engineOil: 'LOW',
      brakeCondition: 'GOOD',
      tyreCondition: 'GOOD',
      batteryHealth: 'GOOD',
      electricalLights: 'GOOD',
      suspension: 'GOOD',
      bodyDamageDetails: 'Minor stone chips on front bonnet',
      overallPassed: false,
      inspectionNotes: 'Intake carbonization found, oil viscosity degraded.',
    },
  });

  // Job 4: Hyundai Creta - Waiting Parts (Brake Pads)
  const inward4 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-004',
      vehicleId: createdVehicles[2].id,
      customerId: createdCustomers[2].id,
      odometerReading: 31200,
      fuelLevel: '40%',
      personalBelongings: 'Child seat in rear left',
      scratchDamageNotes: 'Small door ding right rear door',
      status: 'IN_GARAGE',
    },
  });

  const jc4 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-004',
      customerId: createdCustomers[2].id,
      vehicleId: createdVehicles[2].id,
      inwardRecordId: inward4.id,
      status: JobStatus.WAITING_PARTS,
      priority: Priority.HIGH,
      serviceType: 'Brake Pads & Rotor Resurfacing',
      customerConcerns: 'Metal grinding sound from front wheels when stopping',
      estimatedCost: 5200,
      actualCost: 4850,
      promisedDate: new Date(Date.now() + 12 * 3600 * 1000),
    },
  });

  // Estimate for Job 4
  const est4 = await prisma.estimate.create({
    data: {
      estimateNumber: 'EST-2026-004',
      jobCardId: jc4.id,
      subtotal: 4400,
      taxRate: 18.0,
      taxAmount: 792,
      grandTotal: 5192,
      status: EstimateStatus.APPROVED,
      customerNotes: 'Approved by customer over phone at 11:30 AM',
    },
  });

  await prisma.estimateItem.createMany({
    data: [
      { estimateId: est4.id, description: 'Brembo Front Ceramic Brake Pad Set', itemType: 'PART', quantity: 1, unitPrice: 2850, total: 2850 },
      { estimateId: est4.id, description: 'Front Rotor Disc Resurfacing Lathe Work', itemType: 'LABOR', quantity: 2, unitPrice: 450, total: 900 },
      { estimateId: est4.id, description: 'Brake Caliper Servicing & Greasing', itemType: 'LABOR', quantity: 1, unitPrice: 650, total: 650 },
    ],
  });

  // Job 5: Tata Safari - Quality Check (Battery & Service Done)
  const inward5 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-005',
      vehicleId: createdVehicles[3].id,
      customerId: createdCustomers[3].id,
      odometerReading: 26400,
      fuelLevel: '60%',
      personalBelongings: 'Umbrella in side pocket',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc5 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-005',
      customerId: createdCustomers[3].id,
      vehicleId: createdVehicles[3].id,
      inwardRecordId: inward5.id,
      status: JobStatus.QUALITY_CHECK,
      priority: Priority.NORMAL,
      serviceType: 'Battery Replacement & General Electrical Audit',
      customerConcerns: 'Car took multiple cranks to start in the morning, audio screen restarts',
      estimatedCost: 7200,
      actualCost: 7100,
      promisedDate: new Date(Date.now() + 4 * 3600 * 1000),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc5.id,
      description: 'Replace 12V 45Ah Battery with new Amaron unit & test charging circuit',
      mechanicId: mechanic3.id,
      laborCost: 450,
      status: TaskStatus.COMPLETED,
    },
  });

  // Part usage for Job 5
  await prisma.partUsage.create({
    data: {
      jobCardId: jc5.id,
      sparePartId: createdParts[5].id, // Amaron Battery
      quantity: 1,
      unitPrice: 5600,
      total: 5600,
    },
  });

  // Invoice for Job 5
  const inv5 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      jobCardId: jc5.id,
      customerId: createdCustomers[3].id,
      subtotal: 6050,
      taxRate: 18.0,
      taxAmount: 1089,
      discount: 0,
      grandTotal: 7139,
      paidAmount: 7139,
      balanceAmount: 0,
      status: PaymentStatus.PAID,
      dueDate: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-001',
      invoiceId: inv5.id,
      customerId: createdCustomers[3].id,
      amount: 7139,
      method: 'UPI',
      transactionRef: 'UPI/20261103/65487319',
      notes: 'GPay payment received',
    },
  });

  // Quality check for Job 5
  await prisma.qualityInspection.create({
    data: {
      jobCardId: jc5.id,
      inspectorId: admin.id,
      roadTestDone: true,
      cleanlinessDone: true,
      allTasksVerified: true,
      passed: true,
      comments: 'Alternator charging voltage optimal at 14.2V. All electricals functioning normally.',
    },
  });

  // 7. Appointments
  await prisma.appointment.createMany({
    data: [
      {
        appointmentNumber: 'APT-2026-101',
        customerId: createdCustomers[0].id,
        vehicleId: createdVehicles[0].id,
        appointmentDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        serviceType: 'Tire Rotation & Wheel Balancing',
        notes: 'Requested pickup by morning 10 AM',
        status: 'CONFIRMED',
      },
      {
        appointmentNumber: 'APT-2026-102',
        customerId: createdCustomers[2].id,
        vehicleId: createdVehicles[2].id,
        appointmentDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        serviceType: 'Monsoon Checkup & Wiper Replacement',
        notes: 'Check underbody rust protection coating',
        status: 'CONFIRMED',
      },
    ],
  });

  // 8. Service Reminders
  await prisma.serviceReminder.createMany({
    data: [
      {
        vehicleId: createdVehicles[0].id,
        customerId: createdCustomers[0].id,
        reminderType: 'PERIODIC_SERVICE',
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: 'Next scheduled 20,000 KM service due',
      },
      {
        vehicleId: createdVehicles[1].id,
        customerId: createdCustomers[1].id,
        reminderType: 'INSURANCE_RENEWAL',
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: 'HDFC ERGO Comprehensive Policy expiring soon',
      },
      {
        vehicleId: createdVehicles[4].id,
        customerId: createdCustomers[4].id,
        reminderType: 'PUC_RENEWAL',
        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: 'PUC certificate validity expiring this week',
      },
    ],
  });

  // 9. Expenses
  await prisma.expense.createMany({
    data: [
      {
        expenseNumber: 'EXP-2026-001',
        category: 'Workshop Tools',
        amount: 3500,
        paymentMethod: 'UPI',
        description: 'Stanley 1/2" Torque Wrench replacement for Bay 3',
        paidTo: 'Industrial Hardware Store',
      },
      {
        expenseNumber: 'EXP-2026-002',
        category: 'Consumables',
        amount: 1850,
        paymentMethod: 'CASH',
        description: 'Cotton waste rags, WD-40 cans and brake cleaner spray',
        paidTo: 'Apex Auto Supplies',
      },
      {
        expenseNumber: 'EXP-2026-003',
        category: 'Electricity & Utilities',
        amount: 8400,
        paymentMethod: 'NET_BANKING',
        description: 'MSEDCL 3-Phase Workshop Electricity Bill for October',
        paidTo: 'MSEDCL',
      },
    ],
  });

  // 10. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entity: 'JobCard',
        entityId: jc1.id,
        performedBy: 'Admin User',
        details: 'Created Job Card JC-2026-001 for MH-12-AB-1234',
      },
      {
        action: 'STATUS_CHANGE',
        entity: 'JobCard',
        entityId: jc3.id,
        performedBy: 'Rohan Deshmukh (Advisor)',
        details: 'Moved JC-2026-003 to IN_PROGRESS. Mechanic Vikram Shinde assigned.',
      },
      {
        action: 'PAYMENT_RECEIVED',
        entity: 'Invoice',
        entityId: inv5.id,
        performedBy: 'Pooja Nair (Accountant)',
        details: 'Recorded full payment of ₹7,139 via UPI for Invoice INV-2026-001',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

