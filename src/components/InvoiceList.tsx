import React from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Download, 
  Send, 
  Trash2, 
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  MessageCircle
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client, CompanyProfile } from '../types';
import { formatCurrency, cn, generateWhatsAppLink } from '../lib/utils';
import { format } from 'date-fns';

interface InvoiceListProps {
  invoices: Invoice[];
  clients: Client[];
  profile: CompanyProfile;
  onNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

export default function InvoiceList({ 
  invoices, 
  clients,
  profile,
  onNewInvoice, 
  onViewInvoice, 
  onDeleteInvoice, 
  onUpdateStatus,
  onDownloadPDF
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<InvoiceStatus | 'all'>('all');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleWhatsAppShare = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client || !client.phone) {
      alert('Client phone number not found. Please add a phone number to the client profile.');
      return;
    }

    // Trigger PDF download first
    onDownloadPDF(invoice);

    const link = generateWhatsAppLink(
      client.phone,
      profile.whatsappMessageTemplate + "\n\n(I have also downloaded the PDF invoice to my device, which I will now attach and send to you.)",
      {
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        total: formatCurrency(invoice.total, profile.currency),
        dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
        companyName: profile.name
      }
    );

    window.open(link, '_blank');
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return <CheckCircle2 size={16} className="text-emerald-500" />;
      case InvoiceStatus.SENT: return <Send size={16} className="text-indigo-500" />;
      case InvoiceStatus.OVERDUE: return <AlertCircle size={16} className="text-rose-500" />;
      case InvoiceStatus.CANCELLED: return <XCircle size={16} className="text-slate-400" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case InvoiceStatus.SENT: return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case InvoiceStatus.OVERDUE: return "bg-rose-50 text-rose-700 border-rose-100";
      case InvoiceStatus.CANCELLED: return "bg-slate-50 text-slate-700 border-slate-100";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
          <p className="text-slate-500">Manage and track your client billings.</p>
        </div>
        <button 
          onClick={onNewInvoice}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by client or invoice number..." 
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
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            {Object.values(InvoiceStatus).map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{invoice.clientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-900">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(invoice.total, profile.currency)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                      getStatusColor(invoice.status)
                    )}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onViewInvoice(invoice)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onDownloadPDF(invoice)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      {profile.whatsappEnabled && (
                        <button 
                          onClick={() => handleWhatsAppShare(invoice)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Share via WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteInvoice(invoice.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No invoices found</h3>
                      <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
                      <button 
                        onClick={onNewInvoice}
                        className="mt-6 text-indigo-600 font-bold hover:underline"
                      >
                        Create your first invoice
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
