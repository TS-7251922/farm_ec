'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home'; // ホームアイコン
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // ➕アイコン

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
          <div className="label">入力</div>
        </div>
        <div className="arrow">→</div>
        <div className="step completed">
          <div className="circle">2</div>
          <div className="label">確認</div>
        </div>
        <div className="arrow">→</div>
        <div className="step active">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h2 className="title">取引情報の登録完了しました。</h2>

      <div className="thank_you_card">
        <p>管理者画面にてご確認ください。</p>

        {/* ボタンを縦並びに中央配置 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '24px',
            alignItems: 'center',
          }}
        >
          <Link href="/order" passHref>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              className="back_btn"
            >
              さらに登録する
            </Button>
          </Link>

          <Link href="/control" passHref>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              className="admin_btn"
            >
              管理者画面に戻る
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
