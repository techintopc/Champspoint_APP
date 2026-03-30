import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Save, 
  Shield, 
  Bell,
  CreditCard,
  Smartphone,
  Timer,
  CheckCircle2,
  AlertCircle,
  User,
  Camera,
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CompanyProfile, UserProfile } from '../types';
import { cn } from '../lib/utils';

const profileSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  website: z.string().url('Invalid website URL'),
  taxId: z.string().optional(),
  logoUrl: z.string().optional(),
  currency: z.string().min(1),
  defaultTaxRate: z.number().min(0).max(100),
  invoicePrefix: z.string().min(1),
  whatsappEnabled: z.boolean(),
  whatsappMessageTemplate: z.string().min(1),
  notifications: z.object({
    emailInvoices: z.boolean(),
    whatsappInvoices: z.boolean(),
    paymentReminders: z.boolean(),
    newLeadAlerts: z.boolean(),
  }),
  security: z.object({
    twoFactorEnabled: z.boolean(),
    sessionTimeout: z.number(),
  }),
});

const userProfileSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  photoURL: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type UserProfileFormData = z.infer<typeof userProfileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface SettingsProps {
  profile: CompanyProfile;
  userProfile: UserProfile | null;
  onUpdateProfile: (data: Partial<CompanyProfile>) => void;
  onUpdateUserProfile: (data: Partial<UserProfile>) => void;
  onUpdatePassword: (password: string) => void;
}

type SettingsTab = 'profile' | 'user-profile' | 'notifications' | 'security' | 'billing';

