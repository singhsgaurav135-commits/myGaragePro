import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  CheckCircle,
  FileText,
  Package,
  ShieldCheck,
  CreditCard,
  Truck,
  Plus,
  Clock,
  Car,
  User,
  AlertTriangle,
  Send,
  Star,
  Printer
} from 'lucide-react';
import { JobCard, SparePart, JobStatus } from '../types';
import { api } from '../api';

interface JobCardDetailModalProps {
  jobCardId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const JobCardDetailModal: React.FC<JobCardDetailModalProps> = ({
  jobCardId,
  onClose,
  onRefresh,
}) => {
  const [job, setJob] = useState<JobCard | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'estimate' | 'parts' | 'qc' | 'billing' | 'delivery'>('overview');
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<SparePart[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);

  // Task Form State
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLabor, setTaskLabor] = useState('');
  const [taskMechanic, setTaskMechanic] = useState('');

  // Part Issue State
  const [selectedPartId, setSelectedPartId] = useState('');
  const [issueQty, setIssueQty] = useState('1');

  // Estimate Form State
  const [estimateItems, setEstimateItems] = useState<{ description: string; itemType: string; quantity: number; unitPrice: number }[]>([
    { description: 'Engine Oil Change & Filter Replacement', itemType: 'LABOR', quantity: 1, unitPrice: 850 },
    { description: 'Castrol 5W-30 Synthetic (3.5L)', itemType: 'PART', quantity: 1, unitPrice: 2200 },
  ]);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  // Inspection Form State
  const [inspectionState, setInspectionState] = useState({
    engineOil: 'GOOD',
    brakeCondition: 'GOOD',
    tyreCondition: 'GOOD',
    batteryHealth: 'GOOD',
    electricalLights: 'GOOD',
    suspension: 'GOOD',
    bodyDamageDetails: '',
    overallPassed: true,
    inspectionNotes: '',
  });

  // QC State
  const [qcState, setQcState] = useState({
    roadTestDone: true,
    cleanlinessDone: true,
    allTasksVerified: true,
    passed: true,
    comments: 'All tasks tested and ready for customer handover.',
  });

  // Delivery State
  const [deliveryState, setDeliveryState] = useState({
    deliveredTo: '',
    exitOdometer: '',
    fuelLevelOnExit: 'Full',
    customerRating: 5,
    feedback: 'Excellent service and timely delivery.',
  });

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await api.getJobCard(jobCardId);
      setJob(res);

      if (res.inspection) {
        setInspectionState({
          engineOil: res.inspection.engineOil || 'GOOD',
          brakeCondition: res.inspection.brakeCondition || 'GOOD',
          tyreCondition: res.inspection.tyreCondition || 'GOOD',
          batteryHealth: res.inspection.batteryHealth || 'GOOD',
          electricalLights: res.inspection.electricalLights || 'GOOD',
          suspension: res.inspection.suspension || 'GOOD',
          bodyDamageDetails: res.inspection.bodyDamageDetails || '',
          overallPassed: res.inspection.overallPassed,
          inspectionNotes: res.inspection.inspectionNotes || '',
        });
      }

      const inv = await api.getInventory();
      setInventory(inv);

