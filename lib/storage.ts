import { InvoiceData, InvoiceTemplate } from '@/types/invoice';

const STORAGE_KEYS = {
  CURRENT_INVOICE: 'current_invoice',
  TEMPLATES: 'invoice_templates',
  INVOICE_HISTORY: 'invoice_history',
  LAST_INVOICE_NUMBER: 'last_invoice_number',
} as const;

export const storage = {
  // 現在の請求書データ
  getCurrentInvoice(): InvoiceData | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INVOICE);
    return data ? JSON.parse(data) : null;
  },
  
  saveCurrentInvoice(invoice: InvoiceData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_INVOICE, JSON.stringify(invoice));
  },
  
  clearCurrentInvoice(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INVOICE);
  },
  
  // テンプレート
  getTemplates(): InvoiceTemplate[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  },
  
  saveTemplate(template: InvoiceTemplate): void {
    if (typeof window === 'undefined') return;
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },
  
  deleteTemplate(id: string): void {
    if (typeof window === 'undefined') return;
    const templates = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },
  
  // 請求書履歴
  getInvoiceHistory(): InvoiceData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.INVOICE_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  
  addToHistory(invoice: InvoiceData): void {
    if (typeof window === 'undefined') return;
    const history = this.getInvoiceHistory();
    history.unshift(invoice);
    // 最新100件まで保存
    const trimmedHistory = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.INVOICE_HISTORY, JSON.stringify(trimmedHistory));
  },
  
  // 請求書番号
  getNextInvoiceNumber(): string {
    if (typeof window === 'undefined') return '';
    const lastNumber = localStorage.getItem(STORAGE_KEYS.LAST_INVOICE_NUMBER);
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    if (!lastNumber) {
      return `${currentYear}${currentMonth}-001`;
    }
    
    const [yearMonth, seq] = lastNumber.split('-');
    const currentYearMonth = `${currentYear}${currentMonth}`;
    
    if (yearMonth === currentYearMonth) {
      const nextSeq = String(parseInt(seq) + 1).padStart(3, '0');
      return `${currentYearMonth}-${nextSeq}`;
    } else {
      return `${currentYearMonth}-001`;
    }
  },
  
  updateLastInvoiceNumber(invoiceNumber: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LAST_INVOICE_NUMBER, invoiceNumber);
  },
};