export default function Settings({ 
  profile, 
  userProfile, 
  onUpdateProfile, 
  onUpdateUserProfile,
  onUpdatePassword 
}: SettingsProps) {
  const [activeSettingsTab, setActiveSettingsTab] = React.useState<SettingsTab>('user-profile');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });

  const { 
    register: registerUser, 
    handleSubmit: handleSubmitUser, 
    formState: { errors: userErrors } 
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      photoURL: userProfile?.photoURL || '',
      phoneNumber: userProfile?.phoneNumber || '',
    }
  });

  const { 
    register: registerPass, 
    handleSubmit: handleSubmitPass, 
    formState: { errors: passErrors },
    reset: resetPass
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleFormSubmit = (data: ProfileFormData) => {
    onUpdateProfile(data);
  };

  const handleUserFormSubmit = (data: UserProfileFormData) => {
    onUpdateUserProfile(data);
  };

  const handlePassFormSubmit = (data: PasswordFormData) => {
    onUpdatePassword(data.password);
    resetPass();
    alert('Password updated successfully');
  };

  const navItems = [
    { id: 'user-profile', label: 'My Profile', icon: User },
    { id: 'profile', label: 'Company Profile', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your profile, company information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSettingsTab(item.id as SettingsTab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                activeSettingsTab === item.id 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {activeSettingsTab === 'user-profile' && (
            <div className="space-y-8">
              <form onSubmit={handleSubmitUser(handleUserFormSubmit)} className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">Personal Information</h3>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
                  >
                    <Save size={18} />
                    Update Profile
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={48} className="text-slate-300" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        {...registerUser('displayName')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                      {userErrors.displayName && <p className="text-xs text-rose-500 font-medium">{userErrors.displayName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Profile Picture URL</label>
                      <input 
                        {...registerUser('photoURL')}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Phone Number</label>
                      <input 
                        {...registerUser('phoneNumber')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <form onSubmit={handleSubmitPass(handlePassFormSubmit)} className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-lg">Change Password</h3>
                  </div>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all duration-200 active:scale-95"
                  >
                    Update Password
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Password</label>
                    <input 
                      type="password"
                      {...registerPass('password')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    {passErrors.password && <p className="text-xs text-rose-500 font-medium">{passErrors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                    <input 
                      type="password"
                      {...registerPass('confirmPassword')}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    {passErrors.confirmPassword && <p className="text-xs text-rose-500 font-medium">{passErrors.confirmPassword.message}</p>}
                  </div>
                </div>
              </form>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {activeSettingsTab === 'profile' && (
              <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">Company Information</h3>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon size={48} className="text-slate-300" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-bold text-slate-700">Company Logo URL</label>
                    <input 
                      {...register('logoUrl')}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    <p className="text-xs text-slate-400">Provide a URL for your company logo to appear on invoices.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        {...register('name')}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tax ID / VAT Number</label>
                    <input 
                      {...register('taxId')}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email"
                        {...register('email')}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        {...register('phone')}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        {...register('website')}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    {errors.website && <p className="text-xs text-rose-500 font-medium">{errors.website.message}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Business Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                      <textarea 
                        {...register('address')}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    {errors.address && <p className="text-xs text-rose-500 font-medium">{errors.address.message}</p>}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg mb-6">Invoice Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Default Currency (Symbol or Code)</label>
                      <input 
                        {...register('currency')}
                        placeholder="e.g. USD, $, ₹, EUR"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                      <p className="text-xs text-slate-400">This will be used for formatting all monetary values.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Default Tax Rate (%)</label>
                      <input 
                        type="number"
                        {...register('defaultTaxRate', { valueAsNumber: true })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Invoice Prefix</label>
                      <input 
                        {...register('invoicePrefix')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg mb-6">WhatsApp Integration</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">Enable WhatsApp Sharing</p>
                        <p className="text-sm text-slate-500">Allow sending invoice summaries directly to clients via WhatsApp.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" {...register('whatsappEnabled')} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Message Template</label>
                      <textarea 
                        {...register('whatsappMessageTemplate')}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        placeholder="Use {clientName}, {invoiceNumber}, {total}, {dueDate}, {companyName} as placeholders"
                      />
                      <p className="text-xs text-slate-400">Available placeholders: {'{clientName}'}, {'{invoiceNumber}'}, {'{total}'}, {'{dueDate}'}, {'{companyName}'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'notifications' && (
              <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">Notification Preferences</h3>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Email Invoices</p>
                        <p className="text-xs text-slate-500">Send PDF invoices to clients via email automatically.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('notifications.emailInvoices')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">WhatsApp Invoices</p>
                        <p className="text-xs text-slate-500">Send invoice links to clients via WhatsApp automatically.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('notifications.whatsappInvoices')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Timer size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Payment Reminders</p>
                        <p className="text-xs text-slate-500">Notify clients when invoices are overdue.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('notifications.paymentReminders')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">New Lead Alerts</p>
                        <p className="text-xs text-slate-500">Get notified when a new lead is captured.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('notifications.newLeadAlerts')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'security' && (
              <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">Security Settings</h3>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('security.twoFactorEnabled')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Session Timeout (Minutes)</label>
                    <input 
                      type="number"
                      {...register('security.sessionTimeout', { valueAsNumber: true })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                    <p className="text-xs text-slate-400">Automatically log out after inactivity.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'billing' && (
              <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">Billing & Subscription</h3>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                        {profile.billing.plan} Plan
                      </span>
                      <span className="text-indigo-100 text-sm font-medium capitalize">
                        Status: {profile.billing.status}
                      </span>
                    </div>
                    <h4 className="text-3xl font-black mb-1">Professional</h4>
                    <p className="text-indigo-100 text-sm mb-6">Billed annually • Next renewal: {format(profile.billing.currentPeriodEnd, 'MMM dd, yyyy')}</p>
                    <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                      Manage Subscription
                    </button>
                  </div>
                  <CreditCard className="absolute -right-4 -bottom-4 text-white opacity-10" size={140} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Unlimited Invoices',
                      'Lead Management',
                      'Team Collaboration',
                      'Audit Trails',
                      'Custom Branding',
                      'Priority Support'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-indigo-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {activeSettingsTab === 'profile' && (
            <div className="mt-8 bg-rose-50 p-8 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-rose-900 text-lg mb-2">Danger Zone</h3>
              <p className="text-sm text-rose-700 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-6 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
