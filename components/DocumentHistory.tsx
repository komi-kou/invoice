'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { ReceiptData } from '@/types/document';
import { storage } from '@/lib/storage';
import { FileText, Receipt, Download, Trash2, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DocumentHistoryProps {
  onLoadInvoice: (data: InvoiceData) => void;
  onLoadReceipt?: (data: ReceiptData) => void;
}

type DocumentItem = {
  type: 'invoice' | 'receipt';
  data: InvoiceData | ReceiptData;
  displayNumber: string;
  displayDate: string;
  displayClient: string;
  displayAmount: number;
};

export default function DocumentHistory({ onLoadInvoice, onLoadReceipt }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'receipt'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    let filtered = documents;
    
    // タイプフィルター
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }
    
    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.displayNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.displayClient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, documents, filterType]);

  const loadHistory = () => {
    const invoiceHistory = storage.getInvoiceHistory();
    const receiptHistory = JSON.parse(localStorage.getItem('receipt_history') || '[]') as ReceiptData[];
    
    const allDocuments: DocumentItem[] = [];
    
    // 請求書を追加
    invoiceHistory.forEach(invoice => {
      allDocuments.push({
        type: 'invoice',
        data: invoice,
        displayNumber: invoice.invoiceNumber,
        displayDate: invoice.issueDate,
        displayClient: invoice.client.companyName,
        displayAmount: invoice.totalAmount,
      });
    });
    
    // 領収書を追加
    receiptHistory.forEach(receipt => {
      allDocuments.push({
        type: 'receipt',
        data: receipt,
        displayNumber: receipt.receiptNumber,
        displayDate: receipt.issueDate,
        displayClient: receipt.recipient,
        displayAmount: receipt.amount,
      });
    });
    
    // 日付順にソート（新しい順）
    allDocuments.sort((a, b) => {
      return new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime();
    });
    
    setDocuments(allDocuments);
    setFilteredDocuments(allDocuments);
  };

  const exportToCSV = () => {
    const headers = ['種類', '番号', '発行日', '請求先/宛先', '金額'];
    const csvData = [
      headers,
      ...filteredDocuments.map(doc => [
        doc.type === 'invoice' ? '請求書' : '領収書',
        doc.displayNumber,
        doc.displayDate,
        doc.displayClient,
        doc.displayAmount
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `documents_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFromHistory = (index: number) => {
    const doc = filteredDocuments[index];
    if (confirm(`この${doc.type === 'invoice' ? '請求書' : '領収書'}を履歴から削除しますか？`)) {
      if (doc.type === 'invoice') {
        const invoiceHistory = storage.getInvoiceHistory();
        const updatedHistory = invoiceHistory.filter(inv => inv.invoiceNumber !== doc.displayNumber);
        localStorage.setItem('invoice_history', JSON.stringify(updatedHistory));
      } else {
        const receiptHistory = JSON.parse(localStorage.getItem('receipt_history') || '[]') as ReceiptData[];
        const updatedHistory = receiptHistory.filter(rec => rec.receiptNumber !== doc.displayNumber);
        localStorage.setItem('receipt_history', JSON.stringify(updatedHistory));
      }
      loadHistory();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          書類履歴
        </h2>
        <button
          onClick={exportToCSV}
          disabled={filteredDocuments.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
        >
          <Download size={18} />
          CSVエクスポート
        </button>
      </div>

      {/* フィルター */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              filterType === 'all'
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilterType('invoice')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              filterType === 'invoice'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-1" />
            請求書
          </button>
          <button
            onClick={() => setFilterType('receipt')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
              filterType === 'receipt'
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/30'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Receipt size={16} className="inline mr-1" />
            領収書
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="番号や会社名で検索..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? '検索結果がありません' : '履歴はまだありません'}
          </div>
        ) : (
          filteredDocuments.map((doc, index) => (
            <div
              key={`${doc.type}-${doc.displayNumber}-${index}`}
              className="p-4 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      {doc.type === 'invoice' ? (
                        <FileText size={20} className="text-blue-600" />
                      ) : (
                        <Receipt size={20} className="text-purple-600" />
                      )}
                      <span className="font-semibold text-gray-900">
                        {doc.displayNumber}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.type === 'invoice'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {doc.type === 'invoice' ? '請求書' : '領収書'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(doc.displayDate), 'yyyy年MM月dd日', { locale: ja })}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div>{doc.type === 'invoice' ? '請求先' : '宛先'}: {doc.displayClient}</div>
                    <div className="mt-1">
                      金額: <span className="font-semibold">¥{doc.displayAmount.toLocaleString()}</span>
                      <span className="ml-2 text-gray-500">
                        (税込)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (doc.type === 'invoice') {
                        onLoadInvoice(doc.data as InvoiceData);
                      } else if (onLoadReceipt) {
                        onLoadReceipt(doc.data as ReceiptData);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 font-semibold text-sm shadow-md"
                  >
                    読込
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromHistory(index);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 font-semibold text-sm shadow-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredDocuments.length > 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">
          {filteredDocuments.length}件の書類
        </div>
      )}
    </div>
  );
}