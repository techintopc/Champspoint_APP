import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Invoice, Expense, InvoiceStatus, CompanyProfile, Lead, LeadStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface DashboardProps {
  invoices: Invoice[];
  expenses: Expense[];
  leads: Lead[];
  profile: CompanyProfile;
}

export default function Dashboard({ invoices, expenses, leads, profile }: DashboardProps) {
  const totalRevenue = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const pendingInvoices = invoices.filter(inv => inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.OVERDUE);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const activeLeads = leads.filter(l => l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST).length;
  const wonLeadsValue = leads.filter(l => l.status === LeadStatus.WON).reduce((sum, l) => sum + (l.value || 0), 0);

  // Chart data for last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthName = format(date, 'MMM');
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const monthRevenue = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID && isWithinInterval(new Date(inv.issueDate), { start, end }))
      .reduce((sum, inv) => sum + inv.total, 0);

    const monthExpenses = expenses
      .filter(exp => isWithinInterval(new Date(exp.date), { start, end }))
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      name: monthName,
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses
    };
  });

  const stats = [
    { 
      label: 'Active Leads', 
      value: activeLeads.toString(), 
      icon: UserPlus, 
      color: 'bg-indigo-50 text-indigo-600',
      trend: `${leads.length} Total`,
      isPositive: true
    },
    { 
      label: 'Won Leads Value', 
      value: formatCurrency(wonLeadsValue, profile.currency), 
      icon: TrendingUp, 
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'Pipeline',
      isPositive: true
    },
    { 
      label: 'Total Expenses', 
      value: formatCurrency(totalExpenses, profile.currency), 
      icon: TrendingDown, 
      color: 'bg-rose-50 text-rose-600',
      trend: '+4.2%',
      isPositive: false
    },
    { 
      label: 'Pending Invoices', 
      value: formatCurrency(pendingAmount, profile.currency), 
      icon: Clock, 
      color: 'bg-amber-50 text-amber-600',
      trend: '-2.4%',
      isPositive: true
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm self-start">
          <button className="px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-lg">Last 6 Months</button>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Yearly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Revenue vs Expenses</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <span className="text-slate-600">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${profile.currency.length > 3 ? profile.currency : (profile.currency === 'USD' ? '$' : profile.currency === 'EUR' ? '€' : profile.currency === 'GBP' ? '£' : '₹')}${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#fb7185" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Recent Invoices</h3>
          <div className="space-y-5">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    invoice.status === InvoiceStatus.PAID ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                  )}>
                    {invoice.status === InvoiceStatus.PAID ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{invoice.clientName}</p>
                    <p className="text-xs text-slate-500">{invoice.invoiceNumber} • {format(new Date(invoice.issueDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(invoice.total, profile.currency)}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    invoice.status === InvoiceStatus.PAID ? "text-emerald-600" : "text-amber-600"
                  )}>{invoice.status}</p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm text-slate-500">No recent invoices</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            View All Invoices
          </button>
        </div>
      </div>
    </div>
  );
}
