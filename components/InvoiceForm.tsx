'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { storage } from '@/lib/storage';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Trash2, Save, FileDown } from 'lucide-react';

interface InvoiceFormProps {
  onSubmit: (data: InvoiceData) => void;
  initialData?: Partial<InvoiceData>;
}

export default function InvoiceForm({ onSubmit, initialData }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    issuer: {
      companyName: '',
      postalCode: '',
      address: '',
      phone: '',
      email: '',
      registrationNumber: '',
    },
    client: {
      companyName: '',
      department: '',
      contactPerson: '',
      postalCode: '',
      address: '',
    },
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    taxRate: 10,
    taxAmount: 0,
    totalAmount: 0,
    notes: '',
    paymentTerms: '請求書発行日より30日以内',
    bankAccount: {
      bankName: '',
      branchName: '',
      accountType: '普通',
      accountNumber: '',
      accountHolder: '',
    },
  });

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dueDate = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      const savedData = storage.getCurrentInvoice();
      const invoiceNumber = storage.getNextInvoiceNumber();
      
      if (initialData) {
        setFormData(prev => ({ 
          ...prev, 
          ...initialData, 
          invoiceNumber,
          issueDate: initialData.issueDate || today,
          dueDate: initialData.dueDate || dueDate
        }));
      } else if (savedData) {
        setFormData(savedData);
      } else {
        setFormData(prev => ({ 
          ...prev, 
          invoiceNumber,
          issueDate: today,
          dueDate: dueDate
        }));
      }
    }
  }, [initialData]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(subtotal * (formData.taxRate / 100));
    const totalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount,
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveCurrentInvoice(formData);
    storage.updateLastInvoiceNumber(formData.invoiceNumber);
    storage.addToHistory(formData);
    onSubmit(formData);
  };

  const handleSave = () => {
    storage.saveCurrentInvoice(formData);
    alert('データを保存しました');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">請求書作成</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">請求書番号</label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">発行日</label>
          <input
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">支払期限</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            required
          />
        </div>
      </div>

      {/* 発行者情報 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">発行者情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">会社名</label>
            <input
              type="text"
              value={formData.issuer.companyName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, companyName: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">登録番号</label>
            <input
              type="text"
              value={formData.issuer.registrationNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, registrationNumber: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="T1234567890123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">郵便番号</label>
            <input
              type="text"
              value={formData.issuer.postalCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, postalCode: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">住所</label>
            <input
              type="text"
              value={formData.issuer.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">電話番号</label>
            <input
              type="tel"
              value={formData.issuer.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">メールアドレス</label>
            <input
              type="email"
              value={formData.issuer.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                issuer: { ...prev.issuer, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 請求先情報 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">請求先情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">会社名</label>
            <input
              type="text"
              value={formData.client.companyName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, companyName: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">部署</label>
            <input
              type="text"
              value={formData.client.department}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, department: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">担当者</label>
            <input
              type="text"
              value={formData.client.contactPerson}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, contactPerson: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">郵便番号</label>
            <input
              type="text"
              value={formData.client.postalCode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, postalCode: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">住所</label>
            <input
              type="text"
              value={formData.client.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                client: { ...prev.client, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            />
          </div>
        </div>
      </div>

      {/* 明細 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">明細</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-2 border-gray-300 px-4 py-2 text-left font-bold">品目・摘要</th>
                <th className="border-2 border-gray-300 px-4 py-2 text-right w-24 font-bold">数量</th>
                <th className="border-2 border-gray-300 px-4 py-2 text-right w-32 font-bold">単価</th>
                <th className="border-2 border-gray-300 px-4 py-2 text-right w-32 font-bold">金額</th>
                <th className="border-2 border-gray-300 px-4 py-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border-2 border-gray-200 px-4 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </td>
                  <td className="border-2 border-gray-200 px-4 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1 border-2 border-gray-300 rounded-lg text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      min="1"
                      required
                    />
                  </td>
                  <td className="border-2 border-gray-200 px-4 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      className="w-full px-2 py-1 border-2 border-gray-300 rounded-lg text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      min="0"
                      required
                    />
                  </td>
                  <td className="border-2 border-gray-200 px-4 py-2 text-right font-semibold">
                    ¥{item.amount.toLocaleString()}
                  </td>
                  <td className="border-2 border-gray-200 px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all"
        >
          <Plus size={18} />
          明細を追加
        </button>
      </div>

      {/* 金額サマリー */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between py-2">
            <span>小計:</span>
            <span className="font-semibold">¥{formData.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <span>消費税</span>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                className="w-20 px-2 py-1 border-2 border-gray-300 rounded-lg text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                min="0"
                max="100"
              />
              <span>%:</span>
            </div>
            <span className="font-semibold">¥{formData.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300">
            <span className="text-lg font-bold">合計:</span>
            <span className="text-lg font-bold">¥{formData.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 振込先情報 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">振込先情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">銀行名</label>
            <input
              type="text"
              value={formData.bankAccount?.bankName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bankAccount: { ...prev.bankAccount!, bankName: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">支店名</label>
            <input
              type="text"
              value={formData.bankAccount?.branchName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bankAccount: { ...prev.bankAccount!, branchName: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">口座種別</label>
            <select
              value={formData.bankAccount?.accountType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bankAccount: { ...prev.bankAccount!, accountType: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="普通">普通</option>
              <option value="当座">当座</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">口座番号</label>
            <input
              type="text"
              value={formData.bankAccount?.accountNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bankAccount: { ...prev.bankAccount!, accountNumber: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">口座名義</label>
            <input
              type="text"
              value={formData.bankAccount?.accountHolder}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                bankAccount: { ...prev.bankAccount!, accountHolder: e.target.value }
              }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 備考 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">その他</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">支払条件</label>
            <input
              type="text"
              value={formData.paymentTerms}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              rows={3}
            />
          </div>
        </div>
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