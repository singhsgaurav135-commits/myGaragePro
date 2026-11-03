import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Filter,
  Search,
  Sparkles
} from 'lucide-react';
import { ServiceReminder, Customer, Vehicle } from '../types';
import { api } from '../api';

export const ServiceRemindersView: React.FC = () => {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // New Reminder Form
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [reminderType, setReminderType] = useState('PERIODIC_SERVICE');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('20,000 KM Periodic engine service due');

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, c] = await Promise.all([api.getReminders(), api.getCustomers()]);
      setReminders(r);
      setCustomers(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCust = customers.find((c) => c.id === customerId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReminder({
        customerId,
        vehicleId,
        reminderType,
        dueDate,
        notes,
      });
      setShowAdd(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, method?: string) => {
    try {
      await api.updateReminderStatus(id, status);
      if (status === 'SENT') {
        alert(`Reminder message queued & dispatched successfully via ${method || 'WhatsApp'}!`);
      }
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calculations for KPI Cards
  const now = new Date().getTime();
  const dueThisWeekCount = reminders.filter((r) => {
    const diff = (new Date(r.dueDate).getTime() - now) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 7 && r.status !== 'COMPLETED';
  }).length;

  const overdueCount = reminders.filter((r) => {
    const diff = (new Date(r.dueDate).getTime() - now) / (1000 * 3600 * 24);
    return diff < 0 && r.status !== 'COMPLETED';
  }).length;

  const sentCount = reminders.filter((r) => r.status === 'SENT').length;

  // Filtered Reminders
  const filteredReminders = reminders.filter((r) => {
    const matchesType = filterType === 'ALL' || r.reminderType === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle?.model?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getDaysRemaining = (dateStr: string) => {
    const diffDays = Math.ceil((new Date(dateStr).getTime() - now) / (1000 * 3600 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d Overdue`, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (diffDays === 0) return { label: 'Due Today', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (diffDays <= 7) return { label: `Due in ${diffDays}d`, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: `Due in ${diffDays}d`, color: 'text-purple-600 bg-purple-50 border-purple-200' };
  };

  const getReminderBadge = (type: string) => {
    switch (type) {
      case 'PERIODIC_SERVICE':
        return { label: 'Periodic Service', bg: 'bg-purple-100 text-purple-700' };
      case 'INSURANCE_RENEWAL':
        return { label: 'Insurance Expiry', bg: 'bg-blue-100 text-blue-700' };
      case 'PUC_RENEWAL':
        return { label: 'PUC Renewal', bg: 'bg-emerald-100 text-emerald-700' };
      case 'WHEEL_ALIGNMENT':
        return { label: 'Wheel Alignment', bg: 'bg-amber-100 text-amber-700' };
      default:
        return { label: type.replace('_', ' '), bg: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <BellRing className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Automated Service Reminders & CRM</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactive maintenance follow-ups, warranty expirations, and WhatsApp retention triggers
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Service Reminder</span>
        </button>
      </div>

      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Reminders</span>
            <span className="text-2xl font-bold text-slate-900">{reminders.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BellRing className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Due This Week</span>
            <span className="text-2xl font-bold text-amber-600">{dueThisWeekCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overdue Follow-ups</span>
            <span className="text-2xl font-bold text-rose-600">{overdueCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">WhatsApp Dispatched</span>
            <span className="text-2xl font-bold text-emerald-600">{sentCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: 'All Reminders' },
            { key: 'PERIODIC_SERVICE', label: '🛢️ Periodic Service' },
            { key: 'INSURANCE_RENEWAL', label: '🛡️ Insurance Expiry' },
            { key: 'PUC_RENEWAL', label: '💨 PUC Renewal' },
            { key: 'WHEEL_ALIGNMENT', label: '⚙️ Wheel Alignment' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterType(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === cat.key
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Only</option>
            <option value="SENT">Sent / Notified</option>
            <option value="COMPLETED">Serviced & Completed</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle or customer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Modern Card Grid (Distinct UI from plain tables!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReminders.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">All Customers Are Up-to-Date!</h4>
            <p className="text-xs text-slate-400">No overdue or pending service reminders found for this filter.</p>
          </div>
        ) : (
          filteredReminders.map((r) => {
            const urgency = getDaysRemaining(r.dueDate);
            const badge = getReminderBadge(r.reminderType);

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Row: Type & Urgency */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${urgency.color}`}>
                      {urgency.label}
                    </span>
                  </div>

                  {/* Vehicle Details */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                        {r.vehicle?.make} {r.vehicle?.model}
                      </h4>
                      <p className="font-mono text-xs font-bold text-purple-700 tracking-wide mt-0.5">
                        {r.vehicle?.registrationNumber}
                      </p>
                    </div>
                  </div>

                  {/* Due Date & Owner Info */}
                  <div className="mt-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Due Date:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span>{new Date(r.dueDate).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Owner:</span>
                      <span className="font-semibold text-slate-700">{r.customer?.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <span className="font-mono font-medium text-slate-700">{r.customer?.phone}</span>
                    </div>

                    {r.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 italic">
                        "{r.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {r.status === 'SENT' ? (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>WhatsApp Sent</span>
                      </span>
                    ) : r.status === 'COMPLETED' ? (
                      <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        Serviced
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Pending Outreach
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {r.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'SENT', 'WhatsApp')}
                        title="Send automated WhatsApp Reminder"
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Notify</span>
                      </button>
                    )}

                    {r.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                        title="Mark Customer Serviced"
                        className="px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold transition-all"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Set Reminder Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Set Service Reminder</h3>
            </div>

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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reminder Category</label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="PERIODIC_SERVICE">Periodic Service</option>
                  <option value="INSURANCE_RENEWAL">Insurance Renewal</option>
                  <option value="PUC_RENEWAL">PUC Certificate</option>
                  <option value="WHEEL_ALIGNMENT">Wheel Alignment</option>
                  <option value="OIL_CHANGE">Engine Oil Change</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Due Date</label>
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
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reminder Message / Note</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm">
                Save & Set Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

