import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Plus, CheckCircle2, Clock } from 'lucide-react';
import { ServiceReminder, Customer, Vehicle } from '../types';
import { api } from '../api';

export const RemindersComplaintsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'reminders' | 'complaints'>('reminders');
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Add Reminder Form
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [remType, setRemType] = useState('PERIODIC_SERVICE');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [remNotes, setRemNotes] = useState('Next 10,000 KM Engine Oil & Filter Change Due');

  const loadData = async () => {
    try {
      const [r, c, cust] = await Promise.all([
        api.getReminders(),
        api.getComplaints(),
        api.getCustomers(),
      ]);
      setReminders(r);
      setComplaints(c);
      setCustomers(cust);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCust = customers.find((c) => c.id === customerId);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReminder({
        customerId,
        vehicleId,
        reminderType: remType,
        dueDate,
        notes: remNotes,
      });
      setShowAddReminder(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateReminder = async (id: string, status: string) => {
    try {
      await api.updateReminderStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Service Reminders & Customer Complaints</h2>
          <p className="text-xs text-slate-500">Automated retention reminders and rework satisfaction tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setSubTab('reminders')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'reminders' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Reminders ({reminders.length})
            </button>
            <button
              onClick={() => setSubTab('complaints')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subTab === 'complaints' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Complaints & Rework ({complaints.length})
            </button>
          </div>

          {subTab === 'reminders' && (
            <button
              onClick={() => setShowAddReminder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Reminder</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'reminders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Reminder Type</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700">{r.vehicle?.registrationNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{r.customer?.name} ({r.customer?.phone})</td>
                  <td className="p-3.5 font-semibold text-slate-700">{r.reminderType.replace('_', ' ')}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td className="p-3.5 text-slate-500 italic">{r.notes || 'Routine follow-up'}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : r.status === 'SENT'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateReminder(r.id, 'SENT')}
                        className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded font-semibold text-[11px]"
                      >
                        Send SMS / WhatsApp
                      </button>
                    )}
                    {r.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateReminder(r.id, 'COMPLETED')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-semibold text-[11px]"
                      >
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Job Card</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Complaint Description</th>
                <th className="p-3.5 text-center">Rework Required</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Resolution Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No active customer complaints. Customer satisfaction is high!
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-purple-700">{c.jobCard?.jobCardNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{c.customer?.name}</td>
                    <td className="p-3.5 text-slate-800 font-medium">{c.description}</td>
                    <td className="p-3.5 text-center">
                      {c.reworkRequired ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                          YES
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{c.resolution || 'Assigned to service manager'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Set Reminder Dialog */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReminder}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Set Service Reminder</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setVehicleId('');
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
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
              <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              >
                <option value="">Select vehicle...</option>
                {selectedCust?.vehicles?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reminder Type</label>
                <select
                  value={remType}
                  onChange={(e) => setRemType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="PERIODIC_SERVICE">Periodic Service</option>
                  <option value="OIL_CHANGE">Engine Oil Change</option>
                  <option value="INSURANCE_RENEWAL">Insurance Renewal</option>
                  <option value="PUC_RENEWAL">PUC Certificate</option>
                  <option value="WHEEL_ALIGNMENT">Wheel Alignment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reminder Notes</label>
              <textarea
                rows={2}
                value={remNotes}
                onChange={(e) => setRemNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddReminder(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Save Reminder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

