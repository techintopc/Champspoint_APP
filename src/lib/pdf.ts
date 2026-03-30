import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, CompanyProfile, Client } from '../types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: Invoice, company: CompanyProfile, client?: Client) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - Company Branding
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, 20, 38);
  doc.text(`${company.email} | ${company.phone}`, 20, 44);
  if (company.website) doc.text(company.website, 20, 50);
  
  // Invoice Title & Number
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 35, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text(invoice.invoiceNumber, pageWidth - 20, 45, { align: 'right' });
  
  // Horizontal Line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(20, 60, pageWidth - 20, 60);
  
  // Bill To & Invoice Info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 75);
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(invoice.clientName, 20, 82);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  if (client?.address) {
    const splitAddress = doc.splitTextToSize(client.address, 80);
    doc.text(splitAddress, 20, 88);
  }
  if (client?.email) doc.text(client.email, 20, 105);
  
  // Invoice Details Box
  const detailsX = pageWidth - 80;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DATE ISSUED:', detailsX, 75);
  doc.text('DUE DATE:', detailsX, 85);
  doc.text('STATUS:', detailsX, 95);
  
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(invoice.issueDate), 'MMM d, yyyy'), detailsX + 35, 75);
  doc.text(format(new Date(invoice.dueDate), 'MMM d, yyyy'), detailsX + 35, 85);
  doc.text(invoice.status.toUpperCase(), detailsX + 35, 95);
  
  // Items Table
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice, company.currency),
    formatCurrency(item.quantity * item.unitPrice, company.currency)
  ]);
  
  autoTable(doc, {
    startY: 120,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 6
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const summaryX = pageWidth - 80;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`Tax (${invoice.taxRate}%):`, summaryX, finalY + 8);
  
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.subtotal, company.currency), pageWidth - 20, finalY, { align: 'right' });
  doc.text(formatCurrency(invoice.taxAmount, company.currency), pageWidth - 20, finalY + 8, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Total Amount:', summaryX, finalY + 20);
  doc.text(formatCurrency(invoice.total, company.currency), pageWidth - 20, finalY + 20, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 20, finalY + 40);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, finalY + 47);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
  doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
  
  // Save PDF
  doc.save(`${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`);
};
