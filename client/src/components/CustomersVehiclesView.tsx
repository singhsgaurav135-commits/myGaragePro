import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Car, Phone, Mail, MapPin, Eye, Clock } from 'lucide-react';
import { Customer, Vehicle } from '../types';
import { api } from '../api';

export const CustomersVehiclesView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [subTab, setSubTab] = useState<'customers' | 'vehicles'>('customers');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New Customer Form
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '', city: 'Pune', address: '' });
  // New Vehicle Form
  const [newVeh, setNewVeh] = useState({
    registrationNumber: '',
    make: 'Hyundai',
    model: 'Venue',
    year: 2022,
    fuelType: 'Petrol',
    mileage: 25000,
    customerId: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [c, v] = await Promise.all([api.getCustomers(search), api.getVehicles(search)]);
      setCustomers(c);
      setVehicles(v);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setShowAddCustomerModal(false);
      setNewCust({ name: '', phone: '', email: '', city: 'Pune', address: '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVehicle(newVeh);
      setShowAddVehicleModal(false);
      setNewVeh({
        registrationNumber: '',
        make: 'Hyundai',
        model: 'Venue',
        year: 2022,
        fuelType: 'Petrol',
        mileage: 25000,
        customerId: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer & Vehicle Master Directory</h2>
          <p className="text-xs text-slate-500">Maintain records of registered owners and automobile histories</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setSubTab('customers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'customers' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Customers ({customers.length})
            </button>
            <button
              onClick={() => setSubTab('vehicles')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'vehicles' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Vehicles ({vehicles.length})
            </button>
          </div>

          {subTab === 'customers' ? (
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${subTab} by name, phone, registration number...`}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Subtab 1: Customers Table */}
      {subTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Email / City</th>
                <th className="p-3.5">Linked Vehicles</th>
                <th className="p-3.5">Service Count</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{c.phone}</td>
                  <td className="p-3.5 text-slate-500">
                    <div>{c.email || '—'}</div>
                    <div className="text-[10px] text-slate-400">{c.city || 'Pune'}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.vehicles?.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-semibold"
                        >
                          {v.registrationNumber} ({v.model})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-purple-700">{c.jobCards?.length || 0} visits</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => alert(`Customer: ${c.name}\nPhone: ${c.phone}\nAddress: ${c.address || 'N/A'}`)}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-xs"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 2: Vehicles Table */}
      {subTab === 'vehicles' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Vehicle Reg #</th>
                <th className="p-3.5">Make & Model</th>
                <th className="p-3.5">Year / Fuel</th>
                <th className="p-3.5">Odometer (KM)</th>
                <th className="p-3.5">Registered Owner</th>
                <th className="p-3.5">Last Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700 bg-purple-50/30">
                    {v.registrationNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {v.make} {v.model}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {v.year} • <span className="font-semibold">{v.fuelType}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{v.mileage?.toLocaleString()} KM</td>
                  <td className="p-3.5 text-slate-800 font-medium">
                    {v.customer?.name} ({v.customer?.phone})
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {v.jobCards && v.jobCards[0] ? (
                      <span className="font-semibold text-slate-700">{v.jobCards[0].serviceType}</span>
                    ) : (
                      'No record'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Register New Customer</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={newCust.name}
                onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone</label>
              <input
                type="text"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Address / City</label>
              <input
                type="text"
                value={newCust.address}
                onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateVehicle}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Register Vehicle</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assign to Customer</label>
              <select
                value={newVeh.customerId}
                onChange={(e) => setNewVeh({ ...newVeh, customerId: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Registration #</label>
                <input
                  type="text"
                  placeholder="MH-12-AB-1234"
                  value={newVeh.registrationNumber}
                  onChange={(e) => setNewVeh({ ...newVeh, registrationNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Type</label>
                <select
                  value={newVeh.fuelType}
                  onChange={(e) => setNewVeh({ ...newVeh, fuelType: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="EV">Electric (EV)</option>
                  <option value="CNG">CNG</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Make</label>
                <input
                  type="text"
                  value={newVeh.make}
                  onChange={(e) => setNewVeh({ ...newVeh, make: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  value={newVeh.model}
                  onChange={(e) => setNewVeh({ ...newVeh, model: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Year</label>
                <input
                  type="number"
                  value={newVeh.year}
                  onChange={(e) => setNewVeh({ ...newVeh, year: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Odometer (KM)</label>
                <input
                  type="number"
                  value={newVeh.mileage}
                  onChange={(e) => setNewVeh({ ...newVeh, mileage: Number(e.target.value) })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

