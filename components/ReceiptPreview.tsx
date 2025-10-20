'use client';

import React, { forwardRef } from 'react';
import { ReceiptData } from '@/types/document';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ReceiptPreviewProps {
  data: ReceiptData;
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} id="receipt-preview" className="bg-white p-8 max-w-2xl mx-auto">
        <div className="border-2 border-gray-800 p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">領 収 書</h1>
            <div className="text-sm text-gray-600">
              No. {data.receiptNumber}
            </div>
          </div>

          {/* 宛先 */}
          <div className="mb-6">
            <div className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block">
              {data.recipient} 様
            </div>
          </div>

          {/* 金額 */}
          <div className="mb-8">
            <div className="bg-gray-100 p-6 rounded text-center">
              <div className="text-sm mb-2">金額</div>
              <div className="text-4xl font-bold">
                ¥ {data.amount.toLocaleString()} -
              </div>
            </div>
          </div>

          {/* 但し書き */}
          <div className="mb-8">
            <div className="flex items-start">
              <span className="font-semibold mr-4">但し、</span>
              <span className="flex-1 border-b border-gray-400 pb-1">
                {data.description}
              </span>
            </div>
          </div>

          {/* 内訳 */}
          {data.breakdown && (
            <div className="mb-8 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-3">【内訳】</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">税抜金額</td>
                    <td className="text-right">¥{data.breakdown.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-1">消費税（{data.breakdown.taxRate}%）</td>
                    <td className="text-right">¥{data.breakdown.taxAmount.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-gray-400 font-semibold">
                    <td className="pt-2">合計</td>
                    <td className="text-right pt-2">¥{data.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 日付 */}
          <div className="mb-8">
            <div className="text-right">
              {format(new Date(data.issueDate), 'yyyy年MM月dd日', { locale: ja })}
            </div>
          </div>

          {/* 発行者情報と印鑑 */}
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <div className="font-bold text-lg mb-2">{data.issuer.companyName}</div>
              {data.issuer.registrationNumber && (
                <div className="text-sm text-gray-600 mb-1">
                  登録番号: {data.issuer.registrationNumber}
                </div>
              )}
              {data.issuer.address && (
                <div className="text-sm">{data.issuer.address}</div>
              )}
              {data.issuer.phone && (
                <div className="text-sm">TEL: {data.issuer.phone}</div>
              )}
            </div>
            
            {/* 印鑑スペース */}
            <div className="ml-8">
              {data.issuer.sealImage ? (
                <img
                  src={data.issuer.sealImage}
                  alt="印鑑"
                  className="w-24 h-24 object-contain"
                />
              ) : (
                <div className="w-24 h-24 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-400 text-xs">
                  印
                </div>
              )}
            </div>
          </div>

          {/* 備考 */}
          {data.notes && (
            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="text-sm text-gray-600">
                備考: {data.notes}
              </div>
            </div>
          )}
        </div>

        {/* 控え */}
        <div className="mt-8 text-center text-xs text-gray-500">
          上記の金額を正に領収いたしました
        </div>
      </div>
    );
  }
);

ReceiptPreview.displayName = 'ReceiptPreview';

export default ReceiptPreview;