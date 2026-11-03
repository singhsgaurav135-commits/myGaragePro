import React, { useState } from 'react';
import {
  Clock,
  User,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Wrench,
  Search
} from 'lucide-react';
import { JobCard, JobStatus } from '../types';
import { api } from '../api';

interface JobBoardKanbanViewProps {
  jobCards: JobCard[];
  onSelectJobCard: (jobCard: JobCard) => void;
  onRefresh: () => void;
  onCreateJobCard: () => void;
}

const STAGES: { key: string; label: string; bg: string; border: string; badge: string; statuses: JobStatus[] }[] = [
  { key: 'RECEIVED', label: '1. Inward / Received', bg: 'bg-purple-50/60', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', statuses: ['RECEIVED'] },
  { key: 'INSPECTION', label: '2. Inspection', bg: 'bg-blue-50/60', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', statuses: ['INSPECTION'] },
  { key: 'ESTIMATION', label: '3. Quote & Approval', bg: 'bg-amber-50/60', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', statuses: ['ESTIMATION', 'PENDING_APPROVAL', 'APPROVED'] },
  { key: 'IN_PROGRESS', label: '4. Service & Repairs', bg: 'bg-sky-50/60', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', statuses: ['IN_PROGRESS'] },
  { key: 'WAITING_PARTS', label: '5. Waiting Parts', bg: 'bg-rose-50/60', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', statuses: ['WAITING_PARTS'] },
  { key: 'QUALITY_CHECK', label: '6. Quality Check', bg: 'bg-indigo-50/60', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', statuses: ['QUALITY_CHECK'] },
  { key: 'COMPLETED', label: '7. Ready for Delivery', bg: 'bg-emerald-50/60', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', statuses: ['COMPLETED'] },
  { key: 'DELIVERED', label: '8. Delivered', bg: 'bg-slate-100/60', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700', statuses: ['DELIVERED'] },
];

export const JobBoardKanbanView: React.FC<JobBoardKanbanViewProps> = ({
  jobCards,
  onSelectJobCard,
  onRefresh,
  onCreateJobCard,
}) => {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const handleQuickAdvance = async (e: React.MouseEvent, job: JobCard, nextStatus: JobStatus) => {
    e.stopPropagation();
    try {
      await api.updateJobStatus(job.id, nextStatus, `Advanced to ${nextStatus}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredJobs = jobCards.filter((j) => {
    const matchesSearch =
      j.jobCardNumber.toLowerCase().includes(filterSearch.toLowerCase()) ||
      j.vehicle?.registrationNumber?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      j.customer?.name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      j.vehicle?.model?.toLowerCase().includes(filterSearch.toLowerCase());

    const matchesPriority = filterPriority === 'ALL' || j.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Board & Workflow Pipeline</h2>
          <p className="text-xs text-slate-500">Track and manage every vehicle journey from Gate Inward to Delivery</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Filter by vehicle or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Priority</option>
            <option value="NORMAL">Normal</option>
          </select>

          <button
            onClick={onCreateJobCard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[calc(100vh-220px)]">
        {STAGES.map((stage, idx) => {
          const stageJobs = filteredJobs.filter((j) => stage.statuses.includes(j.status));
          const nextStage = STAGES[idx + 1];

          return (
            <div
              key={stage.key}
              className={`w-72 shrink-0 rounded-2xl border ${stage.border} ${stage.bg} flex flex-col max-h-[calc(100vh-230px)] shadow-sm`}
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between bg-white/70 rounded-t-2xl">
                <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                  {stageJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {stageJobs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p>No jobs in this stage</p>
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => onSelectJobCard(job)}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group relative"
                    >
                      {/* Priority Tag & JC Number */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {job.jobCardNumber}
                        </span>
                        {job.priority === 'URGENT' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Vehicle & Customer */}
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-600 transition-colors">
                        {job.vehicle?.make} {job.vehicle?.model}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 font-mono">
                        {job.vehicle?.registrationNumber}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-600 font-medium line-clamp-1">
                        {job.serviceType}
                      </div>

                      {/* Cost estimate & Tasks */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[80px]">{job.customer?.name}</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{(job.actualCost || job.estimatedCost || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Quick Advance button */}
                      {nextStage && (
                        <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                          <button
                            onClick={(e) => handleQuickAdvance(e, job, nextStage.statuses[0])}
                            title={`Advance to ${nextStage.label}`}
                            className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <span>Move Next</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

