'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';

type Order = {
  method: 'delivery' | 'pickup';
};

export default function ThanksPage() {
  const [method, setMethod] = useState<'delivery' | 'pickup' | null>(null);

  useEffect(() => {
  const savedOrder = sessionStorage.getItem('order');
  if (savedOrder) {
    const parsed: Order = JSON.parse(savedOrder);
    setMethod(parsed.method);
  } else {
    const fallback = sessionStorage.getItem('orderMethod');
    if (fallback === 'delivery' || fallback === 'pickup') {
      setMethod(fallback);
    }
  }
}, []);


  return (
    <main className="main_page">
      {/* ステップバー */}
      <div className="step-indicator">
        <div className="step completed">
          <div className="circle">1</div>
          <div className="label">注文入力</div>
        </div>
        <div className="step completed">
          <div className="circle">2</div>
          <div className="label">内容確認</div>
        </div>
        <div className="step active">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h2 className="title">ご注文ありがとうございます</h2>

      <div className="thank_you_card">
        <div className="con_text">
          <p>注文が確定しました。</p>
          {method === 'delivery' && <p>近日中に配送いたします。<br />※配送まで少々お時間頂きます。</p>}
          {method === 'pickup' && <p>受取日をメールにてご連絡いたします。</p>}
        </div>

        <div className="con_text">
          <p>注文内容の確認メールを送信しました。</p>
          <p>ご不明点があればお問い合わせください。</p>
          <p className="text_phone">MAIL: f22aa014@chuo.ac.jp</p>
        </div>

        <Link href="/order" passHref>
          <Button variant="outlined" color="primary" className="back_btn">
            トップページに戻る
          </Button>
        </Link>
      </div>
    </main>
  );
}
