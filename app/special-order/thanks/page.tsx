'use client';

import Link from 'next/link';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

export default function SpecialThanksPage() {
  return (
    <main className="main_page">

      {/* ステップ表示 */}
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

      <h2 className="title">特別注文の登録が完了しました。</h2>

      <div className="thank_you_card">
        <p>登録内容は管理者画面の「特注履歴」から確認できます。</p>

        {/* ボタン横並び */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '28px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/control/special-order" passHref>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlaylistAddIcon />}
            >
              もう一件登録する
            </Button>
          </Link>

          <Link href="/control" passHref>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
            >
              管理画面へ戻る
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
