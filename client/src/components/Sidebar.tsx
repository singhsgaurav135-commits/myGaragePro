import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Car,
  Package,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Calendar,
  Truck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  Layers,
  ClipboardList
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: Role;
  setUserRole: (role: Role) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
}) => {
  const [workshopOpen, setWorkshopOpen] = React.useState(true);
  const [financialsOpen, setFinancialsOpen] = React.useState(true);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 select-none shadow-sm z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">myGaragePro</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Main */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main</p>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                currentTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-300 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Workshop Operations */}
          <div>
            <div
              className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 cursor-pointer"
              onClick={() => setWorkshopOpen(!workshopOpen)}
            >
              <span>Workshop Operations</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${workshopOpen ? 'rotate-180' : ''}`} />
            </div>

            {workshopOpen && (
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => setCurrentTab('jobcards')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'jobcards'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-purple-500" />
                  <span>Job Cards (Kanban)</span>
                </button>

                <button
                  onClick={() => setCurrentTab('inward')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'inward'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-500" />
                  <span>Gate Inward Entry</span>
                </button>

                <button
                  onClick={() => setCurrentTab('appointments')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'appointments'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-sky-500" />
                  <span>Appointments</span>
                </button>

                <button
                  onClick={() => setCurrentTab('customers')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'customers'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Customer Directory</span>
                </button>

                <button
                  onClick={() => setCurrentTab('vehicles')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'vehicles'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-4 h-4 text-blue-500" />
                  <span>Vehicle Registry</span>
                </button>

                <button
                  onClick={() => setCurrentTab('inventory')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'inventory'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Spare Parts & Stock</span>
                </button>

                <button
                  onClick={() => setCurrentTab('suppliers')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'suppliers'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4 text-teal-500" />
                  <span>Suppliers & Purchases</span>
                </button>
              </div>
            )}
          </div>

          {/* Financials */}
          <div>
            <div
              className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 cursor-pointer"
              onClick={() => setFinancialsOpen(!financialsOpen)}
            >
              <span>Financials</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${financialsOpen ? 'rotate-180' : ''}`} />
            </div>

            {financialsOpen && (
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => setCurrentTab('invoices')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'invoices'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Billing & Invoicing</span>
                </button>

                <button
                  onClick={() => setCurrentTab('expenses')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentTab === 'expenses'
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-rose-500" />
                  <span>Expenses Tracker</span>
                </button>
              </div>
            )}
          </div>

          {/* Analytics & System */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Analytics & Service</p>
            <div className="space-y-1">
              <button
                onClick={() => setCurrentTab('reports')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'reports'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Reports & Analytics</span>
              </button>

              <button
                onClick={() => setCurrentTab('reminders')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'reminders'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Service Reminders</span>
              </button>

              <button
                onClick={() => setCurrentTab('complaints')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'complaints'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>Complaints & Rework</span>
              </button>

              <button
                onClick={() => setCurrentTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === 'settings'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings & Audit Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher & Bottom Bar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="mb-2">
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Simulate Role View:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as Role)}
            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ADMIN">Admin User</option>
            <option value="SERVICE_ADVISOR">Service Advisor</option>
            <option value="MECHANIC">Mechanic</option>
            <option value="STORE_MANAGER">Store Manager</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="CUSTOMER">Customer Portal</option>
          </select>
        </div>

        <button
          onClick={() => alert('Logged out successfully.')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

