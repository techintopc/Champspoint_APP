export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  teamId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  startDate: number;
  endDate: number;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  createdAt: number;
  updatedAt: number;
}

export interface TeamMember {
  uid: string;
  email: string;
  role: UserRole;
  joinedAt: number;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  memberRoles: Record<string, UserRole>;
  subscriptionId?: string;
  createdAt: number;
}

export interface Client {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  createdAt: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  teamId: string;
  userId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  teamId: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  merchant?: string;
  notes?: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  teamId: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'invoice' | 'expense' | 'client' | 'lead' | 'settings' | 'team' | 'profile';
  entityId?: string;
  details: string;
  timestamp: number;
}

export interface NotificationSettings {
  emailInvoices: boolean;
  whatsappInvoices: boolean;
  paymentReminders: boolean;
  newLeadAlerts: boolean;
}

export interface BillingSettings {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: number;
  subscriptionId?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: number;
  sessionTimeout: number; // in minutes
}

export interface CompanyProfile {
  name: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  taxId?: string;
  logoUrl?: string;
  currency: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  whatsappEnabled: boolean;
  whatsappMessageTemplate: string;
  notifications: NotificationSettings;
  billing: BillingSettings;
  security: SecuritySettings;
  teamId?: string;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  WON = 'won',
  LOST = 'lost'
}

export interface Lead {
  id: string;
  teamId: string;
  userId: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  value?: number;
  source?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
