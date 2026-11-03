import React, { useState, useEffect } from 'react';
import { Settings, Shield, Save, CheckCircle2, History } from 'lucide-react';
import { GarageSetting, AuditLog } from '../types';
import { api } from '../api';

export const SettingsAuditView: React.FC = () => {
  const [subTab, setSubTab] = useState<'settings' | 'audit'>('settings');
  const [settings, setSettings] = useState<GarageSetting>({
    id: 'default',
    garageName: 'myGaragePro Auto Works',
    tagline: 'The OS for Modern Garages',
    phone: '+91 98765 43210',
    email: 'contact@garagepro.service',
    address: 'Plot 42, Automobile Hub, Sector 18, MIDC, Pune, MH',
    gstin: '27ABCDE1234F1Z5',
    taxRatePercent: 18.0,
    currencySymbol: '₹',
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [s, l] = await Promise.all([api.getSettings(), api.getAuditLogs()]);
      if (s) setSettings(s);
      setLogs(l);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('Garage Profile and Tax Settings updated successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Garage Settings & Compliance Audit Trail</h2>
          <p className="text-xs text-slate-500">Configure business information, GST credentials, and track user actions</p>
        </div>

        <div className="bg-slate-200/70 p-1 rounded-xl flex text-xs font-semibold">
          <button
            onClick={() => setSubTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'settings' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Garage Profile
          </button>
          <button
            onClick={() => setSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'audit' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Audit Logs ({logs.length})
          </button>
        </div>
      </div>

      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Commercial Business Profile</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Garage Workshop Name</label>
              <input
                type="text"
                value={settings.garageName}
                onChange={(e) => setSettings({ ...settings, garageName: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Official GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRatePercent}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Workshop Physical Address</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      )}

      {subTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Performed By</th>
                <th className="p-3.5">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{log.entity}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{log.performedBy}</td>
                  <td className="p-3.5 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

