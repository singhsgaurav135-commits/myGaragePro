import React, { useState, useEffect } from 'react';
import { Search, FileText, Printer, CreditCard, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { Invoice } from '../types';
import { api } from '../api';

export const BillingInvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Invoice for Payment
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  // Selected Invoice for Print / Preview
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.getInvoices(statusFilter, search);
      setInvoices(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, search]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.recordPayment(selectedInvoice.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        transactionRef: paymentRef || `TXN-${Date.now()}`,
      });
      alert('Payment recorded successfully.');
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentRef('');
      loadInvoices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenPrintPreview = async (inv: Invoice) => {
    const full = await api.getInvoice(inv.id);
    setViewInvoice(full);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing, Invoices & Payments</h2>
          <p className="text-xs text-slate-500">Commercial GST invoicing and payment tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Invoices</option>
            <option value="UNPAID">Unpaid Only</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice number or customer name..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3.5">Invoice #</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Customer & Vehicle</th>
              <th className="p-3.5 text-right">Subtotal</th>
              <th className="p-3.5 text-right">GST (18%)</th>
              <th className="p-3.5 text-right">Grand Total</th>
              <th className="p-3.5 text-right">Paid</th>
              <th className="p-3.5 text-right">Balance Due</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-purple-700 bg-purple-50/20">
                    {inv.invoiceNumber}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{inv.customer?.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {inv.jobCard?.vehicle?.registrationNumber}
                    </div>
                  </td>
                  <td className="p-3.5 text-right font-medium text-slate-600">
                    ₹{inv.subtotal.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-medium text-slate-600">
                    ₹{inv.taxAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    ₹{inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-600">
                    ₹{inv.paidAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-bold text-rose-600">
                    ₹{inv.balanceAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700'
                          : inv.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenPrintPreview(inv)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                      title="View & Print"
                    >
                      <Printer className="w-3.5 h-3.5 inline" />
                    </button>
                    {inv.balanceAmount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPaymentAmount(String(inv.balanceAmount));
                        }}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded text-xs border border-purple-200 transition-colors"
                      >
                        Collect ₹
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Collect Payment Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Collect Payment: {selectedInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-bold text-slate-800">{selectedInvoice.customer?.name}</span> •
              Balance Due:{' '}
              <span className="font-bold text-rose-600">₹{selectedInvoice.balanceAmount.toLocaleString()}</span>
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Amount to Collect (₹)</label>
              <input
                type="number"
                max={selectedInvoice.balanceAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="BANK_TRANSFER">NEFT / RTGS / IMPS</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Transaction Ref No.</label>
              <input
                type="text"
                placeholder="E.g. UPI/2026/839102"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable GST Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-black text-purple-700 tracking-tight">myGaragePro Auto Works</h2>
                <p className="text-xs text-slate-500">Plot 42, Sector 18, MIDC Auto Zone, Pune, MH</p>
                <p className="text-xs text-slate-500 font-mono">GSTIN: 27ABCDE1234F1Z5</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">TAX INVOICE</span>
                <span className="font-mono font-bold text-slate-900">{viewInvoice.invoiceNumber}</span>
                <p className="text-xs text-slate-500">{new Date(viewInvoice.invoiceDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Billed to */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">BILLED TO:</span>
                <div className="font-bold text-slate-900">{viewInvoice.customer?.name}</div>
                <div className="text-slate-600">{viewInvoice.customer?.phone}</div>
                <div className="text-slate-600">{viewInvoice.customer?.city || 'Pune'}</div>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">VEHICLE DETAILS:</span>
                <div className="font-bold text-slate-900">
                  {viewInvoice.jobCard?.vehicle?.make} {viewInvoice.jobCard?.vehicle?.model}
                </div>
                <div className="font-mono font-semibold text-purple-700">
                  {viewInvoice.jobCard?.vehicle?.registrationNumber}
                </div>
                <div className="text-slate-500">Mileage: {viewInvoice.jobCard?.vehicle?.mileage} KM</div>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-xs text-left">
              <thead className="border-b font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2">Item / Description</th>
                  <th className="py-2 text-center">Type</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewInvoice.jobCard?.tasks?.map((t: any) => (
                  <tr key={t.id}>
                    <td className="py-2 text-slate-800 font-medium">{t.description}</td>
                    <td className="py-2 text-center text-slate-500 text-[10px]">LABOR</td>
                    <td className="py-2 text-right font-medium">₹{t.laborCost.toLocaleString()}</td>
                  </tr>
                ))}
                {viewInvoice.jobCard?.partsUsed?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2 text-slate-800 font-medium">
                      {p.sparePart?.name} (x{p.quantity})
                    </td>
                    <td className="py-2 text-center text-slate-500 text-[10px]">PART</td>
                    <td className="py-2 text-right font-medium">₹{p.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-3 border-t">
              <div className="w-56 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{viewInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%):</span>
                  <span>₹{(viewInvoice.taxAmount / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%):</span>
                  <span>₹{(viewInvoice.taxAmount / 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{viewInvoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Paid Amount:</span>
                  <span>₹{viewInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span>₹{viewInvoice.balanceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

