import React from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Receipt, 
  Tag, 
  Calendar as CalendarIcon,
  DollarSign,
  MoreVertical
} from 'lucide-react';
import { Expense, CompanyProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  profile: CompanyProfile;
  onNewExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseList({ expenses, profile, onNewExpense, onDeleteExpense }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');

  const categories = Array.from(new Set(expenses.map(e => e.category)));

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expense.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
          <p className="text-slate-500">Track your business spending and overheads.</p>
        </div>
        <button 
          onClick={onNewExpense}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by description or merchant..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 font-medium"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                <Receipt size={24} />
              </div>
              <button 
                onClick={() => onDeleteExpense(expense.id)}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{expense.description}</h3>
                <p className="text-xs text-slate-500 font-medium">{expense.merchant || 'General Merchant'}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(expense.amount, profile.currency)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date</span>
                  <span className="text-sm font-bold text-slate-600">{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Tag size={12} />
                  {expense.category}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No expenses found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Track your spending by adding your first expense.</p>
              <button 
                onClick={onNewExpense}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Add your first expense
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
