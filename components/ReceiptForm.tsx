'use client';

import React, { useState, useEffect } from 'react';
import { ReceiptData } from '@/types/document';
import { format } from 'date-fns';
import { Save, FileDown, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ReceiptFormProps {
  onSubmit: (data: ReceiptData) => void;
  initialData?: Partial<ReceiptData>;
  darkMode?: boolean;
}

export default function ReceiptForm({ onSubmit, initialData, darkMode }: ReceiptFormProps) {
  const [formData, setFormData] = useState<ReceiptData>({
    receiptNumber: '',
    issueDate: '',
    issuer: {
      companyName: '',
      postalCode: '',
      address: '',
      phone: '',
      registrationNumber: '',
      sealImage: '',
    },
    recipient: '',
    amount: 0,
    description: '',
    breakdown: {
      subtotal: 0,
      taxRate: 10,
      taxAmount: 0,
    },
    notes: '',
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (initialData) {
        setFormData(prev => ({ 
          ...prev, 
          ...initialData,
          issueDate: initialData.issueDate || today
        }));
      } else {
        // LocalStorageから保存データを読み込み
        const savedData = localStorage.getItem('current_receipt');
        if (savedData) {
          setFormData(JSON.parse(savedData));
        } else {
          // 領収書番号の自動生成
          const generateReceiptNumber = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `R${year}${month}-${random}`;
          };
          
          setFormData(prev => ({ 
            ...prev, 
            receiptNumber: generateReceiptNumber(),
            issueDate: today
          }));
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    // 内訳から自動計算
    if (showBreakdown && formData.breakdown) {
      const taxAmount = Math.floor(formData.breakdown.subtotal * (formData.breakdown.taxRate / 100));
      const total = formData.breakdown.subtotal + taxAmount;
      setFormData(prev => ({
        ...prev,
        amount: total,
        breakdown: {
          ...prev.breakdown!,
          taxAmount,
        },
      }));
    }
  }, [formData.breakdown?.subtotal, formData.breakdown?.taxRate, showBreakdown, formData.breakdown]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          issuer: {
            ...prev.issuer,
            sealImage: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('current_receipt', JSON.stringify(formData));
    alert('領収書データを保存しました');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('current_receipt', JSON.stringify(formData));
    
    // 履歴に追加
    const history = JSON.parse(localStorage.getItem('receipt_history') || '[]');
    history.unshift(formData);
    localStorage.setItem('receipt_history', JSON.stringify(history.slice(0, 100)));
    
    onSubmit(formData);
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border-2 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          領収書作成
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md transition-all"
          >
            <Save size={18} />
            一時保存
          </button>
        </div>
      </div>

      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            領収書番号
          </label>
          <input
            type="text"
            value={formData.receiptNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, receiptNumber: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            発行日
          </label>
          <input
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* 宛先 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          宛先（○○様）
        </label>
        <input
          type="text"
          value={formData.recipient}
          onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
          className={inputClass}
          placeholder="株式会社○○"
          required
        />
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          金額
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-gray-700">¥</span>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            className={inputClass}
            min="0"
            required
            disabled={showBreakdown}
          />
        </div>
        <div className="mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBreakdown}
              onChange={(e) => setShowBreakdown(e.target.checked)}
              className="rounded w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              内訳を表示
            </span>
          </label>
        </div>
      </div>

      {/* 内訳 */}
      {showBreakdown && (
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            内訳
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1 text-gray-600">
                税抜金額
              </label>
              <input
                type="number"
                value={formData.breakdown?.subtotal}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  breakdown: { ...prev.breakdown!, subtotal: Number(e.target.value) }
                }))}
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-gray-600">
                税率(%)
              </label>
              <input
                type="number"
                value={formData.breakdown?.taxRate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  breakdown: { ...prev.breakdown!, taxRate: Number(e.target.value) }
                }))}
                className={inputClass}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-gray-600">
                消費税額
              </label>
              <input
                type="number"
                value={formData.breakdown?.taxAmount}
                className={inputClass}
                disabled
              />
            </div>
          </div>
        </div>
      )}

      {/* 但し書き */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          但し書き
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={inputClass}
          placeholder="品代として"
          required
        />
      </div>

      {/* 発行者情報 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          発行者情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              会社名
            </label>
            <input
              type="text"
              value={formData.issuer.companyName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, companyName: e.target.value }
              }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              登録番号
            </label>
            <input
              type="text"
              value={formData.issuer.registrationNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, registrationNumber: e.target.value }
              }))}
              className={inputClass}
              placeholder="T1234567890123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              住所
            </label>
            <input
              type="text"
              value={formData.issuer.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, address: e.target.value }
              }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              電話番号
            </label>
            <input
              type="tel"
              value={formData.issuer.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, phone: e.target.value }
              }))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 印鑑画像 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          印鑑画像
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="seal-upload"
          />
          <label
            htmlFor="seal-upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer font-semibold shadow-md transition-all"
          >
            <Upload size={18} />
            画像をアップロード
          </label>
          {formData.issuer.sealImage && (
            <div className="relative">
              <Image
                src={formData.issuer.sealImage}
                alt="印鑑"
                width={80}
                height={80}
                className="h-20 w-20 object-contain border rounded"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  issuer: { ...prev.issuer, sealImage: '' }
                }))}
                className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 備考 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          備考
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className={inputClass}
          rows={2}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg transition-all transform hover:scale-105"
        >
          <FileDown size={20} />
          PDF作成
        </button>
      </div>
    </form>
  );
}