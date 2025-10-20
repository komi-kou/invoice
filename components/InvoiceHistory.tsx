'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { storage } from '@/lib/storage';
import { FileText, Download, Trash2, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface InvoiceHistoryProps {
  onLoadInvoice: (data: InvoiceData) => void;
  darkMode?: boolean;
}

export default function InvoiceHistory({ onLoadInvoice, darkMode }: InvoiceHistoryProps) {
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<InvoiceData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const filtered = history.filter(invoice => 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.issuer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  const loadHistory = () => {
    const savedHistory = storage.getInvoiceHistory();
    setHistory(savedHistory);
    setFilteredHistory(savedHistory);
  };

  const exportToCSV = () => {
    const headers = ['請求書番号', '発行日', '請求先', '金額', '税額', '合計金額'];
    const csvData = [
      headers,
      ...filteredHistory.map(invoice => [
        invoice.invoiceNumber,
        invoice.issueDate,
        invoice.client.companyName,
        invoice.subtotal,
        invoice.taxAmount,
        invoice.totalAmount
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFromHistory = (index: number) => {
    if (confirm('この請求書を履歴から削除しますか？')) {
      const updatedHistory = history.filter((_, i) => i !== index);
      localStorage.setItem('invoice_history', JSON.stringify(updatedHistory));
      loadHistory();
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-xl`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          請求書履歴
        </h2>
        <button
          onClick={exportToCSV}
          disabled={filteredHistory.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          CSVエクスポート
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="請求書番号や会社名で検索..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm ? '検索結果がありません' : '履歴はまだありません'}
          </div>
        ) : (
          filteredHistory.map((invoice, index) => (
            <div
              key={`${invoice.invoiceNumber}-${index}`}
              className={`p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {format(new Date(invoice.issueDate), 'yyyy年MM月dd日', { locale: ja })}
                      </span>
                    </div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>請求先: {invoice.client.companyName}</div>
                    <div className="mt-1">
                      金額: <span className="font-semibold">¥{invoice.totalAmount.toLocaleString()}</span>
                      <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        (税込)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadInvoice(invoice);
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    読込
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFromHistory(index);
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className={`mt-4 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {filteredHistory.length}件の請求書
        </div>
      )}
    </div>
  );
}