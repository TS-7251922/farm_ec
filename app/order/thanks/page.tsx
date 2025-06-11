import Link from 'next/link';

export default function ThanksPage() {
  return (
    <main className="main_page">
      <h1 className="title">ご注文ありがとうございました</h1>

      <div className="confirmation">
        <div className="con_text">
          <p>注文が確定しました</p>
          <p>近日中に{/* 配送方法に応じて分岐 */}お届けいたします。</p>
        </div>

        <div className="con_text">
          <p>注文内容の確認メールを送信しました</p>
          <p>ご不明点があればお問い合わせください</p>
          <p className="text_phone">TEL: 070-3799-3949</p>
        </div>

        <Link
          href="/order"
          className="back_btn"
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}