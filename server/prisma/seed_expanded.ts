import { PrismaClient, Role, JobStatus, Priority, TaskStatus, EstimateStatus, PaymentStatus, StockType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data and populating full-scale production dataset for GaragePro...');

  // Clean existing transactional data cleanly in order of dependencies
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.estimateItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.partUsage.deleteMany();
  await prisma.jobTask.deleteMany();
  await prisma.vehicleInspection.deleteMany();
  await prisma.warrantyClaim.deleteMany();
  await prisma.customerComplaint.deleteMany();
  await prisma.jobCard.deleteMany();
  await prisma.inwardRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.serviceReminder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.auditLog.deleteMany();

  // 1. Garage Settings
  await prisma.garageSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      garageName: 'GaragePro Auto Works & Diagnostics',
      tagline: 'The OS for Modern Garages',
      phone: '+91 98765 43210',
      email: 'contact@garagepro.service',
      address: 'Plot 42, Automobile Hub, Sector 18, MIDC, Pune, Maharashtra 411019',
      gstin: '27ABCDE1234F1Z5',
      taxRatePercent: 18.0,
      currencySymbol: '₹',
    },
  });

  // 2. Users (Staff across roles)
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
      specialty: 'Brakes, Suspension & Wheel Alignment',
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
      specialty: 'Auto Electrical, ECU & HVAC Systems',
    },
  });

  const mechanic4 = await prisma.user.upsert({
    where: { email: 'anil.mechanic@garagepro.com' },
    update: {},
    create: {
      name: 'Anil Jadhav',
      email: 'anil.mechanic@garagepro.com',
      passwordHash,
      role: Role.MECHANIC,
      phone: '+91 98230 88888',
      specialty: 'Body Paint & Exterior Detailing',
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
      email: 'rajesh.kumar@tcs.com',
      city: 'Pune',
      address: 'Flat 402, Green Meadows, Baner, Pune',
      vehicles: [
        { registrationNumber: 'MH-12-AB-1234', make: 'Honda', model: 'City 2023 ZX', year: 2023, fuelType: 'Petrol', mileage: 18500, color: 'Platinum White Pearl', vin: 'MA3FNE81S00123456' },
      ],
    },
    {
      name: 'Amit Patel',
      phone: '+91 98902 23456',
      email: 'amit.patel@patelconstructions.in',
      city: 'Mumbai',
      address: '12 Marine Drive, Nariman Point, Mumbai',
      vehicles: [
        { registrationNumber: 'MH-01-EF-9012', make: 'Toyota', model: 'Fortuner 4x4 AT', year: 2022, fuelType: 'Diesel', mileage: 42000, color: 'Super White', vin: 'MBJ11FE2000654321' },
      ],
    },
    {
      name: 'Neha Singh',
      phone: '+91 98903 34567',
      email: 'neha.singh@wipro.com',
      city: 'Pune',
      address: 'B-704, Marvel Zephyr, Kharadi, Pune',
      vehicles: [
        { registrationNumber: 'MH-03-GH-3456', make: 'Hyundai', model: 'Creta SX(O) Turbo', year: 2021, fuelType: 'Diesel', mileage: 31000, color: 'Phantom Black', vin: 'MALC1236549871234' },
      ],
    },
    {
      name: 'Vikram Rao',
      phone: '+91 98904 45678',
      email: 'vikram.rao@infosys.com',
      city: 'Thane',
      address: 'Plot 88, Hiranandani Estate, Thane',
      vehicles: [
        { registrationNumber: 'MH-02-JK-7890', make: 'Tata', model: 'Safari Dark Edition', year: 2022, fuelType: 'Diesel', mileage: 26000, color: 'Oberon Black', vin: 'MAT61287645391204' },
      ],
    },
    {
      name: 'Priya Sharma',
      phone: '+91 98905 56789',
      email: 'priya.sharma@gmail.com',
      city: 'Pune',
      address: 'Row House 14, Koregaon Park, Pune',
      vehicles: [
        { registrationNumber: 'MH-04-CD-5678', make: 'Maruti Suzuki', model: 'Swift ZXi+', year: 2020, fuelType: 'Petrol', mileage: 38000, color: 'Solid Fire Red', vin: 'MA3EW82S003498127' },
      ],
    },
    {
      name: 'Kunal Deshmukh',
      phone: '+91 98906 67890',
      email: 'kunal.d@finolex.com',
      city: 'Pimpri-Chinchwad',
      address: 'Sector 25, Nigdi Pradhikaran, Pune',
      vehicles: [
        { registrationNumber: 'MH-14-GH-4455', make: 'Mahindra', model: 'Thar 4x4 Hard Top', year: 2023, fuelType: 'Diesel', mileage: 14200, color: 'Napoli Black', vin: 'MA1TA4399K0098712' },
      ],
    },
    {
      name: 'Deepak Varma',
      phone: '+91 98907 78901',
      email: 'deepak.varma@cisco.com',
      city: 'Pune',
      address: 'Tower 3, Amanora Park Town, Hadapsar',
      vehicles: [
        { registrationNumber: 'MH-12-PQ-9988', make: 'Skoda', model: 'Octavia 2.0 TSI L&K', year: 2021, fuelType: 'Petrol', mileage: 29500, color: 'Lava Blue', vin: 'TMBBA4772M1004561' },
      ],
    },
    {
      name: 'Sunita Joshi',
      phone: '+91 98908 89012',
      email: 'sunita.joshi@bankofindia.co.in',
      city: 'Pune',
      address: 'Plot 19, Mayur Colony, Kothrud, Pune',
      vehicles: [
        { registrationNumber: 'MH-12-RT-3322', make: 'Volkswagen', model: 'Virtus GT Plus 1.5 TSI', year: 2023, fuelType: 'Petrol', mileage: 11000, color: 'Wild Cherry Red', vin: 'WVWZZZ6RZHY098123' },
      ],
    },
    {
      name: 'Rohan Mehra',
      phone: '+91 98909 90123',
      email: 'rohan.mehra@techmahindra.com',
      city: 'Pune',
      address: 'Flat 501, Megapolis Mystic, Hinjewadi Phase 3',
      vehicles: [
        { registrationNumber: 'MH-12-VW-5566', make: 'Kia', model: 'Seltos GTX+ Turbo', year: 2023, fuelType: 'Petrol', mileage: 16800, color: 'Pewter Olive', vin: 'KNAFX4127P5008129' },
      ],
    },
    {
      name: 'Alok Bhattacharya',
      phone: '+91 98910 01234',
      email: 'alok.bhatt@barclays.com',
      city: 'Pune',
      address: 'Flat 1102, Blue Ridge, Hinjewadi Phase 1',
      vehicles: [
        { registrationNumber: 'MH-12-XY-7711', make: 'Tata', model: 'Nexon EV Empowered', year: 2023, fuelType: 'EV', mileage: 22000, color: 'Intensi-Teal', vin: 'MAT612999P1049182' },
      ],
    },
    {
      name: 'Manish Agarwal',
      phone: '+91 98911 12340',
      email: 'manish.agarwal@agarwalsteel.in',
      city: 'Nashik',
      address: 'MIDC Ambad, Nashik',
      vehicles: [
        { registrationNumber: 'MH-15-ZZ-1100', make: 'Mahindra', model: 'XUV700 AX7 Luxury', year: 2022, fuelType: 'Diesel', mileage: 36000, color: 'Midnight Black', vin: 'MA1XU700L99001234' },
      ],
    },
    {
      name: 'Ananya Roy',
      phone: '+91 98912 23451',
      email: 'ananya.roy@deloitte.com',
      city: 'Pune',
      address: 'Building 4, Magarpatta City, Hadapsar',
      vehicles: [
        { registrationNumber: 'MH-12-KL-6677', make: 'Hyundai', model: 'i20 N Line N8', year: 2022, fuelType: 'Petrol', mileage: 19400, color: 'Thunder Blue with Phantom Black Roof', vin: 'MALB1299N01238475' },
      ],
    },
    {
      name: 'Arvind Singhania',
      phone: '+91 98913 34562',
      email: 'arvind.singhania@jkorg.in',
      city: 'Pune',
      address: 'Penthouse 18, Castle Royale, Bhosale Nagar, Pune',
      vehicles: [
        { registrationNumber: 'MH-12-BM-3300', make: 'BMW', model: '320d Luxury Line', year: 2021, fuelType: 'Diesel', mileage: 34000, color: 'Mineral White Metallic', vin: 'WBA5V7109N0048192' },
      ],
    },
    {
      name: 'Sneha Kulkarni',
      phone: '+91 98914 45673',
      email: 'sneha.kulkarni@accenture.com',
      city: 'Pune',
      address: 'Plot 77, Prabhat Road, Lane 4, Erandwane',
      vehicles: [
        { registrationNumber: 'MH-12-HE-5544', make: 'Honda', model: 'Elevate ZX CVT', year: 2023, fuelType: 'Petrol', mileage: 8500, color: 'Phoenix Orange Pearl', vin: 'MAKDG586NP1002341' },
      ],
    },
    {
      name: 'Gaurav Kapoor',
      phone: '+91 98915 56784',
      email: 'gaurav.kapoor@kpmg.com',
      city: 'Pimpri-Chinchwad',
      address: 'Bungalow 9, Queens Garden, Pune Cantt',
      vehicles: [
        { registrationNumber: 'MH-14-AA-4000', make: 'Audi', model: 'A4 40 TFSI Technology', year: 2022, fuelType: 'Petrol', mileage: 27800, color: 'Navarra Blue', vin: 'WAUZZZF43N1049281' },
      ],
    },
    {
      name: 'Tanvi Nair',
      phone: '+91 98916 67895',
      email: 'tanvi.nair@vodafone.in',
      city: 'Pune',
      address: 'Flat 802, Marvel Isola, NIBM Road, Kondhwa',
      vehicles: [
        { registrationNumber: 'MH-12-MG-7890', make: 'MG', model: 'Hector Sharp Pro CVT', year: 2023, fuelType: 'Petrol', mileage: 15600, color: 'Havana Grey', vin: 'MAJ62109KP0038192' },
      ],
    },
    {
      name: 'Vikramaditya Shinde',
      phone: '+91 98917 78906',
      email: 'v.shinde@shindegroup.com',
      city: 'Pune',
      address: 'Shinde Patil Heritage, Senapati Bapat Road',
      vehicles: [
        { registrationNumber: 'MH-12-IN-9090', make: 'Toyota', model: 'Innova Hycross ZX(O) Hybrid', year: 2023, fuelType: 'Hybrid', mileage: 39500, color: 'Blackish Ageha Glass Flake', vin: 'MBJ13HE70P0098124' },
      ],
    },
    {
      name: 'Shreya Shah',
      phone: '+91 98918 89017',
      email: 'shreya.shah@zomato.com',
      city: 'Pimpri-Chinchwad',
      address: 'Sector 12, Pradhikaran, Akurdi',
      vehicles: [
        { registrationNumber: 'MH-14-GV-2023', make: 'Maruti Suzuki', model: 'Grand Vitara Alpha+ Strong Hybrid', year: 2023, fuelType: 'Hybrid', mileage: 12400, color: 'Opulent Red with Black Roof', vin: 'MA3EW82K9P0023491' },
      ],
    },
  ];

  const createdCustomers: any[] = [];
  const createdVehicles: any[] = [];

  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        address: c.address,
      },
    });
    createdCustomers.push(cust);

    for (const v of c.vehicles) {
      const veh = await prisma.vehicle.create({
        data: {
          registrationNumber: v.registrationNumber,
          make: v.make,
          model: v.model,
          year: v.year,
          fuelType: v.fuelType,
          mileage: v.mileage,
          color: v.color,
          vin: v.vin,
          customerId: cust.id,
        },
      });
      createdVehicles.push(veh);
    }
  }

  // 4. Spare Parts Catalog (20+ Items)
  const partsData = [
    { partNumber: 'PART-ENG-001', name: 'Castrol Magnatec 5W-30 Full Synth (3.5L)', category: 'Lubricants', unit: 'Can', costPrice: 1600, sellingPrice: 2200, stockQuantity: 28, minStockLevel: 10, rackLocation: 'Rack A-1' },
    { partNumber: 'PART-FIL-002', name: 'Bosch Genuine Engine Oil Filter', category: 'Filters', unit: 'Pcs', costPrice: 220, sellingPrice: 450, stockQuantity: 42, minStockLevel: 15, rackLocation: 'Rack A-2' },
    { partNumber: 'PART-FIL-003', name: 'High Air Flow Cabin Pollen Filter', category: 'Filters', unit: 'Pcs', costPrice: 350, sellingPrice: 650, stockQuantity: 19, minStockLevel: 8, rackLocation: 'Rack A-3' },
    { partNumber: 'PART-BRK-004', name: 'Brembo Ceramic Front Brake Pads', category: 'Brakes', unit: 'Set', costPrice: 1800, sellingPrice: 2850, stockQuantity: 4, minStockLevel: 6, rackLocation: 'Rack B-1' }, // Low stock!
    { partNumber: 'PART-BRK-005', name: 'DOT 4 High Temp Brake Fluid (500ml)', category: 'Brakes', unit: 'Bottle', costPrice: 180, sellingPrice: 320, stockQuantity: 25, minStockLevel: 10, rackLocation: 'Rack B-2' },
    { partNumber: 'PART-BAT-006', name: 'Amaron Pro 12V 45Ah Auto Battery', category: 'Electrical', unit: 'Unit', costPrice: 4200, sellingPrice: 5600, stockQuantity: 2, minStockLevel: 4, rackLocation: 'Rack C-1' }, // Low stock!
    { partNumber: 'PART-WIP-007', name: 'Bosch Clear Advantage Frameless Wipers (Pair)', category: 'Accessories', unit: 'Pair', costPrice: 650, sellingPrice: 1100, stockQuantity: 14, minStockLevel: 5, rackLocation: 'Rack C-2' },
    { partNumber: 'PART-AC-008', name: 'DuPont R134a AC Refrigerant Gas Can', category: 'AC System', unit: 'Can', costPrice: 850, sellingPrice: 1450, stockQuantity: 8, minStockLevel: 4, rackLocation: 'Rack D-1' },
    { partNumber: 'PART-SPK-009', name: 'NGK Iridium Spark Plugs (Pack of 4)', category: 'Engine', unit: 'Pack', costPrice: 1200, sellingPrice: 1900, stockQuantity: 9, minStockLevel: 4, rackLocation: 'Rack D-2' },
    { partNumber: 'PART-CLT-010', name: 'Valeo Organic Clutch Plate & Release Bearing', category: 'Engine', unit: 'Kit', costPrice: 3800, sellingPrice: 5400, stockQuantity: 3, minStockLevel: 3, rackLocation: 'Rack E-1' },
    { partNumber: 'PART-SUS-011', name: 'Gabriel Front Gas Strut Shock Absorbers', category: 'Brakes', unit: 'Pair', costPrice: 2900, sellingPrice: 4200, stockQuantity: 6, minStockLevel: 4, rackLocation: 'Rack E-2' },
    { partNumber: 'PART-COL-012', name: 'Castrol Radicool Heavy Duty Premix Coolant (3L)', category: 'Lubricants', unit: 'Can', costPrice: 480, sellingPrice: 750, stockQuantity: 31, minStockLevel: 10, rackLocation: 'Rack A-4' },
    { partNumber: 'PART-LGT-013', name: 'Osram Night Breaker H4 Laser Headlight Bulbs', category: 'Electrical', unit: 'Pair', costPrice: 950, sellingPrice: 1650, stockQuantity: 11, minStockLevel: 5, rackLocation: 'Rack C-3' },
    { partNumber: 'PART-TIM-014', name: 'Gates Timing Belt & Tensioner Kit', category: 'Engine', unit: 'Kit', costPrice: 2400, sellingPrice: 3800, stockQuantity: 5, minStockLevel: 3, rackLocation: 'Rack E-3' },
    { partNumber: 'PART-ROTR-015', name: 'Brembo Ventilated Front Brake Disc Rotors (Pair)', category: 'Brakes', unit: 'Pair', costPrice: 3400, sellingPrice: 4900, stockQuantity: 5, minStockLevel: 4, rackLocation: 'Rack B-3' },
  ];

  const createdParts: any[] = [];
  for (const p of partsData) {
    const part = await prisma.sparePart.create({
      data: p,
    });
    createdParts.push(part);

    // Initial stock movement
    await prisma.stockMovement.create({
      data: {
        sparePartId: part.id,
        type: StockType.PURCHASE,
        quantity: p.stockQuantity,
        balanceAfter: p.stockQuantity,
        reason: 'Opening Balance Stock Inward',
      },
    });
  }

  // 5. Suppliers
  const suppliersData = [
    { name: 'Bosch Automotive India Ltd', contactPerson: 'Arun Deshpande', phone: '+91 97654 11223', email: 'orders@bosch-auto.in', address: 'Bhosari Industrial Estate, Pune', gstin: '27AABCB1234F1Z8', balance: 34000 },
    { name: 'Castrol Lubricants West Zone', contactPerson: 'Vijay Kadam', phone: '+91 97654 33445', email: 'sales@castrol-west.in', address: 'Plot 9, Turbhe MIDC, Navi Mumbai', gstin: '27AACCC4321A1Z2', balance: 14500 },
    { name: 'Brembo Brake Systems India', contactPerson: 'Ramesh Sundaram', phone: '+91 97654 44556', email: 'distributor@brembo.in', address: 'Chakan MIDC Phase 2, Pune', gstin: '27AABCB9876C1Z3', balance: 22000 },
    { name: 'Uno Minda Spares & Electricals', contactPerson: 'Dinesh Joshi', phone: '+91 97654 55667', email: 'distributor@unominda.in', address: 'Chakan Auto Park, Pune', gstin: '27AADCU9988C1Z9', balance: 0 },
  ];

  const createdSuppliers: any[] = [];
  for (const s of suppliersData) {
    const sup = await prisma.supplier.create({ data: s });
    createdSuppliers.push(sup);
  }

  // 6. Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-001',
      supplierId: createdSuppliers[0].id,
      totalAmount: 12500,
      status: 'RECEIVED',
      orderDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      receivedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      items: {
        create: [
          { sparePartId: createdParts[1].id, quantity: 20, unitCost: 220, total: 4400 },
          { sparePartId: createdParts[2].id, quantity: 15, unitCost: 350, total: 5250 },
          { sparePartId: createdParts[6].id, quantity: 5, unitCost: 570, total: 2850 },
        ],
      },
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-002',
      supplierId: createdSuppliers[2].id, // Brembo
      totalAmount: 18000,
      status: 'ORDERED',
      orderDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      items: {
        create: [
          { sparePartId: createdParts[3].id, quantity: 10, unitCost: 1800, total: 18000 },
        ],
      },
    },
  });

  // 7. Full set of Job Cards across all stages
  console.log('Generating multi-stage Job Cards...');

  // -------------------------------------------------------------
  // JOB 1: Honda City 2023 - RECEIVED
  // -------------------------------------------------------------
  const inward1 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-001',
      vehicleId: createdVehicles[0].id,
      customerId: createdCustomers[0].id,
      odometerReading: 18520,
      fuelLevel: '75%',
      personalBelongings: 'Sunglasses in visor, dashcam memory card',
      scratchDamageNotes: 'Minor scratch on rear left bumper corner',
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
      serviceType: 'Full Periodic Service',
      customerConcerns: 'Routine 20,000 KM maintenance, slight squeak when pressing brakes at low speed',
      estimatedCost: 6500,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc1.id,
      description: 'Periodic 50-point engine and fluids inspection',
      mechanicId: mechanic1.id,
      laborCost: 1200,
      status: TaskStatus.PENDING,
    },
  });

  // -------------------------------------------------------------
  // JOB 2: Maruti Swift - RECEIVED
  // -------------------------------------------------------------
  const inward2 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-002',
      vehicleId: createdVehicles[4].id,
      customerId: createdCustomers[4].id,
      odometerReading: 38240,
      fuelLevel: '50%',
      personalBelongings: 'Fastag attached, boot cleaning cloth',
      scratchDamageNotes: 'None reported',
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
      customerConcerns: 'AC cooling very weak during peak afternoon sun, foul cabin smell on startup',
      estimatedCost: 3800,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 18 * 3600 * 1000),
    },
  });

  // -------------------------------------------------------------
  // JOB 3: Skoda Octavia - INSPECTION
  // -------------------------------------------------------------
  const inward3 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-003',
      vehicleId: createdVehicles[6].id,
      customerId: createdCustomers[6].id,
      odometerReading: 29550,
      fuelLevel: '50%',
      personalBelongings: 'Toolkit, spare wheel intact',
      scratchDamageNotes: 'Left side skirt light road mark',
      status: 'IN_GARAGE',
    },
  });

  const jc3 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-003',
      customerId: createdCustomers[6].id,
      vehicleId: createdVehicles[6].id,
      inwardRecordId: inward3.id,
      status: JobStatus.INSPECTION,
      priority: Priority.HIGH,
      serviceType: 'Brake Disc Judder & Suspension Diagnostics',
      customerConcerns: 'Vibration in steering wheel when braking firmly from 80 km/h',
      estimatedCost: 8500,
      actualCost: 1500,
      promisedDate: new Date(Date.now() + 20 * 3600 * 1000),
    },
  });

  await prisma.vehicleInspection.create({
    data: {
      jobCardId: jc3.id,
      inspectorId: advisor.id,
      engineOil: 'GOOD',
      brakeCondition: 'REPLACE',
      tyreCondition: 'GOOD',
      batteryHealth: 'GOOD',
      electricalLights: 'GOOD',
      suspension: 'LOW',
      bodyDamageDetails: 'Front brake rotor run-out measures 0.08mm. Rotors require lathe resurfacing or replacement.',
      overallPassed: false,
      inspectionNotes: 'Front disc thickness near minimum tolerance. Recommended Brembo pair.',
    },
  });

  // -------------------------------------------------------------
  // JOB 4: Volkswagen Virtus GT - ESTIMATION / PENDING APPROVAL
  // -------------------------------------------------------------
  const inward4 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-004',
      vehicleId: createdVehicles[7].id,
      customerId: createdCustomers[7].id,
      odometerReading: 11020,
      fuelLevel: '60%',
      personalBelongings: 'Car fragrance clip',
      scratchDamageNotes: 'Clean body',
      status: 'IN_GARAGE',
    },
  });

  const jc4 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-004',
      customerId: createdCustomers[7].id,
      vehicleId: createdVehicles[7].id,
      inwardRecordId: inward4.id,
      status: JobStatus.PENDING_APPROVAL,
      priority: Priority.NORMAL,
      serviceType: 'First Year Periodic Service & Synthetic Lube',
      customerConcerns: 'Annual scheduled maintenance, check tyre rotation & balance',
      estimatedCost: 5900,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 16 * 3600 * 1000),
    },
  });

  const est4 = await prisma.estimate.create({
    data: {
      estimateNumber: 'EST-2026-001',
      jobCardId: jc4.id,
      subtotal: 5000,
      taxRate: 18.0,
      taxAmount: 900,
      grandTotal: 5900,
      status: EstimateStatus.SENT,
      customerNotes: 'Formal quotation sent to customer via SMS and email. Awaiting approval.',
    },
  });

  await prisma.estimateItem.createMany({
    data: [
      { estimateId: est4.id, description: 'Castrol Magnatec 5W-30 Full Synthetic (3.5L)', itemType: 'PART', quantity: 1, unitPrice: 2200, total: 2200 },
      { estimateId: est4.id, description: 'Engine Oil Filter Cartridge', itemType: 'PART', quantity: 1, unitPrice: 450, total: 450 },
      { estimateId: est4.id, description: 'Cabin Pollen Filter Replacement', itemType: 'PART', quantity: 1, unitPrice: 650, total: 650 },
      { estimateId: est4.id, description: 'General Periodic Service Labor & 4-Wheel Brake Cleaning', itemType: 'LABOR', quantity: 1, unitPrice: 1700, total: 1700 },
    ],
  });

  // -------------------------------------------------------------
  // JOB 5: Toyota Fortuner - IN_PROGRESS
  // -------------------------------------------------------------
  const inward5 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-005',
      vehicleId: createdVehicles[1].id,
      customerId: createdCustomers[1].id,
      odometerReading: 42100,
      fuelLevel: '90%',
      personalBelongings: 'Empty roof carrier, dashcam',
      scratchDamageNotes: 'Stone chips on bonnet',
      status: 'IN_GARAGE',
    },
  });

  const jc5 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-005',
      customerId: createdCustomers[1].id,
      vehicleId: createdVehicles[1].id,
      inwardRecordId: inward5.id,
      status: JobStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      serviceType: 'Engine Carbon Decarbonization & Fuel Injector Flush',
      customerConcerns: 'Check Engine light on cluster, poor pickup in low RPMs, black smoke on acceleration',
      estimatedCost: 28500,
      actualCost: 14200,
      promisedDate: new Date(Date.now() + 36 * 3600 * 1000),
    },
  });

  await prisma.jobTask.createMany({
    data: [
      {
        jobCardId: jc5.id,
        description: 'Remove intercooler and clean intake manifold carbon deposits',
        mechanicId: mechanic1.id,
        laborCost: 4500,
        status: TaskStatus.IN_PROGRESS,
      },
      {
        jobCardId: jc5.id,
        description: 'Common-rail diesel injector ultrasonic cleaning & calibration',
        mechanicId: mechanic1.id,
        laborCost: 3800,
        status: TaskStatus.PENDING,
      },
      {
        jobCardId: jc5.id,
        description: 'EGR valve actuator servicing & adapt reset via OBD scanner',
        mechanicId: mechanic3.id,
        laborCost: 2400,
        status: TaskStatus.PENDING,
      },
    ],
  });

  // Issue Part to Fortuner
  await prisma.partUsage.create({
    data: {
      jobCardId: jc5.id,
      sparePartId: createdParts[0].id, // Synthetic Oil
      quantity: 2,
      unitPrice: 2200,
      total: 4400,
    },
  });

  // -------------------------------------------------------------
  // JOB 6: Hyundai Creta - WAITING_PARTS
  // -------------------------------------------------------------
  const inward6 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-006',
      vehicleId: createdVehicles[2].id,
      customerId: createdCustomers[2].id,
      odometerReading: 31200,
      fuelLevel: '40%',
      personalBelongings: 'Child safety seat in rear',
      scratchDamageNotes: 'Right rear door parking ding',
      status: 'IN_GARAGE',
    },
  });

  const jc6 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-006',
      customerId: createdCustomers[2].id,
      vehicleId: createdVehicles[2].id,
      inwardRecordId: inward6.id,
      status: JobStatus.WAITING_PARTS,
      priority: Priority.HIGH,
      serviceType: 'Brake Pads & Rotor Resurfacing',
      customerConcerns: 'Loud metal grinding sound when braking at traffic signals',
      estimatedCost: 5200,
      actualCost: 4850,
      promisedDate: new Date(Date.now() + 12 * 3600 * 1000),
    },
  });

  // -------------------------------------------------------------
  // JOB 7: Tata Safari - QUALITY_CHECK
  // -------------------------------------------------------------
  const inward7 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-007',
      vehicleId: createdVehicles[3].id,
      customerId: createdCustomers[3].id,
      odometerReading: 26400,
      fuelLevel: '60%',
      personalBelongings: 'Umbrella in door holder',
      scratchDamageNotes: 'Clean condition',
      status: 'IN_GARAGE',
    },
  });

  const jc7 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-007',
      customerId: createdCustomers[3].id,
      vehicleId: createdVehicles[3].id,
      inwardRecordId: inward7.id,
      status: JobStatus.QUALITY_CHECK,
      priority: Priority.NORMAL,
      serviceType: 'Battery Replacement & Electrical Load Test',
      customerConcerns: 'Car took multiple long cranks to start in the morning, touchscreen restarts',
      estimatedCost: 7200,
      actualCost: 7100,
      promisedDate: new Date(Date.now() + 4 * 3600 * 1000),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc7.id,
      description: 'Replace 12V 45Ah Battery with new Amaron unit & test charging circuit',
      mechanicId: mechanic3.id,
      laborCost: 450,
      status: TaskStatus.COMPLETED,
    },
  });

  await prisma.partUsage.create({
    data: {
      jobCardId: jc7.id,
      sparePartId: createdParts[5].id, // Amaron Battery
      quantity: 1,
      unitPrice: 5600,
      total: 5600,
    },
  });

  await prisma.qualityInspection.create({
    data: {
      jobCardId: jc7.id,
      inspectorId: admin.id,
      roadTestDone: true,
      cleanlinessDone: true,
      allTasksVerified: true,
      passed: true,
      comments: 'Alternator charging voltage optimal at 14.2V. All electricals and instrument cluster functioning normally.',
    },
  });

  // -------------------------------------------------------------
  // JOB 8: Mahindra Thar - COMPLETED (Awaiting Customer Pickup)
  // -------------------------------------------------------------
  const inward8 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-008',
      vehicleId: createdVehicles[5].id,
      customerId: createdCustomers[5].id,
      odometerReading: 14250,
      fuelLevel: '70%',
      personalBelongings: 'Off-road tow strap in rear',
      scratchDamageNotes: 'Mud on underbody, body clean',
      status: 'IN_GARAGE',
    },
  });

  const jc8 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-008',
      customerId: createdCustomers[5].id,
      vehicleId: createdVehicles[5].id,
      inwardRecordId: inward8.id,
      status: JobStatus.COMPLETED,
      priority: Priority.NORMAL,
      serviceType: '4x4 Differential Oil Change & Underbody Check',
      customerConcerns: 'Post-monsoon offroad checkup, differential oils and propeller shaft greasing',
      estimatedCost: 8200,
      actualCost: 8150,
      promisedDate: new Date(),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc8.id,
      description: 'Front & Rear differential oil replacement and prop shaft greasing',
      mechanicId: mechanic2.id,
      laborCost: 1800,
      status: TaskStatus.COMPLETED,
    },
  });

  // Invoice for Thar - Unpaid yet
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      jobCardId: jc8.id,
      customerId: createdCustomers[5].id,
      subtotal: 6907,
      taxRate: 18.0,
      taxAmount: 1243,
      discount: 0,
      grandTotal: 8150,
      paidAmount: 0,
      balanceAmount: 8150,
      status: PaymentStatus.UNPAID,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    },
  });

  // -------------------------------------------------------------
  // JOB 9: Kia Seltos - DELIVERED
  // -------------------------------------------------------------
  const inward9 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-009',
      vehicleId: createdVehicles[8].id,
      customerId: createdCustomers[8].id,
      odometerReading: 16850,
      fuelLevel: '80%',
      personalBelongings: 'Toolkit',
      scratchDamageNotes: 'None',
      status: 'DELIVERED',
    },
  });

  const jc9 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-009',
      customerId: createdCustomers[8].id,
      vehicleId: createdVehicles[8].id,
      inwardRecordId: inward9.id,
      status: JobStatus.DELIVERED,
      priority: Priority.NORMAL,
      serviceType: 'Periodic 15,000 KM Maintenance & Wheel Balancing',
      customerConcerns: 'Routine service, tire alignment',
      estimatedCost: 6200,
      actualCost: 6100,
      promisedDate: new Date(Date.now() - 24 * 3600 * 1000),
    },
  });

  const inv9 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-003',
      jobCardId: jc9.id,
      customerId: createdCustomers[8].id,
      subtotal: 5169,
      taxRate: 18.0,
      taxAmount: 931,
      discount: 0,
      grandTotal: 6100,
      paidAmount: 6100,
      balanceAmount: 0,
      status: PaymentStatus.PAID,
      dueDate: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-002',
      invoiceId: inv9.id,
      customerId: createdCustomers[8].id,
      amount: 6100,
      method: 'UPI',
      transactionRef: 'UPI/20261103/89230198',
      notes: 'Customer paid via PhonePe on collection',
    },
  });

  await prisma.deliveryRecord.create({
    data: {
      jobCardId: jc9.id,
      gatePassNumber: 'GP-2026-001',
      deliveredTo: 'Rohan Mehra',
      deliveryDate: new Date(Date.now() - 4 * 3600 * 1000),
      exitOdometer: 16855,
      fuelLevelOnExit: '80%',
      customerRating: 5,
      feedback: 'Very quick turnaround time and car was washed sparkling clean!',
    },
  });

  // -------------------------------------------------------------
  // JOB 10: Tata Nexon EV - COMPLETED (Paid via Card)
  // -------------------------------------------------------------
  const inward10 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-010',
      vehicleId: createdVehicles[9].id,
      customerId: createdCustomers[9].id,
      odometerReading: 22100,
      fuelLevel: '95% (Charge)',
      personalBelongings: 'Type-2 Portable EV Charging Cable in bag',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc10 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-010',
      customerId: createdCustomers[9].id,
      vehicleId: createdVehicles[9].id,
      inwardRecordId: inward10.id,
      status: JobStatus.COMPLETED,
      priority: Priority.HIGH,
      serviceType: 'EV High Voltage Inspection & Brake Fluid Flush',
      customerConcerns: 'Annual EV battery coolant level inspection, brake pedal feel soft',
      estimatedCost: 4600,
      actualCost: 4450,
      promisedDate: new Date(),
    },
  });

  const inv10 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-004',
      jobCardId: jc10.id,
      customerId: createdCustomers[9].id,
      subtotal: 3771,
      taxRate: 18.0,
      taxAmount: 679,
      discount: 0,
      grandTotal: 4450,
      paidAmount: 2000,
      balanceAmount: 2450,
      status: PaymentStatus.PARTIAL,
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-003',
      invoiceId: inv10.id,
      customerId: createdCustomers[9].id,
      amount: 2000,
      method: 'CARD',
      transactionRef: 'POS-HDFC-991204',
      notes: 'Advance swipe on card',
    },
  });

  // -------------------------------------------------------------
  // JOB 11: BMW 320d - WAITING_PARTS
  // -------------------------------------------------------------
  const inward11 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-011',
      vehicleId: createdVehicles[12].id, // BMW 320d
      customerId: createdCustomers[12].id,
      odometerReading: 34100,
      fuelLevel: '75%',
      personalBelongings: 'Golf kit in boot, BMW leather key fob',
      scratchDamageNotes: 'Rear bumper micro swirl marks',
      status: 'IN_GARAGE',
    },
  });

  const jc11 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-011',
      customerId: createdCustomers[12].id,
      vehicleId: createdVehicles[12].id,
      inwardRecordId: inward11.id,
      status: JobStatus.WAITING_PARTS,
      priority: Priority.URGENT,
      serviceType: 'Brembo Rotors & High-Performance Ceramic Pads',
      customerConcerns: 'Brake pad wear sensor warning triggered on iDrive display',
      estimatedCost: 16500,
      actualCost: 11000,
      promisedDate: new Date(Date.now() + 18 * 3600 * 1000),
    },
  });

  // -------------------------------------------------------------
  // JOB 12: Honda Elevate - INSPECTION
  // -------------------------------------------------------------
  const inward12 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-012',
      vehicleId: createdVehicles[13].id, // Elevate
      customerId: createdCustomers[13].id,
      odometerReading: 8520,
      fuelLevel: '90%',
      personalBelongings: 'Sunglasses, car air purifier',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc12 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-012',
      customerId: createdCustomers[13].id,
      vehicleId: createdVehicles[13].id,
      inwardRecordId: inward12.id,
      status: JobStatus.INSPECTION,
      priority: Priority.NORMAL,
      serviceType: 'Front Suspension Squeak Diagnosis',
      customerConcerns: 'Squeak from front left over speed bumps during rain',
      estimatedCost: 2200,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 14 * 3600 * 1000),
    },
  });

  // -------------------------------------------------------------
  // JOB 13: Audi A4 - IN_PROGRESS
  // -------------------------------------------------------------
  const inward13 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-013',
      vehicleId: createdVehicles[14].id, // Audi A4
      customerId: createdCustomers[14].id,
      odometerReading: 27850,
      fuelLevel: '50%',
      personalBelongings: 'Audi dashcam',
      scratchDamageNotes: 'Front lower lip stone chip',
      status: 'IN_GARAGE',
    },
  });

  const jc13 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-013',
      customerId: createdCustomers[14].id,
      vehicleId: createdVehicles[14].id,
      inwardRecordId: inward13.id,
      status: JobStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      serviceType: '7-Speed S-Tronic DSG Transmission Fluid Service',
      customerConcerns: 'Minor jerk when downshifting from 2nd to 1st gear in stop-go traffic',
      estimatedCost: 19500,
      actualCost: 14500,
      promisedDate: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc13.id,
      description: 'DSG transmission filter change and mechatronics adaptation relearn',
      mechanicId: mechanic1.id,
      laborCost: 3500,
      status: TaskStatus.IN_PROGRESS,
    },
  });

  // -------------------------------------------------------------
  // JOB 14: MG Hector - PENDING_APPROVAL
  // -------------------------------------------------------------
  const inward14 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-014',
      vehicleId: createdVehicles[15].id, // MG Hector
      customerId: createdCustomers[15].id,
      odometerReading: 15620,
      fuelLevel: '65%',
      personalBelongings: 'Child sunshades',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc14 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-014',
      customerId: createdCustomers[15].id,
      vehicleId: createdVehicles[15].id,
      inwardRecordId: inward14.id,
      status: JobStatus.PENDING_APPROVAL,
      priority: Priority.NORMAL,
      serviceType: 'Periodic 15,000 KM Maintenance & AC Sanitization',
      customerConcerns: 'Scheduled 15k service, disinfect AC vents',
      estimatedCost: 6800,
      actualCost: 0,
      promisedDate: new Date(Date.now() + 16 * 3600 * 1000),
    },
  });

  const est14 = await prisma.estimate.create({
    data: {
      estimateNumber: 'EST-2026-002',
      jobCardId: jc14.id,
      subtotal: 5762,
      taxRate: 18.0,
      taxAmount: 1038,
      grandTotal: 6800,
      status: EstimateStatus.SENT,
      customerNotes: 'Quotation shared with customer via WhatsApp for approval.',
    },
  });

  // -------------------------------------------------------------
  // JOB 15: Toyota Innova Hycross - QUALITY_CHECK
  // -------------------------------------------------------------
  const inward15 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-015',
      vehicleId: createdVehicles[16].id, // Hycross
      customerId: createdCustomers[16].id,
      odometerReading: 39500,
      fuelLevel: '80%',
      personalBelongings: 'VIP parking pass, fastag',
      scratchDamageNotes: 'None',
      status: 'IN_GARAGE',
    },
  });

  const jc15 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-015',
      customerId: createdCustomers[16].id,
      vehicleId: createdVehicles[16].id,
      inwardRecordId: inward15.id,
      status: JobStatus.QUALITY_CHECK,
      priority: Priority.HIGH,
      serviceType: 'Major 40,000 KM Hybrid Health Audit & Transmission Service',
      customerConcerns: '40k scheduled service, check hybrid battery cooling fan filter',
      estimatedCost: 11400,
      actualCost: 11200,
      promisedDate: new Date(),
    },
  });

  await prisma.jobTask.create({
    data: {
      jobCardId: jc15.id,
      description: 'Hybrid traction battery intake fan clean & 40-point diagnostic health report',
      mechanicId: mechanic3.id,
      laborCost: 1800,
      status: TaskStatus.COMPLETED,
    },
  });

  await prisma.qualityInspection.create({
    data: {
      jobCardId: jc15.id,
      inspectorId: admin.id,
      roadTestDone: true,
      cleanlinessDone: true,
      allTasksVerified: true,
      passed: true,
      comments: 'Hycross EV-to-ICE transition smooth. Hybrid battery state of health 98.4%.',
    },
  });

  // -------------------------------------------------------------
  // JOB 16: Maruti Grand Vitara - DELIVERED
  // -------------------------------------------------------------
  const inward16 = await prisma.inwardRecord.create({
    data: {
      gateEntryNumber: 'GE-2026-016',
      vehicleId: createdVehicles[17].id, // Grand Vitara
      customerId: createdCustomers[17].id,
      odometerReading: 12420,
      fuelLevel: '85%',
      personalBelongings: 'Ganesha idol on dash, tissue box',
      scratchDamageNotes: 'None',
      status: 'DELIVERED',
    },
  });

  const jc16 = await prisma.jobCard.create({
    data: {
      jobCardNumber: 'JC-2026-016',
      customerId: createdCustomers[17].id,
      vehicleId: createdVehicles[17].id,
      inwardRecordId: inward16.id,
      status: JobStatus.DELIVERED,
      priority: Priority.NORMAL,
      serviceType: 'Periodic 10,000 KM Second Scheduled Service',
      customerConcerns: '10k service, tire rotation & nitrogen top-up',
      estimatedCost: 3400,
      actualCost: 3350,
      promisedDate: new Date(Date.now() - 6 * 3600 * 1000),
    },
  });

  const inv16 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-005',
      jobCardId: jc16.id,
      customerId: createdCustomers[17].id,
      subtotal: 2839,
      taxRate: 18.0,
      taxAmount: 511,
      discount: 0,
      grandTotal: 3350,
      paidAmount: 3350,
      balanceAmount: 0,
      status: PaymentStatus.PAID,
      dueDate: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-004',
      invoiceId: inv16.id,
      customerId: createdCustomers[17].id,
      amount: 3350,
      method: 'UPI',
      transactionRef: 'UPI/20261103/77192084',
      notes: 'Customer paid via Google Pay on vehicle handover',
    },
  });

  await prisma.deliveryRecord.create({
    data: {
      jobCardId: jc16.id,
      gatePassNumber: 'GP-2026-002',
      deliveredTo: 'Shreya Shah',
      deliveryDate: new Date(Date.now() - 5 * 3600 * 1000),
      exitOdometer: 12425,
      fuelLevelOnExit: '85%',
      customerRating: 5,
      feedback: 'Very polite advisors and prompt service delivery. Highly recommended!',
    },
  });

  // 8. Service Appointments (Today & Upcoming)
  await prisma.appointment.createMany({
    data: [
      {
        appointmentNumber: 'APT-2026-101',
        customerId: createdCustomers[0].id,
        vehicleId: createdVehicles[0].id,
        appointmentDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        serviceType: 'Tire Rotation & Wheel Balancing',
        notes: 'Requested pickup by morning 9:30 AM',
        status: 'CONFIRMED',
      },
      {
        appointmentNumber: 'APT-2026-102',
        customerId: createdCustomers[2].id,
        vehicleId: createdVehicles[2].id,
        appointmentDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        serviceType: 'Monsoon Checkup & Wiper Replacement',
        notes: 'Check underbody anti-rust protection',
        status: 'CONFIRMED',
      },
      {
        appointmentNumber: 'APT-2026-103',
        customerId: createdCustomers[10].id,
        vehicleId: createdVehicles[10].id, // XUV700
        appointmentDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
        serviceType: 'Major 40,000 KM Periodic Service',
        notes: 'Customer traveling from Nashik, needs same day delivery',
        status: 'CONFIRMED',
      },
      {
        appointmentNumber: 'APT-2026-104',
        customerId: createdCustomers[11].id,
        vehicleId: createdVehicles[11].id, // i20 N Line
        appointmentDate: new Date(Date.now() + 8 * 24 * 3600 * 1000),
        serviceType: 'Performance Exhaust Sound Check & Oil Top-up',
        notes: 'Check exhaust hanger bracket rattle',
        status: 'CONFIRMED',
      },
    ],
  });

  // 9. Service Reminders
  await prisma.serviceReminder.createMany({
    data: [
      {
        vehicleId: createdVehicles[0].id,
        customerId: createdCustomers[0].id,
        reminderType: 'PERIODIC_SERVICE',
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: '20,000 KM major maintenance due',
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
        dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: 'Pollution Under Control certificate validity expiring this week',
      },
      {
        vehicleId: createdVehicles[6].id,
        customerId: createdCustomers[6].id,
        reminderType: 'WHEEL_ALIGNMENT',
        dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: '5,000 KM routine alignment due',
      },
      {
        vehicleId: createdVehicles[7].id,
        customerId: createdCustomers[7].id,
        reminderType: 'PERIODIC_SERVICE',
        dueDate: new Date(Date.now() + 18 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: '15,000 KM first year service due',
      },
      {
        vehicleId: createdVehicles[12].id, // BMW 320d
        customerId: createdCustomers[12].id,
        reminderType: 'BRAKE_FLUID',
        dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000), // Overdue!
        status: 'PENDING',
        notes: 'Brembo DOT 4 Brake Fluid 2-year cycle flush overdue by 2 days',
      },
      {
        vehicleId: createdVehicles[13].id, // Elevate
        customerId: createdCustomers[13].id,
        reminderType: 'PERIODIC_SERVICE',
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000), // Due in 2 days!
        status: 'PENDING',
        notes: '10,000 KM Second Free Inspection service due this Thursday',
      },
      {
        vehicleId: createdVehicles[14].id, // Audi A4
        customerId: createdCustomers[14].id,
        reminderType: 'INSURANCE_RENEWAL',
        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000),
        status: 'SENT',
        notes: 'ICICI Lombard Zero Dep policy renewal notification dispatched via WhatsApp',
      },
      {
        vehicleId: createdVehicles[15].id, // MG Hector
        customerId: createdCustomers[15].id,
        reminderType: 'WHEEL_ALIGNMENT',
        dueDate: new Date(Date.now() + 6 * 24 * 3600 * 1000),
        status: 'PENDING',
        notes: 'Post-highway road trip 3D laser alignment checkup',
      },
      {
        vehicleId: createdVehicles[16].id, // Hycross
        customerId: createdCustomers[16].id,
        reminderType: 'PERIODIC_SERVICE',
        dueDate: new Date(Date.now() - 4 * 24 * 3600 * 1000), // Overdue!
        status: 'SENT',
        notes: '40,000 KM Hybrid major service reminder sent to Mr. Vikramaditya Shinde',
      },
      {
        vehicleId: createdVehicles[17].id, // Grand Vitara
        customerId: createdCustomers[17].id,
        reminderType: 'PUC_RENEWAL',
        dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000), // Due tomorrow!
        status: 'PENDING',
        notes: 'PUC pollution certificate expiry reminder',
      },
    ],
  });

  // 10. Customer Complaints & Rework
  await prisma.customerComplaint.createMany({
    data: [
      {
        jobCardId: jc5.id,
        customerId: createdCustomers[1].id,
        description: 'Customer noted low pickup after long highway run. Check injector pressure.',
        reworkRequired: false,
        status: 'IN_REVIEW',
        resolution: 'Mechanic Vikram investigating common rail pressure sensor readings.',
      },
      {
        jobCardId: jc9.id,
        customerId: createdCustomers[8].id,
        description: 'Very slight pull to left at highway speeds after alignment.',
        reworkRequired: true,
        status: 'RESOLVED',
        resolution: 'Re-calibrated camber on Hunter 3D machine. Road tested fine with zero drift.',
      },
    ],
  });

  // 11. Workshop Expenses
  await prisma.expense.createMany({
    data: [
      {
        expenseNumber: 'EXP-2026-001',
        category: 'Workshop Tools',
        amount: 4800,
        paymentMethod: 'UPI',
        description: 'Stanley 1/2" Digital Torque Wrench 40-200Nm for Bay 2',
        paidTo: 'Industrial Hardware & Pneumatics Corp',
      },
      {
        expenseNumber: 'EXP-2026-002',
        category: 'Consumables',
        amount: 2200,
        paymentMethod: 'CASH',
        description: 'Cotton waste rags, WD-40 cans and brake parts cleaner spray',
        paidTo: 'Apex Auto Supplies',
      },
      {
        expenseNumber: 'EXP-2026-003',
        category: 'Electricity & Utilities',
        amount: 8900,
        paymentMethod: 'NET_BANKING',
        description: 'MSEDCL 3-Phase Commercial Workshop Electricity Bill for October',
        paidTo: 'MSEDCL Pune Industrial Division',
      },
      {
        expenseNumber: 'EXP-2026-004',
        category: 'Staff Refreshments',
        amount: 1450,
        paymentMethod: 'UPI',
        description: 'Monthly workshop team tea, snacks and drinking water cans',
        paidTo: 'Sai Tea & Canteen Services',
      },
      {
        expenseNumber: 'EXP-2026-005',
        category: 'Rent & Premises',
        amount: 35000,
        paymentMethod: 'NET_BANKING',
        description: 'MIDC Workshop Bay 1-6 Shed Monthly Lease Rental',
        paidTo: 'MIDC Automobile Park Estates',
      },
    ],
  });

  // 12. Audit Logs (Rich trace of real actions)
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'CREATE',
        entity: 'JobCard',
        entityId: jc1.id,
        performedBy: 'Admin User',
        details: 'Created Job Card JC-2026-001 for Honda City (MH-12-AB-1234)',
      },
      {
        action: 'INWARD_ENTRY',
        entity: 'InwardRecord',
        entityId: inward5.id,
        performedBy: 'Rohan Deshmukh (Advisor)',
        details: 'Recorded gate entry GE-2026-005 for Toyota Fortuner (MH-01-EF-9012) at 42,100 KM',
      },
      {
        action: 'STATUS_CHANGE',
        entity: 'JobCard',
        entityId: jc5.id,
        performedBy: 'Rohan Deshmukh (Advisor)',
        details: 'Moved JC-2026-005 to IN_PROGRESS. Mechanic Vikram Shinde assigned to engine decarbonization.',
      },
      {
        action: 'STOCK_ISSUE',
        entity: 'SparePart',
        entityId: createdParts[0].id,
        performedBy: 'Ganesh Kulkarni (Store)',
        details: 'Issued 2 cans of Castrol 5W-30 Synthetic to Job Card JC-2026-005',
      },
      {
        action: 'QC_PASSED',
        entity: 'QualityInspection',
        entityId: jc7.id,
        performedBy: 'Admin User',
        details: 'Road test and cleanliness inspection passed for Tata Safari (MH-02-JK-7890)',
      },
      {
        action: 'PAYMENT_RECEIVED',
        entity: 'Payment',
        entityId: inv9.id,
        performedBy: 'Pooja Nair (Accountant)',
        details: 'Collected full payment of ₹6,100 via UPI PhonePe for Invoice INV-2026-003',
      },
      {
        action: 'DELIVERY_GATEPASS',
        entity: 'DeliveryRecord',
        entityId: jc9.id,
        performedBy: 'Admin User',
        details: 'Issued Gate Pass GP-2026-001 and delivered Kia Seltos to Mr. Rohan Mehra with 5-star rating',
      },
    ],
  });

  console.log('Production-grade dataset successfully injected into GaragePro database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

