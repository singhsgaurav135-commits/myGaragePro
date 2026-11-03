import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  Car,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../api';
import { JobCard } from '../types';

interface DashboardViewProps {
  onSelectJobCard: (jobCard: JobCard) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectJobCard,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading GaragePro live dashboard...</p>
        </div>
      </div>
    );
  }

  const { liveJobCards } = data;

  return (
    <div className="p-8 space-y-8">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revenue Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 font-bold" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{Number(data.revenueToday).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data.revenueGrowth}</span>
            </p>
          </div>
        </div>

        {/* Vehicles In Service */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vehicles In Service</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{data.vehiclesInService}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              <span className="text-blue-600 font-semibold">{data.awaitingPickup}</span> awaiting pickup
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Payments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{Number(data.pendingPayments).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              <span className="text-amber-600 font-semibold">{data.pendingInvoicesCount}</span> invoices due
            </p>
          </div>
        </div>

        {/* Service Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Service Reminders</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{data.serviceReminders}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              <span className="text-purple-600 font-semibold">{data.dueThisWeek}</span> due this week
            </p>
          </div>
        </div>
      </div>

      {/* Main Center Area: Live Job Cards + Quick Insights Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Job Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Job Cards</h3>
              <p className="text-xs text-slate-500">Real-time status of vehicles across workshop bays</p>
            </div>
            <button
              onClick={() => onNavigateTab('jobcards')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 group"
            >
              <span>Full Job Board</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Kanban Horizontal Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-2">
            {/* Received Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <span className="text-xs font-bold text-slate-700">Received</span>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  {liveJobCards?.RECEIVED?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {liveJobCards?.RECEIVED?.map((job: JobCard) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJobCard(job)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                          {job.vehicle?.make} {job.vehicle?.model}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                          {job.vehicle?.registrationNumber}
                        </p>
                      </div>
                      {job.priority === 'URGENT' && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                          Urgent
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">{job.serviceType}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Recently</span>
                      </span>
                      <span className="font-semibold text-slate-700">{job.customer?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-slate-700">In Progress</span>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {liveJobCards?.IN_PROGRESS?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {liveJobCards?.IN_PROGRESS?.map((job: JobCard) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJobCard(job)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                          {job.vehicle?.make} {job.vehicle?.model}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                          {job.vehicle?.registrationNumber}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">{job.serviceType}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>In Bay</span>
                      </span>
                      <span className="font-semibold text-slate-700">{job.customer?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting Parts Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-bold text-slate-700">Waiting Parts</span>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  {liveJobCards?.WAITING_PARTS?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {liveJobCards?.WAITING_PARTS?.map((job: JobCard) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJobCard(job)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                          {job.vehicle?.make} {job.vehicle?.model}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                          {job.vehicle?.registrationNumber}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                        Hold
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">{job.serviceType}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span>Awaiting PO</span>
                      </span>
                      <span className="font-semibold text-slate-700">{job.customer?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Check / Ready Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-700">QC & Ready</span>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {((liveJobCards?.QUALITY_CHECK?.length || 0) + (liveJobCards?.COMPLETED?.length || 0))}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {[...(liveJobCards?.QUALITY_CHECK || []), ...(liveJobCards?.COMPLETED || [])].map((job: JobCard) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJobCard(job)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {job.vehicle?.make} {job.vehicle?.model}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                          {job.vehicle?.registrationNumber}
                        </p>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {job.status === 'QUALITY_CHECK' ? 'In QC' : 'Ready'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">{job.serviceType}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                      <span className="font-semibold text-slate-700">{job.customer?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Insights (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Quick Insights</h3>

          {/* Metric 1: Repeat Customers */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Repeat Customers</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{data.quickInsights.repeatCustomers}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {data.quickInsights.repeatCustomersChange}
              </span>
            </div>
          </div>

          {/* Metric 2: Avg Ticket Size */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Avg Ticket Size</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                ₹{Number(data.quickInsights.avgTicketSize).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {data.quickInsights.avgTicketSizeChange}
              </span>
            </div>
          </div>

          {/* Metric 3: Mechanic Productivity */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Mechanic Productivity</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{data.quickInsights.mechanicProductivity}</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                {data.quickInsights.mechanicProductivityNote}
              </span>
            </div>
          </div>

          {/* Weekly Revenue Curve */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Weekly Revenue</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#purpleGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mechanic Tasks Today */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Mechanic Jobs Today</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mechanicJobs} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: any) => [`${val} tasks`, 'Assigned']}
                  />
                  <Bar dataKey="totalTasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

