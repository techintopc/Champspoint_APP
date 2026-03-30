import React from 'react';
import { 
  Plus, 
  Save, 
  X, 
  Receipt, 
  Tag, 
  Calendar as CalendarIcon,
  DollarSign,
  ChevronLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Expense, CompanyProfile } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be at least 0.01'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  profile: CompanyProfile;
  onSubmit: (data: Partial<Expense>) => void;
  onCancel: () => void;
  initialData?: Expense;
}

const CATEGORIES = [
  'Software Subscription',
  'Hardware',
  'Office Supplies',
  'Travel',
  'Marketing',
  'Utilities',
  'Rent',
  'Salaries',
  'Other'
];

export default function ExpenseForm({ profile, onSubmit, onCancel, initialData }: ExpenseFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      description: initialData.description,
      amount: initialData.amount,
      category: initialData.category,
      date: initialData.date,
      merchant: initialData.merchant,
      notes: initialData.notes,
    } : {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Software Subscription',
    }
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {initialData ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-slate-500">
              {initialData ? 'Update your expense details.' : 'Log a new business expense.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Description</label>
          <div className="relative">
            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              {...register('description')}
              placeholder="What was this expense for?"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                errors.description ? "border-rose-300" : "border-slate-200"
              )}
            />
          </div>
          {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {getCurrencySymbol(profile.currency)}
              </span>
              <input 
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                  errors.amount ? "border-rose-300" : "border-slate-200"
                )}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="date"
                {...register('date')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            {errors.date && <p className="text-xs text-rose-500 font-medium">{errors.date.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select 
                {...register('category')}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-xs text-rose-500 font-medium">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Merchant (Optional)</label>
            <input 
              {...register('merchant')}
              placeholder="e.g. AWS, Apple, Starbucks"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
          <textarea 
            {...register('notes')}
            rows={3}
            placeholder="Additional details about this expense..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
          >
            <Save size={20} />
            {initialData ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
