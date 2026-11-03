import React, { useState, useEffect } from 'react';
import { Layers, Plus, Truck, CheckCircle2, DollarSign, Package } from 'lucide-react';
import { Supplier, PurchaseOrder, SparePart, Expense } from '../types';
import { api } from '../api';

export const OperationsPurchasesView: React.FC = () => {
  const [subTab, setSubTab] = useState<'purchases' | 'suppliers' | 'expenses'>('purchases');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<SparePart[]>([]);

  // PO Form
  const [showAddPO, setShowAddPO] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poPartId, setPoPartId] = useState('');
  const [poQty, setPoQty] = useState('10');
  const [poCost, setPoCost] = useState('1500');

  // Supplier Form
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');

  // Expense Form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expCategory, setExpCategory] = useState('Workshop Tools');
  const [expAmount, setExpAmount] = useState('2500');
  const [expMethod, setExpMethod] = useState('UPI');
  const [expDesc, setExpDesc] = useState('');
  const [expPaidTo, setExpPaidTo] = useState('');

  const loadData = async () => {
    try {
      const [s, p, e, inv] = await Promise.all([
        api.getSuppliers(),
        api.getPurchases(),
        api.getExpenses(),
        api.getInventory(),
      ]);
      setSuppliers(s);
      setPurchases(p);
      setExpenses(e);
      setInventory(inv);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPurchase({
        supplierId: selectedSupplierId,
        items: [
          {
            sparePartId: poPartId,
            quantity: Number(poQty),
            unitCost: Number(poCost),
          },
        ],
      });
      alert('Purchase Order created successfully.');
      setShowAddPO(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      await api.receivePurchase(poId);
      alert('Goods received! Inventory stock updated and balance credited to supplier.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupplier({
        name: supplierName,
        phone: supplierPhone,
        address: supplierAddress,
      });
      setShowAddSupplier(false);
      setSupplierName('');
      setSupplierPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        category: expCategory,
        amount: Number(expAmount),
        paymentMethod: expMethod,
        description: expDesc,
        paidTo: expPaidTo,
      });
      setShowAddExpense(false);
      setExpDesc('');
      setExpPaidTo('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Procurement & Workshop Accounting</h2>
          <p className="text-xs text-slate-500">Purchase orders, supplier ledger, goods receipt and petty expenses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setSubTab('purchases')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'purchases' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Purchase Orders ({purchases.length})
            </button>
            <button
              onClick={() => setSubTab('suppliers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'suppliers' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setSubTab('expenses')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'expenses' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Expenses ({expenses.length})
            </button>
          </div>

          {subTab === 'purchases' && (
            <button
              onClick={() => setShowAddPO(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create PO</span>
            </button>
          )}

          {subTab === 'suppliers' && (
            <button
              onClick={() => setShowAddSupplier(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
          )}

          {subTab === 'expenses' && (
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Purchase Orders */}
      {subTab === 'purchases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Order Date</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5 text-right">PO Total Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Goods Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700">{po.poNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{po.supplier?.name}</td>
                  <td className="p-3.5 text-slate-500">{new Date(po.orderDate).toLocaleDateString()}</td>
                  <td className="p-3.5">
                    {po.items?.map((it) => (
                      <div key={it.id} className="text-slate-700 font-medium">
                        {it.sparePart?.name} (x{it.quantity} @ ₹{it.unitCost})
                      </div>
                    ))}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">₹{po.totalAmount.toLocaleString()}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'RECEIVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {po.status === 'ORDERED' ? (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Receive Goods & Update Stock
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Stock Credited</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Suppliers Directory */}
      {subTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Phone / Email</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                  <td className="p-3.5 text-slate-600">{s.contactPerson || 'Sales Desk'}</td>
                  <td className="p-3.5 text-slate-600">
                    <div>{s.phone}</div>
                    <div className="text-[10px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="p-3.5 text-slate-500">{s.address || 'Pune Auto Cluster'}</td>
                  <td className="p-3.5 text-right font-bold text-amber-600">
                    ₹{s.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Workshop Expenses */}
      {subTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Expense #</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Paid To</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700">{exp.expenseNumber}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-800 font-medium">{exp.description}</td>
                  <td className="p-3.5 text-slate-600">{exp.paidTo}</td>
                  <td className="p-3.5 font-semibold text-slate-500">{exp.paymentMethod}</td>
                  <td className="p-3.5 text-right font-bold text-rose-600">₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create PO Dialog */}
      {showAddPO && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePO}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Create Purchase Order (PO)</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              >
                <option value="">Choose supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Spare Part to Order</label>
              <select
                value={poPartId}
                onChange={(e) => setPoPartId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              >
                <option value="">Choose item...</option>
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.partNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={poQty}
                  onChange={(e) => setPoQty(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Unit Cost (₹)</label>
                <input
                  type="number"
                  value={poCost}
                  onChange={(e) => setPoCost(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPO(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Expense Dialog */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Log Workshop Expense</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Workshop Tools">Workshop Tools & Machinery</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Consumables">Workshop Consumables</option>
                  <option value="Staff Refreshments">Staff Tea / Snacks</option>
                  <option value="Rent & Premises">Rent & Premises</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="NET_BANKING">Net Banking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹)</label>
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Paid To (Vendor / Person)</label>
              <input
                type="text"
                placeholder="e.g. Apex Hardware Store"
                value={expPaidTo}
                onChange={(e) => setExpPaidTo(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Purpose</label>
              <input
                type="text"
                placeholder="e.g. 2 replacement pneumatic hoses for Bay 2"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Record Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Dialog */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSupplier}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Add Parts Supplier</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Supplier Company Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Address / Warehouse</label>
              <input
                type="text"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSupplier(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

