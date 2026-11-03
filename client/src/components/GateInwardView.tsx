import React, { useState, useEffect } from 'react';
import { Truck, Plus, Fuel, Gauge, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Customer, Vehicle, InwardRecord } from '../types';
import { api } from '../api';

export const GateInwardView: React.FC = () => {
  const [records, setRecords] = useState<InwardRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('50%');
  const [personalBelongings, setPersonalBelongings] = useState('Fastag on windshield, emergency toolkit in boot');
  const [scratchNotes, setScratchNotes] = useState('Minor door scratch, right mirror cover small scuff');
  const [createJobCard, setCreateJobCard] = useState(true);
  const [serviceType, setServiceType] = useState('Full Periodic Service');
  const [concerns, setConcerns] = useState('10k scheduled maintenance, AC cooling check');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [r, c] = await Promise.all([api.getInwardRecords(), api.getCustomers()]);
      setRecords(r);
      setCustomers(c);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId) {
      alert('Please select both Customer and Vehicle.');
      return;
    }

    setLoading(true);
    try {
      await api.createInwardRecord({
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        odometerReading: Number(odometer) || 0,
        fuelLevel,
        personalBelongings,
        scratchDamageNotes: scratchNotes,
        createJobCard,
        serviceType,
        customerConcerns: concerns,
        priority: 'NORMAL',
      });
      alert('Vehicle Inward Gate Entry recorded successfully!');
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setOdometer('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Vehicle Inward & Gate Entry</h2>
        <p className="text-xs text-slate-500">Record incoming vehicle condition, fuel gauge, belongings and initialize job cards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inward Entry Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span>New Gate Entry</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedVehicleId('');
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none"
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none"
                required
              >
                <option value="">Select vehicle...</option>
                {selectedCustomer?.vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Odometer (KM)</label>
                <input
                  type="number"
                  placeholder="e.g. 24500"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fuel Gauge</label>
                <select
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Reserve / Empty">Reserve / Empty</option>
                  <option value="25%">25% (1/4 Tank)</option>
                  <option value="50%">50% (Half Tank)</option>
                  <option value="75%">75% (3/4 Tank)</option>
                  <option value="100% Full">100% Full Tank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Personal Belongings Inside</label>
              <input
                type="text"
                value={personalBelongings}
                onChange={(e) => setPersonalBelongings(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Pre-existing Scratches / Dents</label>
              <textarea
                rows={2}
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createJobCard}
                  onChange={(e) => setCreateJobCard(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-purple-900">Auto-generate Job Card immediately</span>
              </label>

              {createJobCard && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Primary Service (e.g. Full Service)"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full text-xs bg-white border border-purple-200 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Customer complaints..."
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    className="w-full text-xs bg-white border border-purple-200 rounded-lg p-2"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {loading ? 'Processing...' : 'Record Gate Entry & Inward'}
            </button>
          </form>
        </div>

        {/* Inward History Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Inward Records</h3>
            <span className="text-xs font-semibold text-slate-500">{records.length} logged</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Gate Pass #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Fuel</th>
                <th className="p-3">Job Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-purple-700">{r.gateEntryNumber}</td>
                  <td className="p-3 text-slate-500">{new Date(r.inwardDate).toLocaleDateString()}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{r.vehicle?.registrationNumber}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {r.vehicle?.make} {r.vehicle?.model}
                    </div>
                  </td>
                  <td className="p-3 text-slate-700">{r.customer?.name}</td>
                  <td className="p-3 font-medium text-slate-600">{r.fuelLevel}</td>
                  <td className="p-3">
                    {r.jobCard ? (
                      <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {r.jobCard.jobCardNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

