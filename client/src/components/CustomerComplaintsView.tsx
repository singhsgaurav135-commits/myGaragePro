import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle2, Wrench, Clock, User, Car } from 'lucide-react';
import { Customer, JobCard } from '../types';
import { api } from '../api';

export const CustomerComplaintsView: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedJobCardId, setSelectedJobCardId] = useState('');
  const [description, setDescription] = useState('');
  const [reworkRequired, setReworkRequired] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [comp, cust, jc] = await Promise.all([
        api.getComplaints(),
        api.getCustomers(),
        api.getJobCards(),
      ]);
      setComplaints(comp);
      setCustomers(cust);
      setJobCards(jc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        customerId: selectedCustomerId,
        jobCardId: selectedJobCardId,
        description,
        reworkRequired,
      });
      setShowAdd(false);
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openTickets = complaints.filter((c) => c.status === 'OPEN').length;
  const reworkCount = complaints.filter((c) => c.reworkRequired).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Customer Complaints & Quality Rework</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer dissatisfaction, rework bay assignments, and warranty root-cause corrections
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Customer Issue</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Issues Logged</span>
            <span className="text-2xl font-bold text-slate-900">{complaints.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Open Incidents</span>
            <span className="text-2xl font-bold text-orange-600">{openTickets}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Rework Required</span>
            <span className="text-2xl font-bold text-rose-600">{reworkCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Resolved & Closed</span>
            <span className="text-2xl font-bold text-emerald-600">{resolvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {complaints.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 hover:border-orange-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {c.jobCard?.jobCardNumber}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {c.jobCard?.vehicle?.registrationNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {c.reworkRequired ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                    Rework Required
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Clarification Only
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Reported Complaint
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">"{c.description}"</p>
            </div>

            {c.resolution && (
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Workshop Resolution & Rework Performed
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed">{c.resolution}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{c.customer?.name} ({c.customer?.phone})</span>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Log Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Log Customer Issue / Rework</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
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
              <label className="text-xs font-semibold text-slate-700 block mb-1">Linked Job Card</label>
              <select
                value={selectedJobCardId}
                onChange={(e) => setSelectedJobCardId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              >
                <option value="">Select Job Card...</option>
                {jobCards.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jobCardNumber} - {j.vehicle?.registrationNumber} ({j.vehicle?.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Issue Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of noise, vibration, alignment drift, or service dissatisfaction..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer p-2 bg-rose-50 rounded-xl border border-rose-200">
              <input
                type="checkbox"
                checked={reworkRequired}
                onChange={(e) => setReworkRequired(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-rose-900">Vehicle Requires Free Rework in Bay</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">
                Log Issue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

