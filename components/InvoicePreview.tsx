'use client';

import React, { forwardRef } from 'react';
import { InvoiceData } from '@/types/invoice';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} id="invoice-preview" className="bg-white p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-8">請求書</h1>
          
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-lg font-bold mb-2">
                {data.client.companyName} 御中
              </div>
              {data.client.department && (
                <div>{data.client.department}</div>
              )}
              {data.client.contactPerson && (
                <div>{data.client.contactPerson} 様</div>
              )}
              <div className="mt-2">
                〒{data.client.postalCode}<br />
                {data.client.address}
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold">請求書番号:</span> {data.invoiceNumber}
              </div>
              <div className="mb-2">
                <span className="font-semibold">発行日:</span> {format(new Date(data.issueDate), 'yyyy年MM月dd日', { locale: ja })}
              </div>
              <div>
                <span className="font-semibold">支払期限:</span> {format(new Date(data.dueDate), 'yyyy年MM月dd日', { locale: ja })}
              </div>
            </div>
          </div>
          
          <div className="border-b-2 border-gray-800 pb-4 mb-4">
            <div className="text-xl font-bold mb-2">{data.issuer.companyName}</div>
            {data.issuer.registrationNumber && (
              <div className="text-sm">登録番号: {data.issuer.registrationNumber}</div>
            )}
            <div className="text-sm mt-2">
              〒{data.issuer.postalCode} {data.issuer.address}<br />
              TEL: {data.issuer.phone} / Email: {data.issuer.email}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="text-2xl font-bold text-center">
              ご請求金額: ¥{data.totalAmount.toLocaleString()}
            </div>
          </div>
          
          {data.paymentTerms && (
            <div className="mb-2">
              <span className="font-semibold">支払条件:</span> {data.paymentTerms}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2 text-left">品目・摘要</th>
                <th className="border border-gray-400 px-4 py-2 text-right w-20">数量</th>
                <th className="border border-gray-400 px-4 py-2 text-right w-28">単価</th>
                <th className="border border-gray-400 px-4 py-2 text-right w-28">金額</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-400 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-400 px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-400 px-4 py-2 text-right">
                    ¥{item.unitPrice.toLocaleString()}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-right">
                    ¥{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border border-gray-400 px-4 py-2 text-right font-semibold">
                  小計
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right">
                  ¥{data.subtotal.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="border border-gray-400 px-4 py-2 text-right font-semibold">
                  消費税({data.taxRate}%)
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right">
                  ¥{data.taxAmount.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan={3} className="border border-gray-400 px-4 py-2 text-right font-bold">
                  合計
                </td>
                <td className="border border-gray-400 px-4 py-2 text-right font-bold">
                  ¥{data.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {data.bankAccount && data.bankAccount.bankName && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">振込先</h3>
            <div className="text-sm">
              {data.bankAccount.bankName} {data.bankAccount.branchName}<br />
              {data.bankAccount.accountType} {data.bankAccount.accountNumber}<br />
              {data.bankAccount.accountHolder}
            </div>
          </div>
        )}
        
        {data.notes && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">備考</h3>
            <div className="text-sm whitespace-pre-wrap">{data.notes}</div>
          </div>
        )}
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;