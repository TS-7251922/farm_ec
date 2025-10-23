// controlにリダイレクト
import { redirect } from 'next/navigation';

export default function Home() {
  // トップページにアクセスしたら /control に飛ばす
  redirect('/control');
}