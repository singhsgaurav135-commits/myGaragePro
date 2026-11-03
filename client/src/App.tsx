import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { JobBoardKanbanView } from './components/JobBoardKanbanView';
import { JobCardDetailModal } from './components/JobCardDetailModal';
import { CreateJobCardModal } from './components/CreateJobCardModal';
import { CustomersVehiclesView } from './components/CustomersVehiclesView';
import { InventoryStockView } from './components/InventoryStockView';
import { BillingInvoicesView } from './components/BillingInvoicesView';
import { GateInwardView } from './components/GateInwardView';
import { OperationsPurchasesView } from './components/OperationsPurchasesView';
import { AppointmentsView } from './components/AppointmentsView';
import { ServiceRemindersView } from './components/ServiceRemindersView';
import { CustomerComplaintsView } from './components/CustomerComplaintsView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { SettingsAuditView } from './components/SettingsAuditView';
import { Role, JobCard } from './types';
import { api } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<Role>('ADMIN');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [selectedJobCardId, setSelectedJobCardId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadJobCards = async () => {
    try {
      const res = await api.getJobCards({ search: searchQuery });
      setJobCards(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobCards();
  }, [searchQuery]);

  const handleSelectJobCard = (job: JobCard) => {
    setSelectedJobCardId(job.id);
  };

  const handleCreatedSuccess = (newJob: JobCard) => {
    loadJobCards();
    setSelectedJobCardId(newJob.id);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Navigation */}
        <TopNav
          userRole={userRole}
          onCreateJobCardClick={() => setShowCreateModal(true)}
          onSearch={(q) => setSearchQuery(q)}
        />

        {/* Tab View Routing */}
        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectJobCard={handleSelectJobCard}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'jobcards' && (
            <JobBoardKanbanView
              jobCards={jobCards}
              onSelectJobCard={handleSelectJobCard}
              onRefresh={loadJobCards}
              onCreateJobCard={() => setShowCreateModal(true)}
            />
          )}

          {currentTab === 'inward' && <GateInwardView />}

          {currentTab === 'appointments' && <AppointmentsView />}

          {(currentTab === 'customers' || currentTab === 'vehicles') && (
            <CustomersVehiclesView />
          )}

          {currentTab === 'inventory' && <InventoryStockView />}

          {currentTab === 'suppliers' && <OperationsPurchasesView />}

          {currentTab === 'invoices' && <BillingInvoicesView />}

          {currentTab === 'expenses' && <OperationsPurchasesView />}

          {currentTab === 'reports' && <ReportsAnalyticsView />}

          {currentTab === 'reminders' && <ServiceRemindersView />}

          {currentTab === 'complaints' && <CustomerComplaintsView />}

          {currentTab === 'settings' && <SettingsAuditView />}
        </main>
      </div>

      {/* Full-featured Job Card Modal */}
      {selectedJobCardId && (
        <JobCardDetailModal
          jobCardId={selectedJobCardId}
          onClose={() => setSelectedJobCardId(null)}
          onRefresh={loadJobCards}
        />
      )}

      {/* Create Job Card Modal */}
      {showCreateModal && (
        <CreateJobCardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreatedSuccess}
        />
      )}
    </div>
  );
}

export default App;