      const users = await api.getUsers();
      setStaffUsers(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobCardId]);

  if (loading || !job) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Loading Job Card...</p>
        </div>
      </div>
    );
  }

  // Action Handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc) return;
    try {
      await api.addTask(job.id, {
        description: taskDesc,
        laborCost: Number(taskLabor) || 0,
        mechanicId: taskMechanic || undefined,
      });
      setTaskDesc('');
      setTaskLabor('');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.updateTask(taskId, { status });
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleIssuePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;
    try {
      await api.issuePart(job.id, {
        sparePartId: selectedPartId,
        quantity: Number(issueQty) || 1,
      });
      setSelectedPartId('');
      setIssueQty('1');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveInspection = async () => {
    try {
      await api.saveInspection(job.id, inspectionState);
      alert('Inspection details saved successfully.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveEstimate = async () => {
    try {
      await api.saveEstimate(job.id, {
        items: estimateItems,
        customerNotes: 'Standard service estimate sent to customer',
      });
      alert('Estimate created and sent for customer approval.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveEstimate = async (approved: boolean) => {
    try {
      await api.approveEstimate(job.id, approved, approved ? 'Approved via WhatsApp/Call' : 'Customer declined');
      alert(approved ? 'Estimate Approved! Job moved to Service stage.' : 'Estimate Rejected.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveQC = async () => {
    try {
      await api.saveQualityCheck(job.id, qcState);
      alert('Quality Inspection passed! Vehicle is Ready for Delivery.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      await api.generateInvoice(job.id);
      alert('Invoice generated successfully with 18% GST.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.invoice) return;
    try {
      await api.recordPayment(job.invoice.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        transactionRef: paymentRef || `TXN-${Date.now()}`,
      });
      setPaymentAmount('');
      setPaymentRef('');
      alert('Payment recorded successfully.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeliverVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.deliverVehicle(job.id, {
        deliveredTo: deliveryState.deliveredTo || job.customer.name,
        exitOdometer: deliveryState.exitOdometer,
        fuelLevelOnExit: deliveryState.fuelLevelOnExit,
        customerRating: deliveryState.customerRating,
        feedback: deliveryState.feedback,
      });
      alert('Gate Pass issued! Vehicle marked Delivered.');
      await loadJob();
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-200">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{job.jobCardNumber}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {job.status}
                </span>
                {job.priority === 'URGENT' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    URGENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model} •{' '}
                <span className="font-mono font-semibold text-slate-700">{job.vehicle?.registrationNumber}</span> • Customer:{' '}
                <span className="font-semibold text-slate-700">{job.customer?.name} ({job.customer?.phone})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Actual Cost</span>
              <span className="text-xl font-bold text-slate-900">₹{(job.actualCost || 0).toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: '1. Overview & Tasks', icon: Wrench },
            { id: 'inspection', label: '2. Inspection', icon: ShieldCheck },
            { id: 'estimate', label: '3. Estimate & Approval', icon: FileText },
            { id: 'parts', label: '4. Spare Parts Usage', icon: Package },
            { id: 'qc', label: '5. Quality Check', icon: CheckCircle },
            { id: 'billing', label: '6. Billing & Payments', icon: CreditCard },
            { id: 'delivery', label: '7. Gate Pass & Delivery', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & TASKS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer Concerns & Vehicle Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Reported Concerns</h4>
                  <p className="text-sm text-slate-800 font-medium">
                    {job.customerConcerns || 'Standard scheduled service check.'}
                  </p>
                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Service Type:</span> {job.serviceType}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Inward Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Gate Entry:</span>{' '}
                      <span className="font-semibold text-slate-700">{job.inwardRecord?.gateEntryNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Odometer:</span>{' '}
                      <span className="font-semibold text-slate-700">{job.vehicle?.mileage?.toLocaleString()} KM</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Fuel Level:</span>{' '}
                      <span className="font-semibold text-slate-700">{job.inwardRecord?.fuelLevel || '50%'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Belongings:</span>{' '}
                      <span className="font-semibold text-slate-700">{job.inwardRecord?.personalBelongings || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">Repair & Service Tasks ({job.tasks?.length || 0})</h4>
                </div>

                <div className="space-y-2">
                  {job.tasks?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No tasks added yet. Add tasks below.</p>
                  ) : (
                    job.tasks?.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{t.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>Labor: ₹{t.laborCost.toLocaleString()}</span>
                            <span>•</span>
                            <span>Mechanic: {t.mechanic ? t.mechanic.name : 'Unassigned'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Add New Service / Repair Task</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Task description (e.g. Brake pad replacement)"
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      className="md:col-span-2 text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Labor cost (₹)"
                      value={taskLabor}
                      onChange={(e) => setTaskLabor(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <select
                      value={taskMechanic}
                      onChange={(e) => setTaskMechanic(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">Assign Mechanic...</option>
                      {staffUsers
                        .filter((u) => u.role === 'MECHANIC')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.specialty || 'Mechanic'})
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: INSPECTION */}
          {activeTab === 'inspection' && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900 mb-4">50-Point Pre-Service Inspection Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'engineOil', label: 'Engine Oil & Filter Level' },
                    { key: 'brakeCondition', label: 'Brake Pads & Disc Wear' },
                    { key: 'tyreCondition', label: 'Tyre Tread & Pressure' },
                    { key: 'batteryHealth', label: 'Battery Health & Terminal' },
                    { key: 'electricalLights', label: 'Headlights, Indicators & Horn' },
                    { key: 'suspension', label: 'Suspension & Shock Absorbers' },
                  ].map((field) => (
                    <div key={field.key} className="bg-white p-3 rounded-xl border border-slate-200">
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">{field.label}</label>
                      <select
                        value={(inspectionState as any)[field.key]}
                        onChange={(e) => setInspectionState({ ...inspectionState, [field.key]: e.target.value })}
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                      >
                        <option value="GOOD">Good / Optimal</option>
                        <option value="LOW">Low / Degraded</option>
                        <option value="REPLACE">Needs Immediate Replacement</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Body Scratches & Dents Observed</label>
                  <textarea
                    rows={2}
                    value={inspectionState.bodyDamageDetails}
                    onChange={(e) => setInspectionState({ ...inspectionState, bodyDamageDetails: e.target.value })}
                    placeholder="E.g., Left rear fender minor scratch, hood stone chips..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inspectionState.overallPassed}
                      onChange={(e) => setInspectionState({ ...inspectionState, overallPassed: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">Vehicle cleared for repair & estimation</span>
                  </label>

                  <button
                    onClick={handleSaveInspection}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Save Inspection Record
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESTIMATE & APPROVAL */}
          {activeTab === 'estimate' && (
            <div className="space-y-6">
              {job.estimate ? (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{job.estimate.estimateNumber}</h4>
                      <p className="text-xs text-slate-500">Estimate generated for customer review</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        job.estimate.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : job.estimate.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {job.estimate.status}
                    </span>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {job.estimate.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2.5 text-slate-500">{item.itemType}</td>
                          <td className="p-2.5 text-center">{item.quantity}</td>
                          <td className="p-2.5 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <div className="w-64 space-y-1.5 text-xs text-right">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span>₹{job.estimate.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST ({job.estimate.taxRate}%):</span>
                        <span>₹{job.estimate.taxAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t">
                        <span>Grand Total:</span>
                        <span>₹{job.estimate.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {job.estimate.status === 'SENT' && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-800">
                        Awaiting Customer Approval for ₹{job.estimate.grandTotal.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveEstimate(false)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveEstimate(true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Proceed</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <p className="text-xs text-slate-600 font-medium">
                    No estimate prepared yet. Click below to generate an estimate based on inspection.
                  </p>
                  <button
                    onClick={handleSaveEstimate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Generate Estimate & Send for Approval
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SPARE PARTS USAGE */}
          {activeTab === 'parts' && (
            <div className="space-y-6">
              {/* Issued Parts Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Issued Spare Parts for this Vehicle</h4>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Part Name</th>
                        <th className="p-3">Part Number</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {job.partsUsed?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400">
                            No parts issued yet.
                          </td>
                        </tr>
                      ) : (
                        job.partsUsed?.map((pu) => (
                          <tr key={pu.id}>
                            <td className="p-3 font-semibold text-slate-800">{pu.sparePart?.name}</td>
                            <td className="p-3 font-mono text-slate-500">{pu.sparePart?.partNumber}</td>
                            <td className="p-3 text-center font-bold">{pu.quantity}</td>
                            <td className="p-3 text-right">₹{pu.unitPrice.toLocaleString()}</td>
                            <td className="p-3 text-right font-bold text-slate-900">₹{pu.total.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Issue Part from Store Form */}
              <form onSubmit={handleIssuePart} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Issue Spare Part from Inventory Store</span>
                <p className="text-[11px] text-slate-500">
                  Stock is deducted immediately and recorded in the Stock Movement audit log.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="md:col-span-2 text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Spare Part from Store...</option>
                    {inventory.map((part) => (
                      <option key={part.id} value={part.id} disabled={part.stockQuantity <= 0}>
                        {part.name} ({part.partNumber}) - Stock: {part.stockQuantity} {part.unit} @ ₹{part.sellingPrice}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={issueQty}
                      onChange={(e) => setIssueQty(e.target.value)}
                      className="w-20 text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 focus:outline-none text-center"
                      required
                    />
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Part</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: QUALITY CHECK */}
          {activeTab === 'qc' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Post-Service Quality & Handover Inspection</h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qcState.roadTestDone}
                      onChange={(e) => setQcState({ ...qcState, roadTestDone: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Road Test Completed</span>
                      <span className="text-[11px] text-slate-500">Acceleration, steering alignment, braking stability verified on test drive.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qcState.cleanlinessDone}
                      onChange={(e) => setQcState({ ...qcState, cleanlinessDone: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Interior & Exterior Cleaning Done</span>
                      <span className="text-[11px] text-slate-500">Vacuuming, windshield wipe, tyre polish, dash polish inspected.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qcState.allTasksVerified}
                      onChange={(e) => setQcState({ ...qcState, allTasksVerified: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">All Job Card Tasks Verified</span>
                      <span className="text-[11px] text-slate-500">Fluids topped to spec, nuts torque-checked, zero warning lamps on cluster.</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Supervisor QC Comments</label>
                  <textarea
                    rows={2}
                    value={qcState.comments}
                    onChange={(e) => setQcState({ ...qcState, comments: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleSaveQC}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Pass QC & Mark Ready for Pickup</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: BILLING & PAYMENTS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {job.invoice ? (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  {/* Invoice Header */}
                  <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{job.invoice.invoiceNumber}</h4>
                      <p className="text-xs text-slate-500">
                        Date: {new Date(job.invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          job.invoice.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : job.invoice.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {job.invoice.status}
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-center">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Subtotal</span>
                      <span className="font-bold text-xs text-slate-800">₹{job.invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">GST (18%)</span>
                      <span className="font-bold text-xs text-slate-800">₹{job.invoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Grand Total</span>
                      <span className="font-bold text-sm text-slate-900">₹{job.invoice.grandTotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block">Balance Due</span>
                      <span className="font-bold text-sm text-rose-600">₹{job.invoice.balanceAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-2">Recorded Payments</h5>
                    <div className="space-y-1.5">
                      {job.invoice.payments?.length === 0 ? (
                        <p className="text-xs text-slate-400">No payment received yet.</p>
                      ) : (
                        job.invoice.payments?.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{p.paymentNumber}</span>
                              <span className="text-slate-500 ml-2">via {p.method}</span>
                              {p.transactionRef && (
                                <span className="font-mono text-slate-400 ml-2">Ref: {p.transactionRef}</span>
                              )}
                            </div>
                            <span className="font-bold text-emerald-600">₹{p.amount.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Record Payment Form (if balance > 0) */}
                  {job.invoice.balanceAmount > 0 && (
                    <form onSubmit={handleRecordPayment} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                      <span className="text-xs font-bold text-purple-900 block">
                        Record Customer Payment (Outstanding: ₹{job.invoice.balanceAmount.toLocaleString()})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="number"
                          placeholder="Amount (₹)"
                          max={job.invoice.balanceAmount}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="text-xs bg-white border border-purple-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          required
                        />
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-xs bg-white border border-purple-200 rounded-lg p-2 focus:outline-none"
                        >
                          <option value="UPI">UPI (GPay / PhonePe)</option>
                          <option value="CASH">Cash</option>
                          <option value="CARD">Credit / Debit Card</option>
                          <option value="BANK_TRANSFER">NEFT / Net Banking</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Transaction / UPI Ref No."
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          className="text-xs bg-white border border-purple-200 rounded-lg p-2 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Collect Payment
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <p className="text-xs text-slate-600 font-medium">
                    No invoice generated yet. Click below to compile actual labor & spare parts used into a final GST Tax Invoice.
                  </p>
                  <button
                    onClick={handleGenerateInvoice}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Generate Final GST Tax Invoice
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: GATE PASS & DELIVERY */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {job.deliveryRecord ? (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-900">
                      Vehicle Delivered - Gate Pass {job.deliveryRecord.gatePassNumber}
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Delivered to <span className="font-semibold">{job.deliveryRecord.deliveredTo}</span> on{' '}
                    {new Date(job.deliveryRecord.deliveryDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(job.deliveryRecord.customerRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  {job.deliveryRecord.feedback && (
                    <p className="text-xs text-slate-600 italic">"{job.deliveryRecord.feedback}"</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleDeliverVehicle} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Issue Exit Gate Pass & Handover to Customer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Delivered To (Person Name)</label>
                      <input
                        type="text"
                        defaultValue={job.customer.name}
                        onChange={(e) => setDeliveryState({ ...deliveryState, deliveredTo: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Exit Odometer (KM)</label>
                      <input
                        type="number"
                        placeholder={String(job.vehicle.mileage)}
                        onChange={(e) => setDeliveryState({ ...deliveryState, exitOdometer: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Rating (1-5)</label>
                      <select
                        value={deliveryState.customerRating}
                        onChange={(e) => setDeliveryState({ ...deliveryState, customerRating: Number(e.target.value) })}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none font-semibold text-amber-600"
                      >
                        <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                        <option value="4">★★★★☆ (4 Stars - Good)</option>
                        <option value="3">★★★☆☆ (3 Stars - Satisfactory)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Customer Remarks / Feedback</label>
                    <textarea
                      rows={2}
                      value={deliveryState.feedback}
                      onChange={(e) => setDeliveryState({ ...deliveryState, feedback: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Issue Gate Pass & Handover Vehicle</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

