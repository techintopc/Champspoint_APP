import React from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  MoreVertical,
  ExternalLink,
  Users
} from 'lucide-react';
import { Client } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ClientListProps {
  clients: Client[];
  onNewClient: () => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientList({ clients, onNewClient, onDeleteClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
          <p className="text-slate-500">Manage your customer database and relationships.</p>
        </div>
        <button 
          onClick={onNewClient}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          Add Client
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 group relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">
                {client.name[0].toUpperCase()}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onDeleteClient(client.id)}
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <Mail size={14} />
                  <span className="text-sm font-medium">{client.email}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                {client.phone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} />
                    <span className="text-xs font-medium">{client.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="text-xs font-medium line-clamp-2">{client.address}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Added {format(client.createdAt, 'MMM yyyy')}
                </span>
                <button className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1">
                  View History
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No clients found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Start building your client list to generate invoices.</p>
              <button 
                onClick={onNewClient}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Add your first client
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
