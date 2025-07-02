'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
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
      await addDoc(collection(db, 'orders'), order);
      sessionStorage.setItem('orderMethod', order.method);
      // sessionStorage.removeItem('order');
      router.push(`/order/thanks`);
    } catch (error) {
      console.error('注文の保存に失敗しました:', error);
      alert('注文の確定に失敗しました。');
    }
  };

  return (
    <main className="main_page">
      {/* ステップバー */}
      <div className="step-indicator">
        <div className="step completed">
          <div className="circle">1</div>
          <div className="label">注文入力</div>
        </div>
        <div className="step active">
          <div className="circle">2</div>
          <div className="label">内容確認</div>
        </div>
        <div className="step">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h1 className="title">注文内容の確認</h1>

      <div className="order-summary">
        <section className="order-section">
          <h2>商品情報</h2>
          <div className="info-row">
            <span className="label">商品名：</span>
            <span className="value">{order.product}</span>
          </div>
          <div className="info-row">
            <span className="label">数量：</span>
            <span className="value">{order.kg}kg</span>
          </div>
          <div className="info-row">
            <span className="label">小計：</span>
            <span className="value">{price.toLocaleString()}円</span>
          </div>
        </section>

        <section className="order-section">
          <h2>受け取り方法</h2>
          <div className="info-row">
            <span className="label">方法：</span>
            <span className="value">{order.method === 'delivery' ? '配送' : '農園で受け取り'}</span>
          </div>
          {order.method === 'delivery' && (
            <div className="info-row">
              <span className="label">配送先：</span>
              <span className="value">{order.address}</span>
            </div>
          )}
          {order.method === 'pickup' && (
            <div className="info-row">
              <span className="label">受け取り希望日：</span>
              <span className="value">{order.pickupDates.join('、')}</span>
            </div>
          )}
        </section>
        
        <section className="order-section">
          <h2>お客様情報</h2>
          <div className="info-row">
            <span className="label">お名前：</span>
            <span className="value">{order.name}</span>
          </div>
          <div className="info-row">
            <span className="label">電話番号：</span>
            <span className="value">{order.phone}</span>
          </div>
        </section>
        
        <section className="order-section total">
          <div className="info-row bold">
            <span className="label">送料：</span>
            <span className="value">{shippingFee.toLocaleString()}円</span>
          </div>
          <div className="info-row total-amount">
            <span className="label">合計金額：</span>
            <span className="value">{total.toLocaleString()}円</span>
          </div>
        </section>
      </div>
        
      {/* 注文内容確認ボタン */}
        <div className="submit_btn">
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
          >
            注文を確定する
          </Button>
        </div>
    </main>
  );
}
