'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase'; 

export default function OrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState({
    product: '新米 こしひかり',
    kg: 5,
    method: 'delivery' as 'delivery' | 'pickup',
    address: '',
    name: '',
    phone: '',
    pickupDates: ['', '', ''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションチェック
    if (!order.name || !order.phone) {
      alert('お名前と電話番号を入力してください。');
      return;
    }
    if (!isValidPhone(order.phone)) {
      alert('有効な電話番号を入力してください。例: 090-1234-5678');
      return;
    }
    if (order.method === 'delivery' && !order.address) {
      alert('配送先住所を入力してください。');
      return;
    }
    if (order.method === 'pickup' && order.pickupDates.some((d) => !d)) {
      alert('第1〜第3希望の受け取り日をすべて入力してください。');
      return;
    }

    // セッションストレージに注文情報を保存
    sessionStorage.setItem('order', JSON.stringify(order));

    // 確認ページへ遷移（URLに注文情報を載せない）
    router.push('/order/confirm');
  };

  return (
    <main className="main_page">
      <h1 className="title">祖父の蔵</h1>
      <h2 className="subtitle">お米の注文</h2>

      <form onSubmit={handleSubmit} className="on_submit">
        {/* 商品選択 */}
        <div className="info_item">
          <h2 className="info_title">商品選択</h2>
          <select 
            className="info_data"
            value={order.product}
            onChange={(e) => setOrder({ ...order, product: e.target.value })}
          >
            <option value="新米 こしひかり">新米 こしひかり</option>
            <option value="玄米 こしひかり">玄米 こしひかり</option>
          </select>
        </div>

        {/* 数量選択 */}
        <div className="info_item">
          <h2 className="info_title">数量選択</h2>
          <div className="flex items-center">
            <select
              className="p-2 border rounded"
              value={order.kg}
              onChange={(e) => setOrder({...order, kg: Number(e.target.value)})}
            >
              {[1, 5, 10, 20, 30].map((kg) => (
                <option key={kg} value={kg}>{kg}kg</option>
              ))}
            </select>
            <span className="ml-2">（1kgあたり500円）</span>
          </div>
        </div>

        {/* 受け取り方法 */}
        <div className="info_item">
          <h2 className="info_title">受け取り方法</h2>
          <div className="receipt">
            <label className="">
              <input
                type="radio"
                className="mr-2"
                checked={order.method === 'delivery'}
                onChange={() => setOrder({...order, method: 'delivery'})}
              />
              配送（送料500円）
            </label>
            <label className="">
              <input
                type="radio"
                className="mr-2"
                checked={order.method === 'pickup'}
                onChange={() => setOrder({...order, method: 'pickup'})}
              />
              農園で受け取り（送料無料）
            </label>
          </div>
        </div>

        {/* お客様情報（名前・電話番号） */}
        <div className="info_item">
          <h2 className="info_title">お客様情報</h2>
          <div className="info_customer">
            <input
              type="text"
              className="info_data"
              placeholder="お名前"
              value={order.name}
              onChange={(e) => setOrder({...order, name: e.target.value})}
              required
            />
            <input
              type="tel"
              className="info_data"
              placeholder="電話番号"
              value={order.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, '');
                if (!value.endsWith('--')) {
                  setOrder({...order, phone: value});
                }
              }}
              required
            />
          </div>
        </div> 
        
        {/* 受け取り日時（受け取り方法がpickupのときのみ） */}
        {order.method === 'pickup' && (
          <div className="info_item">
            <h2 className="info_title">希望受け取り日（第1〜第3希望）</h2>
            <div className="receipt_dates">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  type="date"
                  className="info_data"
                  value={order.pickupDates[index]}
                  onChange={(e) => {
                    const newDates = [...order.pickupDates];
                    newDates[index] = e.target.value;
                    setOrder({ ...order, pickupDates: newDates });
                  }}
                  required
                />
              ))}
            </div>
          </div>
        )}
        {/* 配送先住所（配送のときのみ） */}
        {order.method === 'delivery' && (
          <div className="info_item">
            <h2 className="info_title">配送先住所</h2>
            <textarea
              className="info_data"
              placeholder="配送先住所"
              rows={3}
              value={order.address}
              onChange={(e) => setOrder({...order, address: e.target.value})}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          注文内容を確認
        </button>
      </form>
    </main>
  );
}

// 電話番号バリデーション関数　
export function isValidPhone(phone: string): boolean {
  // 例: 09012345678 や 0312345678 などに対応
  return /^0\d{1,4}\d{1,4}\d{3,4}$/.test(phone);
}
