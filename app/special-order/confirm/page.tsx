'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SpecialOrderConfirm() {
  const router = useRouter();
  const [specialOrder, setSpecialOrder] = useState<any>(null);

  // sessionStorage から読み込み
  useEffect(() => {
    const data = sessionStorage.getItem('specialOrder');
    if (!data) {
      alert('入力情報がありません。最初から入力してください。');
      router.push('/special-order');
      return;
    }
    setSpecialOrder(JSON.parse(data));
  }, [router]);

  const handleSubmit = async () => {
    if (!specialOrder) return;

    await addDoc(collection(db, 'orders'), {
      ...specialOrder,
      type: 'special',
      createdAt: serverTimestamp(),
    });

    sessionStorage.removeItem('specialOrder');
    router.push('/special-order/thanks');
  };

  if (!specialOrder) return null;

  return (
    <main className="main_page">
      <div className="step-indicator">
        <div className="step">
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

      <h2 className="subtitle">入力内容の確認</h2>

      <div className="confirm_box">
        <p><strong>取引日：</strong>{specialOrder.date}</p>
        <p><strong>取引者：</strong>{specialOrder.trader}</p>
        <p><strong>商品：</strong>{specialOrder.item}</p>
        <p><strong>重量：</strong>{specialOrder.weight} kg</p>
        <p><strong>金額：</strong>{Number(specialOrder.amount).toLocaleString()} 円</p>
      </div>

      <div className="submit_btn">
        <Button 
          variant="outlined" 
          onClick={() => router.push('/special-order')}
          style={{ marginRight: '16px' }}
        >
          修正する
        </Button>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
        >
          登録する
        </Button>
      </div>
    </main>
  );
}
