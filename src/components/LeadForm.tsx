import React from 'react';
import { 
  Plus, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ChevronLeft,
  DollarSign,
  Tag,
  MessageSquare
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lead, LeadStatus, CompanyProfile } from '../types';
import { cn } from '../lib/utils';

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.nativeEnum(LeadStatus),
  value: z.number().min(0).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  profile: CompanyProfile;
  onSubmit: (data: Partial<Lead>) => void;
  onCancel: () => void;
  initialData?: Lead;
}

export default function LeadForm({ profile, onSubmit, onCancel, initialData }: LeadFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      company: initialData.company,
      email: initialData.email,
      phone: initialData.phone,
      status: initialData.status,
      value: initialData.value,
      source: initialData.source,
      notes: initialData.notes,
    } : {
      status: LeadStatus.NEW,
    }
  });

  const handleFormSubmit = (data: LeadFormData) => {
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
              {initialData ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            <p className="text-slate-500">
              {initialData ? 'Update lead details.' : 'Capture a new potential customer.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                {...register('name')}
                placeholder="Lead's name"
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                  errors.name ? "border-rose-300" : "border-slate-200"
                )}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Company (Optional)</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                {...register('company')}
                placeholder="Company name"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email"
                {...register('email')}
                placeholder="email@example.com"
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                  errors.email ? "border-rose-300" : "border-slate-200"
                )}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select 
              {...register('status')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            >
              {Object.values(LeadStatus).map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Estimated Value ({profile.currency})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {profile.currency === 'USD' ? '$' : profile.currency === 'EUR' ? '€' : profile.currency === 'GBP' ? '£' : profile.currency === 'INR' ? '₹' : profile.currency}
              </span>
              <input 
                type="number"
                step="0.01"
                {...register('value', { valueAsNumber: true })}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Lead Source (Optional)</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              {...register('source')}
              placeholder="e.g. Website, Referral, LinkedIn"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={20} />
            <textarea 
              {...register('notes')}
              rows={3}
              placeholder="Additional details about this lead..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
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
            {initialData ? 'Update Lead' : 'Save Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
