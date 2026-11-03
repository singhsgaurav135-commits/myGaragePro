import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, ArrowDownUp, RefreshCw, Layers } from 'lucide-react';
import { SparePart } from '../types';
import { api } from '../api';

export const InventoryStockView: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'parts' | 'movements'>('parts');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add Part Modal
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({
    partNumber: '',
    name: '',
    category: 'Filters',
    unit: 'pcs',
    costPrice: 500,
    sellingPrice: 850,
    stockQuantity: 15,
    minStockLevel: 5,
    rackLocation: 'Rack A-1',
  });

  // Adjust Stock Modal
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [adjustType, setAdjustType] = useState('ADD');
  const [adjustQty, setAdjustQty] = useState('5');
  const [adjustReason, setAdjustReason] = useState('Stock replenishment');

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, m] = await Promise.all([
        api.getInventory(search, category, lowStockOnly),
        api.getStockMovements(),
      ]);
      setParts(p);
      setMovements(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, category, lowStockOnly]);

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPart(newPart);
      setShowAddPart(false);
      setNewPart({
        partNumber: '',
        name: '',
        category: 'Filters',
        unit: 'pcs',
        costPrice: 500,
        sellingPrice: 850,
        stockQuantity: 15,
        minStockLevel: 5,
        rackLocation: 'Rack A-1',
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    try {
      await api.adjustStock(selectedPart.id, {
        type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
      });
      setSelectedPart(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Spare Parts & Inventory Management</h2>
          <p className="text-xs text-slate-500">Track stock levels, reorder alerts, and spare parts consumption</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'parts' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Catalog ({parts.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'movements' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Stock Logs ({movements.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddPart(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Spare Part</span>
          </button>
        </div>
      </div>

      {activeTab === 'parts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by part name or part number..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Lubricants">Lubricants & Oils</option>
              <option value="Filters">Filters</option>
              <option value="Brakes">Brakes & Rotors</option>
              <option value="Electrical">Electrical & Battery</option>
              <option value="AC System">AC System</option>
              <option value="Engine">Engine Parts</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span className="text-rose-600">Low Stock Alert Only</span>
            </label>
          </div>

          {/* Parts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Part Details</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5 text-center">Stock In Hand</th>
                  <th className="p-3.5">Rack Location</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockLevel;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="font-mono text-[11px] text-purple-700 font-semibold">{p.partNumber}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{p.category}</td>
                      <td className="p-3.5 font-medium text-slate-500">₹{p.costPrice.toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-slate-900">₹{p.sellingPrice.toLocaleString()}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isLow
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                        {isLow && <span className="block text-[10px] text-rose-500 font-semibold mt-0.5">Reorder</span>}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{p.rackLocation || 'Shelf B'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedPart(p)}
                          className="px-2.5 py-1 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold text-xs border border-purple-200 transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Stock Movements Audit Trail */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Spare Part</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">Qty Changed</th>
                <th className="p-3.5 text-center">Balance After</th>
                <th className="p-3.5">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-slate-900">{m.sparePart?.name}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.type === 'USAGE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : m.type === 'PURCHASE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold">
                    {m.type === 'USAGE' ? `-${m.quantity}` : `+${m.quantity}`}
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-800">{m.balanceAfter}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{m.reason || 'Workshop operations'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Dialog */}
      {selectedPart && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustStock}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Adjust Inventory Stock: {selectedPart.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current In Stock: <span className="font-bold text-slate-800">{selectedPart.stockQuantity} {selectedPart.unit}</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="ADD">Add Stock (+)</option>
                  <option value="DEDUCT">Deduct Stock (-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Audit Log</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Apply Stock Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Part Dialog */}
      {showAddPart && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPart}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Add New Spare Part</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Part Number</label>
                <input
                  type="text"
                  placeholder="PART-XXX-001"
                  value={newPart.partNumber}
                  onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newPart.category}
                  onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Lubricants">Lubricants & Oils</option>
                  <option value="Filters">Filters</option>
                  <option value="Brakes">Brakes & Rotors</option>
                  <option value="Electrical">Electrical & Battery</option>
                  <option value="AC System">AC System</option>
                  <option value="Engine">Engine Parts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Part Name / Brand</label>
              <input
                type="text"
                placeholder="e.g. Bosch Synthetic Brake Fluid DOT 4"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cost Price (₹)</label>
                <input
                  type="number"
                  value={newPart.costPrice}
                  onChange={(e) => setNewPart({ ...newPart, costPrice: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={newPart.sellingPrice}
                  onChange={(e) => setNewPart({ ...newPart, sellingPrice: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Opening Quantity</label>
                <input
                  type="number"
                  value={newPart.stockQuantity}
                  onChange={(e) => setNewPart({ ...newPart, stockQuantity: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Rack Location</label>
                <input
                  type="text"
                  value={newPart.rackLocation}
                  onChange={(e) => setNewPart({ ...newPart, rackLocation: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPart(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Add Part
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

