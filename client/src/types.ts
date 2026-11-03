export type Role =
  | 'ADMIN'
  | 'MANAGER'
  | 'RECEPTIONIST'
  | 'SERVICE_ADVISOR'
  | 'MECHANIC'
  | 'STORE_MANAGER'
  | 'ACCOUNTANT'
  | 'CUSTOMER';

export type JobStatus =
  | 'RECEIVED'
  | 'INSPECTION'
  | 'ESTIMATION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  specialty?: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  fuelType: string;
  mileage: number;
  customerId: string;
  customer?: Customer;
  jobCards?: JobCard[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  vehicles?: Vehicle[];
  jobCards?: JobCard[];
  invoices?: Invoice[];
}

export interface InwardRecord {
  id: string;
  gateEntryNumber: string;
  vehicleId: string;
  vehicle?: Vehicle;
  customerId: string;
  customer?: Customer;
  odometerReading: number;
  fuelLevel: string;
  personalBelongings?: string;
  scratchDamageNotes?: string;
  inwardDate: string;
  status: string;
  jobCard?: JobCard;
}

export interface JobTask {
  id: string;
  jobCardId: string;
  description: string;
  mechanicId?: string;
  mechanic?: User;
  laborCost: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  rackLocation?: string;
}

export interface PartUsage {
  id: string;
  jobCardId: string;
  sparePartId: string;
  sparePart: SparePart;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EstimateItem {
  id?: string;
  description: string;
  itemType: 'PART' | 'LABOR';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  jobCardId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  customerNotes?: string;
  items?: EstimateItem[];
}

export interface VehicleInspection {
  id: string;
  jobCardId: string;
  engineOil: string;
  brakeCondition: string;
  tyreCondition: string;
  batteryHealth: string;
  electricalLights: string;
  suspension: string;
  bodyDamageDetails?: string;
  overallPassed: boolean;
  inspectionNotes?: string;
}

export interface QualityInspection {
  id: string;
  jobCardId: string;
  roadTestDone: boolean;
  cleanlinessDone: boolean;
  allTasksVerified: boolean;
  passed: boolean;
  comments?: string;
}

export interface DeliveryRecord {
  id: string;
  gatePassNumber: string;
  deliveredTo: string;
  deliveryDate: string;
  exitOdometer?: number;
  fuelLevelOnExit?: string;
  customerRating: number;
  feedback?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  jobCard?: JobCard;
  customerId: string;
  customer?: Customer;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  invoiceDate: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  amount: number;
  method: string;
  transactionRef?: string;
  paymentDate: string;
  notes?: string;
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  customerId: string;
  customer: Customer;
  vehicleId: string;
  vehicle: Vehicle;
  inwardRecordId?: string;
  inwardRecord?: InwardRecord;
  status: JobStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  serviceType: string;
  customerConcerns?: string;
  promisedDate?: string;
  estimatedCost: number;
  actualCost: number;
  createdAt: string;
  tasks?: JobTask[];
  partsUsed?: PartUsage[];
  inspection?: VehicleInspection;
  estimate?: Estimate;
  qualityCheck?: QualityInspection;
  deliveryRecord?: DeliveryRecord;
  invoice?: Invoice;
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  customerId: string;
  customer: Customer;
  reminderType: string;
  dueDate: string;
  status: string;
  notes?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
  paidTo: string;
  expenseDate: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  balance: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  totalAmount: number;
  status: 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  items: {
    id: string;
    sparePartId: string;
    sparePart: SparePart;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy: string;
  details?: string;
  createdAt: string;
}

export interface GarageSetting {
  id: string;
  garageName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  taxRatePercent: number;
  currencySymbol: string;
}
