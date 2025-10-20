'use client';

import { useState, useRef, lazy, Suspense } from 'react';
import { format } from 'date-fns';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import ReceiptForm from '@/components/ReceiptForm';
import ReceiptPreview from '@/components/ReceiptPreview';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const DocumentHistory = lazy(() => import('@/components/DocumentHistory'));
import { InvoiceData } from '@/types/invoice';
import { ReceiptData } from '@/types/document';
import { createPDF } from '@/lib/simple-pdf';
import { FileText, Download, History, PlusCircle, Receipt, FileCheck, BarChart3, Eye } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'invoice' | 'receipt' | 'history'>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'preview'>('form');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [historyData, setHistoryData] = useState<Partial<InvoiceData>>();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  const handleInvoiceSubmit = async (data: InvoiceData) => {
    setInvoiceData(data);
    setActiveSubTab('preview');
    
    setTimeout(async () => {
      try {
        const filename = `invoice_${data.invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        await createPDF('invoice-preview', filename);
      } catch (error) {
        alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
        console.error(error);
      }
    }, 500);
  };

  const handleReceiptSubmit = async (data: ReceiptData) => {
    setReceiptData(data);
    setActiveSubTab('preview');
    
    setTimeout(async () => {
      try {
        const filename = `receipt_${data.receiptNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        await createPDF('receipt-preview', filename);
      } catch (error) {
        alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
        console.error(error);
      }
    }, 500);
  };


  const handleLoadHistory = (data: InvoiceData) => {
    setInvoiceData(data);
    setHistoryData(data);
    setActiveSection('invoice');
    setActiveSubTab('form');
  };

  const handleLoadReceipt = (data: ReceiptData) => {
    setReceiptData(data);
    setActiveSection('receipt');
    setActiveSubTab('form');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                書類作成ツール
              </h1>
            </div>
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-semibold text-sm md:text-base ${
                  activeSection === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">ダッシュボード</span>
                <span className="sm:hidden">統計</span>
              </button>
              <button
                onClick={() => {
                  setActiveSection('invoice');
                  setActiveSubTab('form');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-semibold text-sm md:text-base ${
                  activeSection === 'invoice'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <FileCheck size={18} />
                請求書
              </button>
              <button
                onClick={() => {
                  setActiveSection('receipt');
                  setActiveSubTab('form');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-semibold text-sm md:text-base ${
                  activeSection === 'receipt'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <Receipt size={18} />
                領収書
              </button>
              <button
                onClick={() => setActiveSection('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-semibold text-sm md:text-base ${
                  activeSection === 'history'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <History size={18} />
                履歴
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div>
          {/* ダッシュボード */}
          {activeSection === 'dashboard' && (
            <Suspense fallback={
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            }>
              <Dashboard />
            </Suspense>
          )}
          
          {/* 請求書セクション */}
          {activeSection === 'invoice' && (
            <>
              {/* サブタブナビゲーション */}
              <div className="mb-6 flex gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                <button
                  onClick={() => setActiveSubTab('form')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold text-sm md:text-base ${
                    activeSubTab === 'form'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'bg-white/50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <PlusCircle size={18} />
                  作成
                </button>
                <button
                  onClick={() => setActiveSubTab('preview')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold text-sm md:text-base ${
                    activeSubTab === 'preview'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md'
                      : 'bg-white/50 text-slate-600 hover:bg-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!invoiceData}
                >
                  <Eye size={18} />
                  プレビュー
                </button>
              </div>

              {activeSubTab === 'form' && (
                <InvoiceForm 
                  onSubmit={handleInvoiceSubmit}
                  initialData={historyData}
                />
              )}
              {activeSubTab === 'preview' && invoiceData && (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      請求書プレビュー
                    </h2>
                    <button
                      onClick={async () => {
                        try {
                          const filename = `invoice_${invoiceData.invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
                          await createPDF('invoice-preview', filename);
                        } catch (error) {
                          alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-md shadow-emerald-500/25"
                    >
                      <Download size={20} />
                      PDFダウンロード
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-auto bg-white">
                    <InvoicePreview ref={invoicePreviewRef} data={invoiceData} />
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* 領収書セクション */}
          {activeSection === 'receipt' && (
            <>
              {/* サブタブナビゲーション */}
              <div className="mb-6 flex gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                <button
                  onClick={() => setActiveSubTab('form')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold text-sm md:text-base ${
                    activeSubTab === 'form'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'bg-white/50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <PlusCircle size={18} />
                  作成
                </button>
                <button
                  onClick={() => setActiveSubTab('preview')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-semibold text-sm md:text-base ${
                    activeSubTab === 'preview'
                      ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md'
                      : 'bg-white/50 text-slate-600 hover:bg-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!receiptData}
                >
                  <Eye size={18} />
                  プレビュー
                </button>
              </div>

              {activeSubTab === 'form' && (
                <ReceiptForm
                  onSubmit={handleReceiptSubmit}
                />
              )}
              {activeSubTab === 'preview' && receiptData && (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      領収書プレビュー
                    </h2>
                    <button
                      onClick={async () => {
                        try {
                          const filename = `receipt_${receiptData.receiptNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
                          await createPDF('receipt-preview', filename);
                        } catch (error) {
                          alert('PDF生成中にエラーが発生しました: ' + (error as Error).message);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-md shadow-emerald-500/25"
                    >
                      <Download size={20} />
                      PDFダウンロード
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-auto bg-white">
                    <ReceiptPreview ref={receiptPreviewRef} data={receiptData} />
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* 履歴セクション */}
          {activeSection === 'history' && (
            <Suspense fallback={
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            }>
              <DocumentHistory 
                onLoadInvoice={handleLoadHistory}
                onLoadReceipt={handleLoadReceipt}
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}