import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const monthlyRevenue = [
    { month: 'Jun', revenue: 420000, profit: 180000 },
    { month: 'Jul', revenue: 490000, profit: 210000 },
    { month: 'Aug', revenue: 530000, profit: 235000 },
    { month: 'Sep', revenue: 610000, profit: 275000 },
    { month: 'Oct', revenue: 680000, profit: 310000 },
    { month: 'Nov', revenue: 745000, profit: 345000 },
  ];

  const serviceDistribution = [
    { name: 'Periodic Service', value: 45, color: '#8b5cf6' },
    { name: 'Brake & Suspension', value: 25, color: '#3b82f6' },
    { name: 'AC & Electrical', value: 18, color: '#10b981' },
    { name: 'Major Engine Work', value: 12, color: '#f59e0b' },
  ];

  const topParts = [
    { name: 'Castrol 5W-30 Synthetic', qty: 142, revenue: 312400 },
    { name: 'Bosch Oil Filter', qty: 118, revenue: 53100 },
    { name: 'Brembo Brake Pads', qty: 64, revenue: 182400 },
    { name: 'Cabin Air Filter', qty: 58, revenue: 37700 },
    { name: 'Amaron 12V 45Ah Battery', qty: 32, revenue: 179200 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports & Workshop Analytics</h2>
        <p className="text-xs text-slate-500">Executive financial metrics, labor efficiency and inventory consumption trends</p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Monthly Gross Turnover</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">₹7,45,000</div>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">+16.8% MoM growth</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Net Operating Margin</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">46.3%</div>
          <span className="text-xs font-semibold text-purple-600 mt-1 block">Industry benchmark: 38%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Bay Utilization Rate</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">92.4%</div>
          <span className="text-xs font-semibold text-blue-600 mt-1 block">6 Bays active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Customer Satisfaction (CSAT)</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">4.85 / 5.0</div>
          <span className="text-xs font-semibold text-amber-600 mt-1 block">Based on 148 ratings</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Revenue Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Monthly Revenue vs Net Margin (₹)</h3>
            <span className="text-xs text-slate-500">Last 6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Turnover" />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Job Type Distribution</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {serviceDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-700 font-medium">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Consumed Spare Parts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Top Moving Spare Parts by Sales Volume</h3>
          <span className="text-xs text-slate-500">Fast moving inventory</span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3.5">Spare Part Description</th>
              <th className="p-3.5 text-center">Units Consumed</th>
              <th className="p-3.5 text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topParts.map((tp, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-3.5 font-bold text-slate-900">{tp.name}</td>
                <td className="p-3.5 text-center font-semibold text-purple-700">{tp.qty} units</td>
                <td className="p-3.5 text-right font-bold text-slate-900">₹{tp.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

