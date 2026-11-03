import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';
import { Role } from '../types';

interface TopNavProps {
  userRole: Role;
  onCreateJobCardClick: () => void;
  onSearch: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  userRole,
  onCreateJobCardClick,
  onSearch,
}) => {
  const [query, setQuery] = React.useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'Admin User';
      case 'SERVICE_ADVISOR': return 'Rohan (Advisor)';
      case 'MECHANIC': return 'Vikram (Mechanic)';
      case 'STORE_MANAGER': return 'Ganesh (Store)';
      case 'ACCOUNTANT': return 'Pooja (Accountant)';
      case 'RECEPTIONIST': return 'Front Desk';
      case 'CUSTOMER': return 'Rajesh Kumar (Customer)';
      default: return 'User';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{getGreeting()}, {getRoleDisplayName(userRole)}</span>
            <span className="text-amber-500">👋</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Welcome back. Here's what's happening today in your workshop.
          </p>
        </div>

        {/* Search, Action & Profile */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search jobs, customers, invoices..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-slate-700"
            />
          </div>

          {/* Create Job Card Action Button */}
          <button
            onClick={onCreateJobCardClick}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-full shadow-sm shadow-purple-300 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Job Card</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-purple-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-purple-100 cursor-pointer shadow-sm">
            {userRole === 'ADMIN' ? 'AD' : userRole.substring(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};

