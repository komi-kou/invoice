// テストデータを生成してLocalStorageに保存するスクリプト
// ブラウザのコンソールで実行してください

const testInvoiceData = [
  {
    invoiceNumber: 'INV-2025-001',
    issueDate: '2025-09-01',
    dueDate: '2025-09-30',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      email: 'info@sample.co.jp',
      registrationNumber: 'T1234567890123',
    },
    client: {
      companyName: '株式会社テスト',
      department: '購買部',
      contactPerson: '山田太郎',
      postalCode: '105-0001',
      address: '東京都港区虎ノ門1-1-1',
    },
    items: [
      {
        id: '1',
        description: 'Webサイト制作',
        quantity: 1,
        unitPrice: 500000,
        amount: 500000,
      },
      {
        id: '2',
        description: 'デザイン費用',
        quantity: 1,
        unitPrice: 200000,
        amount: 200000,
      },
    ],
    subtotal: 700000,
    taxRate: 10,
    taxAmount: 70000,
    totalAmount: 770000,
    notes: 'お振込手数料はご負担ください。',
    paymentTerms: '請求書発行日より30日以内',
    bankAccount: {
      bankName: 'みずほ銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'カ）サンプル',
    },
  },
  {
    invoiceNumber: 'INV-2025-002',
    issueDate: '2025-09-05',
    dueDate: '2025-10-05',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      email: 'info@sample.co.jp',
      registrationNumber: 'T1234567890123',
    },
    client: {
      companyName: 'ABC商事株式会社',
      department: '営業部',
      contactPerson: '鈴木花子',
      postalCode: '150-0001',
      address: '東京都渋谷区渋谷1-1-1',
    },
    items: [
      {
        id: '1',
        description: 'コンサルティング料',
        quantity: 20,
        unitPrice: 15000,
        amount: 300000,
      },
    ],
    subtotal: 300000,
    taxRate: 10,
    taxAmount: 30000,
    totalAmount: 330000,
    notes: '',
    paymentTerms: '請求書発行日より30日以内',
    bankAccount: {
      bankName: 'みずほ銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'カ）サンプル',
    },
  },
  {
    invoiceNumber: 'INV-2025-003',
    issueDate: '2025-09-10',
    dueDate: '2025-10-10',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      email: 'info@sample.co.jp',
      registrationNumber: 'T1234567890123',
    },
    client: {
      companyName: 'XYZ工業株式会社',
      department: '製造部',
      contactPerson: '佐藤次郎',
      postalCode: '231-0001',
      address: '神奈川県横浜市中区1-1-1',
    },
    items: [
      {
        id: '1',
        description: 'システム開発費',
        quantity: 1,
        unitPrice: 1200000,
        amount: 1200000,
      },
      {
        id: '2',
        description: '保守費用（年間）',
        quantity: 1,
        unitPrice: 240000,
        amount: 240000,
      },
    ],
    subtotal: 1440000,
    taxRate: 10,
    taxAmount: 144000,
    totalAmount: 1584000,
    notes: '',
    paymentTerms: '請求書発行日より45日以内',
    bankAccount: {
      bankName: 'みずほ銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'カ）サンプル',
    },
  },
];

const testReceiptData = [
  {
    receiptNumber: 'R202509-001',
    issueDate: '2025-09-03',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      registrationNumber: 'T1234567890123',
      sealImage: '',
    },
    recipient: '株式会社テスト',
    amount: 110000,
    description: '商品代として',
    breakdown: {
      subtotal: 100000,
      taxRate: 10,
      taxAmount: 10000,
    },
    notes: '上記正に領収いたしました。',
  },
  {
    receiptNumber: 'R202509-002',
    issueDate: '2025-09-07',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      registrationNumber: 'T1234567890123',
      sealImage: '',
    },
    recipient: 'ABC商事株式会社',
    amount: 55000,
    description: 'サービス料として',
    breakdown: {
      subtotal: 50000,
      taxRate: 10,
      taxAmount: 5000,
    },
    notes: '上記正に領収いたしました。',
  },
  {
    receiptNumber: 'R202509-003',
    issueDate: '2025-09-12',
    issuer: {
      companyName: '株式会社サンプル',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      phone: '03-1234-5678',
      registrationNumber: 'T1234567890123',
      sealImage: '',
    },
    recipient: 'XYZ工業株式会社',
    amount: 220000,
    description: '機械部品代として',
    breakdown: {
      subtotal: 200000,
      taxRate: 10,
      taxAmount: 20000,
    },
    notes: '上記正に領収いたしました。',
  },
];

// 先月のデータも追加
const lastMonthInvoice = {
  invoiceNumber: 'INV-2025-801',
  issueDate: '2025-08-15',
  dueDate: '2025-09-15',
  issuer: {
    companyName: '株式会社サンプル',
    postalCode: '100-0001',
    address: '東京都千代田区千代田1-1-1',
    phone: '03-1234-5678',
    email: 'info@sample.co.jp',
    registrationNumber: 'T1234567890123',
  },
  client: {
    companyName: 'DEF企業',
    department: '総務部',
    contactPerson: '田中三郎',
    postalCode: '160-0001',
    address: '東京都新宿区新宿1-1-1',
  },
  items: [
    {
      id: '1',
      description: 'コンサルティング',
      quantity: 1,
      unitPrice: 800000,
      amount: 800000,
    },
  ],
  subtotal: 800000,
  taxRate: 10,
  taxAmount: 80000,
  totalAmount: 880000,
  notes: '',
  paymentTerms: '請求書発行日より30日以内',
  bankAccount: {
    bankName: 'みずほ銀行',
    branchName: '東京支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'カ）サンプル',
  },
};

const lastMonthReceipt = {
  receiptNumber: 'R202508-001',
  issueDate: '2025-08-20',
  issuer: {
    companyName: '株式会社サンプル',
    postalCode: '100-0001',
    address: '東京都千代田区千代田1-1-1',
    phone: '03-1234-5678',
    registrationNumber: 'T1234567890123',
    sealImage: '',
  },
  recipient: 'GHI商事',
  amount: 165000,
  description: '商品代として',
  breakdown: {
    subtotal: 150000,
    taxRate: 10,
    taxAmount: 15000,
  },
  notes: '上記正に領収いたしました。',
};

// LocalStorageにデータを保存
localStorage.setItem('invoice_history', JSON.stringify([...testInvoiceData, lastMonthInvoice]));
localStorage.setItem('receipt_history', JSON.stringify([...testReceiptData, lastMonthReceipt]));
localStorage.setItem('last_invoice_number', 'INV-2025-003');

console.log('テストデータを追加しました！');
console.log('請求書: 4件');
console.log('領収書: 4件');
console.log('ページをリロードしてダッシュボードを確認してください。');