'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import TemplateManager from '@/components/TemplateManager';
import InvoiceHistory from '@/components/InvoiceHistory';
import ReceiptForm from '@/components/ReceiptForm';
import ReceiptPreview from '@/components/ReceiptPreview';
import { InvoiceData } from '@/types/invoice';
import { ReceiptData, DocumentType } from '@/types/document';
import { generatePDF } from '@/lib/pdf-helper';
import { FileText, Download, Settings, History, PlusCircle, Moon, Sun, Receipt, FileCheck } from 'lucide-react';

export default function Home() {
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [templateData, setTemplateData] = useState<Partial<InvoiceData>>();
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'template' | 'history'>('form');
  const [darkMode, setDarkMode] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  const handleInvoiceSubmit = async (data: InvoiceData) => {
    setInvoiceData(data);
    setActiveTab('preview');
    
    setTimeout(async () => {
      try {
        const filename = `invoice_${data.invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        await generatePDF('invoice-preview', filename);
      } catch (error) {
        alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
        console.error(error);
      }
    }, 500);
  };

  const handleReceiptSubmit = async (data: ReceiptData) => {
    setReceiptData(data);
    setActiveTab('preview');
    
    setTimeout(async () => {
      try {
        const filename = `receipt_${data.receiptNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        await generatePDF('receipt-preview', filename);
      } catch (error) {
        alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
        console.error(error);
      }
    }, 500);
  };

  const handleLoadTemplate = (data: Partial<InvoiceData>) => {
    setTemplateData(data);
    setActiveTab('form');
  };

  const handleLoadHistory = (data: InvoiceData) => {
    setInvoiceData(data);
    setTemplateData(data);
    setActiveTab('form');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 backdrop-blur-sm'} shadow-lg border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  書類作成ツール
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Professional Document Generator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* ドキュメントタイプ選択 */}
              <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setDocumentType('invoice')}
                  className={`px-3 py-1 rounded transition-all ${
                    documentType === 'invoice'
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <FileCheck size={16} className="inline mr-1" />
                  請求書
                </button>
                <button
                  onClick={() => setDocumentType('receipt')}
                  className={`px-3 py-1 rounded transition-all ${
                    documentType === 'receipt'
                      ? darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <Receipt size={16} className="inline mr-1" />
                  領収書
                </button>
              </div>
              <nav className="flex gap-2">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'form'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  <PlusCircle size={18} />
                  作成
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                  disabled={!invoiceData}
                >
                  <FileText size={18} />
                  プレビュー
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  <History size={18} />
                  履歴
                </button>
                <button
                  onClick={() => setActiveTab('template')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'template'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                  }`}
                >
                  <Settings size={18} />
                  テンプレート
                </button>
              </nav>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {activeTab === 'form' && (
            <>
              {documentType === 'invoice' ? (
                <InvoiceForm 
                  onSubmit={handleInvoiceSubmit}
                  initialData={templateData}
                  darkMode={darkMode}
                />
              ) : (
                <ReceiptForm
                  onSubmit={handleReceiptSubmit}
                  darkMode={darkMode}
                />
              )}
            </>
          )}
          
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {documentType === 'invoice' && invoiceData && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-xl`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      請求書プレビュー
                    </h2>
                    <button
                      onClick={async () => {
                        if (invoicePreviewRef.current) {
                          try {
                            const filename = `invoice_${invoiceData.invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
                            await generatePDFFromElement(invoicePreviewRef.current, filename);
                          } catch (error) {
                            alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg transform hover:scale-105"
                    >
                      <Download size={20} />
                      PDFダウンロード
                    </button>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-auto bg-white">
                    <InvoicePreview ref={invoicePreviewRef} data={invoiceData} />
                  </div>
                </div>
              )}
              {documentType === 'receipt' && receiptData && (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-xl`}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      領収書プレビュー
                    </h2>
                    <button
                      onClick={async () => {
                        if (receiptPreviewRef.current) {
                          try {
                            const filename = `receipt_${receiptData.receiptNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
                            await generatePDFFromElement(receiptPreviewRef.current, filename);
                          } catch (error) {
                            alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg transform hover:scale-105"
                    >
                      <Download size={20} />
                      PDFダウンロード
                    </button>
                  </div>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-auto bg-white">
                    <ReceiptPreview ref={receiptPreviewRef} data={receiptData} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <InvoiceHistory 
              onLoadInvoice={handleLoadHistory}
              darkMode={darkMode}
            />
          )}
          
          {activeTab === 'template' && (
            <TemplateManager 
              onLoadTemplate={handleLoadTemplate}
              currentData={invoiceData || undefined}
              darkMode={darkMode}
            />
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}