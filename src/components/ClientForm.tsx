import React from 'react';
import { 
  Plus, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  ChevronLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client } from '../types';
import { cn } from '../lib/utils';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSubmit: (data: Partial<Client>) => void;
  onCancel: () => void;
  initialData?: Client;
}

export default function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      address: initialData.address,
      phone: initialData.phone,
    } : {}
  });

  const handleFormSubmit = (data: ClientFormData) => {
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
              {initialData ? 'Edit Client' : 'Add New Client'}
            </h2>
            <p className="text-slate-500">
              {initialData ? 'Update client information.' : 'Add a new client to your database.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Client Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              {...register('name')}
              placeholder="e.g. Acme Corp or John Doe"
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                errors.name ? "border-rose-300" : "border-slate-200"
              )}
            />
          </div>
          {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email"
                {...register('email')}
                placeholder="client@example.com"
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
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Billing Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
            <textarea 
              {...register('address')}
              rows={3}
              placeholder="Full billing address..."
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                errors.address ? "border-rose-300" : "border-slate-200"
              )}
            />
          </div>
          {errors.address && <p className="text-xs text-rose-500 font-medium">{errors.address.message}</p>}
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
            {initialData ? 'Update Client' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
