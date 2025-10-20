'use client';

import { useState, useRef } from 'react';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import TemplateManager from '@/components/TemplateManager';
import { InvoiceData } from '@/types/invoice';
import { generatePDF } from '@/lib/invoice-pdf';
import { FileText, Download, Settings } from 'lucide-react';

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [templateData, setTemplateData] = useState<Partial<InvoiceData>>();
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'template'>('form');
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (data: InvoiceData) => {
    setInvoiceData(data);
    setActiveTab('preview');
    
    // PDFを生成
    setTimeout(async () => {
      if (previewRef.current) {
        try {
          await generatePDF(previewRef.current, data);
        } catch (error) {
          alert('PDF生成中にエラーが発生しました');
          console.error(error);
        }
      }
    }, 100);
  };

  const handleLoadTemplate = (data: Partial<InvoiceData>) => {
    setTemplateData(data);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">請求書作成ツール</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                作成
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={!invoiceData}
              >
                プレビュー
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'template'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Settings size={20} className="inline mr-1" />
                テンプレート
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'form' && (
          <InvoiceForm 
            onSubmit={handleFormSubmit}
            initialData={templateData}
          />
        )}
        
        {activeTab === 'preview' && invoiceData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">請求書プレビュー</h2>
                <button
                  onClick={async () => {
                    if (previewRef.current) {
                      await generatePDF(previewRef.current, invoiceData);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Download size={18} />
                  PDFダウンロード
                </button>
              </div>
              <div className="border-2 border-gray-300 rounded overflow-auto">
                <InvoicePreview ref={previewRef} data={invoiceData} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'template' && (
          <TemplateManager 
            onLoadTemplate={handleLoadTemplate}
            currentData={invoiceData || undefined}
          />
        )}
      </main>
    </div>
  );
}