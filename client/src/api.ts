const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchApi<any>('/dashboard'),

  // Users & Auth
  getUsers: () => fetchApi<any[]>('/auth/users'),

  // Customers
  getCustomers: (search = '') => fetchApi<any[]>(`/customers?search=${encodeURIComponent(search)}`),
  getCustomer: (id: string) => fetchApi<any>(`/customers/${id}`),
  createCustomer: (data: any) => fetchApi<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: any) => fetchApi<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Vehicles
  getVehicles: (search = '') => fetchApi<any[]>(`/vehicles?search=${encodeURIComponent(search)}`),
  getVehicle: (id: string) => fetchApi<any>(`/vehicles/${id}`),
  createVehicle: (data: any) => fetchApi<any>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  // Inward & Gate Entries
  getInwardRecords: () => fetchApi<any[]>('/inward'),
  createInwardRecord: (data: any) => fetchApi<any>('/inward', { method: 'POST', body: JSON.stringify(data) }),

  // Job Cards
  getJobCards: (params: { status?: string; search?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi<any[]>(`/jobcards?${query}`);
  },
  getJobCard: (id: string) => fetchApi<any>(`/jobcards/${id}`),
  createJobCard: (data: any) => fetchApi<any>('/jobcards', { method: 'POST', body: JSON.stringify(data) }),
  updateJobStatus: (id: string, status: string, remarks?: string) =>
    fetchApi<any>(`/jobcards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) }),
  addTask: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (taskId: string, data: any) => fetchApi<any>(`/jobcards/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  issuePart: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/parts`, { method: 'POST', body: JSON.stringify(data) }),
  saveInspection: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/inspection`, { method: 'POST', body: JSON.stringify(data) }),
  saveEstimate: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/estimate`, { method: 'POST', body: JSON.stringify(data) }),
  approveEstimate: (id: string, approved: boolean, notes?: string) =>
    fetchApi<any>(`/jobcards/${id}/estimate/approval`, { method: 'PATCH', body: JSON.stringify({ approved, notes }) }),
  saveQualityCheck: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/quality-check`, { method: 'POST', body: JSON.stringify(data) }),
  deliverVehicle: (id: string, data: any) => fetchApi<any>(`/jobcards/${id}/delivery`, { method: 'POST', body: JSON.stringify(data) }),

  // Inventory
  getInventory: (search = '', category = 'ALL', lowStock = false) =>
    fetchApi<any[]>(`/inventory?search=${encodeURIComponent(search)}&category=${category}&lowStock=${lowStock}`),
  createPart: (data: any) => fetchApi<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  adjustStock: (id: string, data: any) => fetchApi<any>(`/inventory/${id}/adjust`, { method: 'POST', body: JSON.stringify(data) }),
  getStockMovements: () => fetchApi<any[]>('/inventory/movements'),

  // Invoices & Payments
  getInvoices: (status = 'ALL', search = '') =>
    fetchApi<any[]>(`/invoices?status=${status}&search=${encodeURIComponent(search)}`),
  getInvoice: (id: string) => fetchApi<any>(`/invoices/${id}`),
  generateInvoice: (jobCardId: string, discount = 0) =>
    fetchApi<any>(`/invoices/generate/${jobCardId}`, { method: 'POST', body: JSON.stringify({ discount }) }),
  recordPayment: (invoiceId: string, data: any) =>
    fetchApi<any>(`/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(data) }),

  // Operations
  getAppointments: () => fetchApi<any[]>('/operations/appointments'),
  createAppointment: (data: any) => fetchApi<any>('/operations/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => fetchApi<any[]>('/operations/suppliers'),
  createSupplier: (data: any) => fetchApi<any>('/operations/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  getPurchases: () => fetchApi<any[]>('/operations/purchases'),
  createPurchase: (data: any) => fetchApi<any>('/operations/purchases', { method: 'POST', body: JSON.stringify(data) }),
  receivePurchase: (id: string) => fetchApi<any>(`/operations/purchases/${id}/receive`, { method: 'POST' }),
  getExpenses: () => fetchApi<any[]>('/operations/expenses'),
  createExpense: (data: any) => fetchApi<any>('/operations/expenses', { method: 'POST', body: JSON.stringify(data) }),
  getReminders: () => fetchApi<any[]>('/operations/reminders'),
  createReminder: (data: any) => fetchApi<any>('/operations/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminderStatus: (id: string, status: string) =>
    fetchApi<any>(`/operations/reminders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getComplaints: () => fetchApi<any[]>('/operations/complaints'),
  createComplaint: (data: any) => fetchApi<any>('/operations/complaints', { method: 'POST', body: JSON.stringify(data) }),
  getSettings: () => fetchApi<any>('/operations/settings'),
  updateSettings: (data: any) => fetchApi<any>('/operations/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => fetchApi<any[]>('/operations/audit-logs'),
};

