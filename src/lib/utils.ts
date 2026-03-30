import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  try {
    // Try standard formatting first
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.length === 3 ? currency.toUpperCase() : 'USD',
    }).format(amount).replace('USD', currency);
  } catch (e) {
    // Fallback for custom symbols
    return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function generateInvoiceNumber(count: number, prefix = 'INV') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
}

export function generateWhatsAppLink(
  phone: string, 
  message: string, 
  templateData: { 
    clientName: string; 
    invoiceNumber: string; 
    total: string; 
    dueDate: string; 
    companyName: string; 
  }
) {
  let finalMessage = message;
  Object.entries(templateData).forEach(([key, value]) => {
    finalMessage = finalMessage.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  // Clean phone number (remove non-digits)
  const cleanPhone = phone.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;
}
