export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  
  // 発行者情報
  issuer: {
    companyName: string;
    postalCode: string;
    address: string;
    phone: string;
    email: string;
    registrationNumber?: string; // 登録番号（インボイス制度）
    sealImage?: string; // 印鑑画像（Base64）
  };
  
  // 請求先情報
  client: {
    companyName: string;
    department?: string;
    contactPerson?: string;
    postalCode: string;
    address: string;
  };
  
  // 明細
  items: InvoiceItem[];
  
  // 金額
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  
  // その他
  notes?: string;
  paymentTerms?: string;
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  data: Partial<InvoiceData>;
  createdAt: string;
  updatedAt: string;
}