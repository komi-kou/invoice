'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceTemplate, InvoiceData } from '@/types/invoice';
import { storage } from '@/lib/storage';
import { Save, Trash2, FileText } from 'lucide-react';

interface TemplateManagerProps {
  onLoadTemplate: (data: Partial<InvoiceData>) => void;
  currentData?: InvoiceData;
  darkMode?: boolean;
}

export default function TemplateManager({ onLoadTemplate, currentData, darkMode }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = storage.getTemplates();
    setTemplates(savedTemplates);
  };

  const saveAsTemplate = () => {
    if (!templateName.trim() || !currentData) return;

    const template: InvoiceTemplate = {
      id: String(Date.now()),
      name: templateName,
      data: {
        issuer: currentData.issuer,
        bankAccount: currentData.bankAccount,
        paymentTerms: currentData.paymentTerms,
        taxRate: currentData.taxRate,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveTemplate(template);
    loadTemplates();
    setTemplateName('');
    setShowSaveDialog(false);
    alert('テンプレートを保存しました');
  };

  const deleteTemplate = (id: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      storage.deleteTemplate(id);
      loadTemplates();
    }
  };

  const loadTemplate = (template: InvoiceTemplate) => {
    onLoadTemplate(template.data);
    alert(`テンプレート「${template.name}」を読み込みました`);
  };

  return (
    <div className={`p-6 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          テンプレート管理
        </h3>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
        >
          <Save size={18} />
          現在の設定をテンプレート保存
        </button>
      </div>

      {showSaveDialog && (
        <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="テンプレート名を入力"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <button
              onClick={saveAsTemplate}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              保存
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setTemplateName('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            保存されたテンプレートはありません
          </p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {template.name}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    作成日: {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadTemplate(template)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  読込
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}