'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { ReceiptData } from '@/types/document';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FileText, Receipt, Package, Banknote } from 'lucide-react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then(mod => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
);

interface DashboardProps {}

interface MonthlyStats {
  month: string;
  invoiceCount: number;
  invoiceAmount: number;
  receiptCount: number;
  receiptAmount: number;
  totalCount: number;
  totalAmount: number;
}

export default function Dashboard({}: DashboardProps) {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [currentMonthStats, setCurrentMonthStats] = useState<MonthlyStats | null>(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const invoiceHistory = JSON.parse(localStorage.getItem('invoice_history') || '[]') as InvoiceData[];
    const receiptHistory = JSON.parse(localStorage.getItem('receipt_history') || '[]') as ReceiptData[];

    const statsMap = new Map<string, MonthlyStats>();
    
    invoiceHistory.forEach(invoice => {
      const month = format(parseISO(invoice.issueDate), 'yyyy-MM');
      const existing = statsMap.get(month) || {
        month,
        invoiceCount: 0,
        invoiceAmount: 0,
        receiptCount: 0,
        receiptAmount: 0,
        totalCount: 0,
        totalAmount: 0,
      };
      
      existing.invoiceCount++;
      existing.invoiceAmount += invoice.totalAmount;
      existing.totalCount++;
      existing.totalAmount += invoice.totalAmount;
      
      statsMap.set(month, existing);
    });

    receiptHistory.forEach(receipt => {
      const month = format(parseISO(receipt.issueDate), 'yyyy-MM');
      const existing = statsMap.get(month) || {
        month,
        invoiceCount: 0,
        invoiceAmount: 0,
        receiptCount: 0,
        receiptAmount: 0,
        totalCount: 0,
        totalAmount: 0,
      };
      
      existing.receiptCount++;
      existing.receiptAmount += receipt.amount;
      existing.totalCount++;
      existing.totalAmount += receipt.amount;
      
      statsMap.set(month, existing);
    });

    const stats = Array.from(statsMap.values()).sort((a, b) => b.month.localeCompare(a.month));
    const currentMonth = format(new Date(), 'yyyy-MM');
    setCurrentMonthStats(statsMap.get(currentMonth) || null);
    setMonthlyStats(stats.slice(0, 6));
  };

  const COLORS = ['#3B82F6', '#60A5FA'];

  const pieData = currentMonthStats ? [
    { name: '請求書', value: currentMonthStats.invoiceAmount },
    { name: '領収書', value: currentMonthStats.receiptAmount },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-slate-800">
          統計ダッシュボード
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">今月</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {currentMonthStats?.invoiceCount || 0}
            </div>
            <div className="text-sm text-slate-600">
              請求書発行数
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-50 rounded-xl">
                <Receipt className="text-sky-600" size={24} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">今月</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {currentMonthStats?.receiptCount || 0}
            </div>
            <div className="text-sm text-slate-600">
              領収書発行数
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-50 rounded-xl">
                <Package className="text-cyan-600" size={24} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">今月</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {currentMonthStats?.totalCount || 0}
            </div>
            <div className="text-sm text-slate-600">
              合計発行数
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Banknote className="text-indigo-600" size={24} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">今月</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              ¥{(currentMonthStats?.totalAmount || 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">
              合計金額
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-slate-800">
              月別推移
            </h3>
            {monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(parseISO(value + '-01'), 'MMM', { locale: ja })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
                    }}
                    labelFormatter={(value) => format(parseISO(value + '-01'), 'yyyy年MM月', { locale: ja })}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="invoiceCount" name="請求書" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="receiptCount" name="領収書" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Package className="mb-3" size={48} strokeWidth={1} />
                <p className="text-sm">データがありません</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-slate-800">
              金額内訳
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#60A5FA'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `¥${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => value === '請求書' ? '請求書' : '領収書'}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Banknote className="mb-3" size={48} strokeWidth={1} />
                <p className="text-sm">今月のデータがありません</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-slate-800">
              月別詳細
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-600 uppercase tracking-wider">年月</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-600 uppercase tracking-wider">請求書</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-600 uppercase tracking-wider">領収書</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-600 uppercase tracking-wider">合計</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-600 uppercase tracking-wider">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyStats.length > 0 ? monthlyStats.map((stat) => (
                  <tr key={stat.month} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-800">
                      {format(parseISO(stat.month + '-01'), 'yyyy年MM月', { locale: ja })}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-slate-600">
                      {stat.invoiceCount}枚
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-slate-600">
                      {stat.receiptCount}枚
                    </td>
                    <td className="text-right py-4 px-6 text-sm font-medium text-slate-800">
                      {stat.totalCount}枚
                    </td>
                    <td className="text-right py-4 px-6 text-sm font-medium text-slate-800">
                      ¥{stat.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
