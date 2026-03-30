import React from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  MoreVertical,
  Trash2,
  ExternalLink,
  Tag,
  Circle
} from 'lucide-react';
import { Lead, LeadStatus, CompanyProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

interface LeadListProps {
  leads: Lead[];
  profile: CompanyProfile;
  onNewLead: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const STATUS_COLORS = {
  [LeadStatus.NEW]: 'bg-blue-50 text-blue-600 border-blue-100',
  [LeadStatus.CONTACTED]: 'bg-amber-50 text-amber-600 border-amber-100',
  [LeadStatus.QUALIFIED]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  [LeadStatus.PROPOSAL]: 'bg-purple-50 text-purple-600 border-purple-100',
  [LeadStatus.WON]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [LeadStatus.LOST]: 'bg-rose-50 text-rose-600 border-rose-100',
};

export default function LeadList({ leads, profile, onNewLead, onEditLead, onDeleteLead }: LeadListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<LeadStatus | 'all'>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
          <p className="text-slate-500">Manage your potential customers and sales pipeline.</p>
        </div>
        <button 
          onClick={onNewLead}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          Add New Lead
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search leads by name, company, or email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            {Object.values(LeadStatus).map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{lead.name}</h3>
                  {lead.company && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Building2 size={12} />
                      {lead.company}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEditLead(lead)}
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  onClick={() => onDeleteLead(lead.id)}
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span className="truncate">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  STATUS_COLORS[lead.status]
                )}>
                  {lead.status}
                </div>
                {lead.value && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Value</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(lead.value, profile.currency)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Added {format(lead.createdAt, 'MMM d, yyyy')}
                </span>
                {lead.source && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <Tag size={10} />
                    {lead.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No leads found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Start growing your business by adding your first lead.</p>
              <button 
                onClick={onNewLead}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Add your first lead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
