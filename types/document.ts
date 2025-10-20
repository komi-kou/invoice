export type DocumentType = 'invoice' | 'receipt';

export interface ReceiptData {
  receiptNumber: string;
  issueDate: string;
  
  // 発行者情報
  issuer: {
    companyName: string;
    postalCode?: string;
    address?: string;
    phone?: string;
    registrationNumber?: string;
    sealImage?: string;
  };
  
  // 宛先
  recipient: string; // ○○様
  
  // 金額
  amount: number;
  
  // 但し書き
  description: string;
  
  // 内訳（任意）
  breakdown?: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
  };
  
  // 備考
  notes?: string;
}