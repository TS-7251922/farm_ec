'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

type Order = {
  product: string;
  kg: number;
  method: 'delivery' | 'pickup';
  address: string;
  name: string;
  phone: string;
  pickupDates: string[];
  createdAt?: Date;
};

export default function ConfirmPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('order');
    if (!savedOrder) {
      // 注文情報がない場合は注文ページへ戻す
      router.push('/order');
      return;
    }
    const parsedOrder = JSON.parse(savedOrder);
    setOrder({ ...parsedOrder, createdAt: new Date() });
  }, [router]);

  if (!order) return <p>注文情報を読み込み中...</p>;

  const price = order.kg * 500;
  const shippingFee = order.method === 'delivery' ? 500 : 0;
  const total = price + shippingFee;

  const handleConfirm = async () => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      // 注文確定後はセッションストレージから注文情報を削除
      sessionStorage.removeItem('order');
      router.push(`/order/thanks`);
    } catch (error) {
      console.error('注文の保存に失敗しました:', error);
      alert('注文の確定に失敗しました。');
    }
  };

  return (
    <main className="main_page">
      <h1 className="title">注文内容確認</h1>

      <div className="space-y-6">
        {/* 商品情報の表示 */}
        <div className="info_item">
          <h2 className="info_title">商品情報</h2>
          <p>{order.product} {order.kg}kg</p>
          <p>{price.toLocaleString()}円</p>
        </div>

        {/* 受け取り方法と個人情報の表示 */}
        <div className="info_item">
          <h2 className="info_title">受け取り方法</h2>
          <p>{order.method === 'delivery' ? '配送' : '農園で受け取り'}</p>

          <div className="mt-2 space-y-1">
            <p>お名前：{order.name}</p>
            <p>電話番号：{order.phone}</p>
            {order.method === 'delivery' && <p>配送先：{order.address}</p>}
            {order.method === 'pickup' && order.pickupDates.length > 0 && (
              <p>希望日：{order.pickupDates.join('、')}</p>
            )}
          </div>
          
          <p className="mt-2">送料: {shippingFee.toLocaleString()}円</p>
        </div>

        <div className="text-xl font-bold">合計金額: {total.toLocaleString()}円</div>

        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          注文を確定する
        </button>
      </div>
    </main>
  );
}
