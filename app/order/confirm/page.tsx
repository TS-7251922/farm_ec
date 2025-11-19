'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import dayjs from 'dayjs';

type Order = {
  date: string;
  trader: string;
  polishedKg: number;
  polishedCount: number;
  brownKg: number;
  brownCount: number;
  amount: number;
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

    // 入力値が空の場合は0に変換
    const safeOrder: Order = {
      ...parsedOrder,
      polishedKg: Number(parsedOrder.polishedKg) || 0,
      polishedCount: Number(parsedOrder.polishedCount) || 0,
      brownKg: Number(parsedOrder.brownKg) || 0,
      brownCount: Number(parsedOrder.brownCount) || 0,
      amount: Number(parsedOrder.amount) ?? 0,
      createdAt: new Date(),
    };
    setOrder(safeOrder);
  }, [router]);

  if (!order) return <p>注文情報を読み込み中...</p>;

  // 精米・玄米の合計金額計算
  const polishedTotal = order.polishedKg * order.polishedCount * 500 + order.polishedCount * 1000;
  const brownTotal = order.brownKg * order.brownCount * 500;
  const total = polishedTotal + brownTotal;

  const orderToSave = { ...order, amount: total };

  const handleConfirm = async () => {
    try {
      await addDoc(collection(db, 'orders'), orderToSave);
      sessionStorage.removeItem('order');
      router.push('/order/thanks');
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
          <div className="label">入力</div>
        </div>
        <div className="arrow">→</div>
        <div className="step active">
          <div className="circle">2</div>
          <div className="label">確認</div>
        </div>
        <div className="arrow">→</div>
        <div className="step">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h1 className="title">取引内容の確認</h1>

      <div className="order-summary">
        <section className="order-section">
          <h2>取引情報</h2>
          <div className="info-row">
            <span className="form_label">取引日：</span>
            <span className="value">{dayjs(order.date).format('YYYY年MM月D日')}</span>
          </div>
          <div className="info-row">
            <span className="form_label">取引者：</span>
            <span className="value">{order.trader || '0'}</span>
          </div>
        </section>

        <section className="order-section">
          <h2>商品情報</h2>
          <div className="info-row">
            <span className="form_label">精米：</span>
            <span className="value">{order.polishedKg || 0}kg × {order.polishedCount || 0}個</span>
          </div>
          <div className="info-row">
            <span className="form_label">玄米：</span>
            <span className="value">{order.brownKg || 0}kg × {order.brownCount || 0}個</span>
          </div>
        </section>

        <section className="order-section">
          <div className="info-row total-amount">
            <span className="form_label">合計金額：</span>
            <span className="value">{total.toLocaleString()}円</span>
          </div>
        </section>
      </div>

      {/* 注文確定ボタン */}
      <div className="submit_btn">
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          登録を確定する
        </Button>
      </div>

      {/* 修正ボタン */}
      <div className="back_btn">
        <Button variant="outlined" color="primary" onClick={() => router.push('/order')}>
          内容を修正する
        </Button>
      </div>
    </main>
  );
}
