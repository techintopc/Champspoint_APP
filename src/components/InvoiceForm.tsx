import React from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  Calendar, 
  User, 
  FileText,
  ChevronLeft,
  Clock
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Invoice, Client, InvoiceItem, InvoiceStatus, CompanyProfile } from '../types';
import { formatCurrency, cn, generateInvoiceNumber } from '../lib/utils';
import { format, addDays } from 'date-fns';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be at least 0'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  clients: Client[];
  profile: CompanyProfile;
  onSubmit: (data: Partial<Invoice>) => void;
  onCancel: () => void;
  initialData?: Invoice;
  invoiceCount: number;
}

export default function InvoiceForm({ clients, profile, onSubmit, onCancel, initialData, invoiceCount }: InvoiceFormProps) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData ? {
      clientId: initialData.clientId,
      issueDate: initialData.issueDate,
      dueDate: initialData.dueDate,
      items: initialData.items,
      taxRate: initialData.taxRate,
      notes: initialData.notes,
    } : {
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: profile.defaultTaxRate,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");

  const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * (watchedTaxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  const handleFormSubmit = (data: InvoiceFormData) => {
    const selectedClient = clients.find(c => c.id === data.clientId);
    
    const invoiceData: Partial<Invoice> = {
      ...data,
      items: data.items.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) })),
      clientName: selectedClient?.name || '',
      invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(invoiceCount, profile.invoicePrefix),
      subtotal,
      taxAmount,
      total,
      status: initialData?.status || InvoiceStatus.DRAFT,
    };
    
    onSubmit(invoiceData);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
              {initialData ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <p className="text-slate-500">
              {initialData ? `Editing ${initialData.invoiceNumber}` : 'Fill in the details to generate a professional invoice.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSubmit(handleFormSubmit)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
          >
            <Save size={20} />
            {initialData ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Client & Dates */}
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Client</label>
                <select 
                  {...register('clientId')}
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium",
                    errors.clientId ? "border-rose-300" : "border-slate-200"
                  )}
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-rose-500 font-medium">{errors.clientId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Issue Date</label>
                  <input 
                    type="date" 
                    {...register('issueDate')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Due Date</label>
                  <input 
                    type="date" 
                    {...register('dueDate')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                Invoice Items
              </h3>
              <button 
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-50/50 rounded-xl border border-slate-100 group">
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <input 
                      {...register(`items.${index}.description`)}
                      placeholder="Service or product description..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</label>
                    <input 
                      type="number"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        className="w-full pl-7 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1 pb-1">
                    <button 
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {errors.items && <p className="text-sm text-rose-500 font-medium">{errors.items.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
            <label className="text-sm font-bold text-slate-700">Notes / Terms</label>
            <textarea 
              {...register('notes')}
              rows={4}
              placeholder="Payment terms, bank details, or a thank you message..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl shadow-indigo-200 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calculator size={18} />
              Summary
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-indigo-800">
              <div className="flex justify-between text-indigo-200">
                <span>Subtotal</span>
                <span className="font-bold text-white">{formatCurrency(subtotal, profile.currency)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-indigo-200">
                  <span>Tax Rate (%)</span>
                  <input 
                    type="number"
                    {...register('taxRate', { valueAsNumber: true })}
                    className="w-20 bg-indigo-800 border-none rounded-lg px-2 py-1 text-right text-white font-bold focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="flex justify-between text-indigo-200">
                  <span>Tax Amount</span>
                  <span className="font-bold text-white">{formatCurrency(taxAmount, profile.currency)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-indigo-800 flex justify-between items-end">
                <span className="text-indigo-200 font-medium">Total Amount</span>
                <span className="text-3xl font-black">{formatCurrency(total, profile.currency)}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Clock size={16} />
              Pro Tip
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Invoices are automatically set to "Draft" status. You can mark them as "Sent" after downloading or emailing them to your client.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
