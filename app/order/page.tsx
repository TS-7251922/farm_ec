'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { jaJP } from '@mui/x-date-pickers/locales';

export default function OrderPage() {
  const router = useRouter();

  const [order, setOrder] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    trader: '',
    polishedKg: '',
    polishedCount: '',
    brownKg: '',
    brownCount: '',
    amount: 0,
  });

  const [loaded, setLoaded] = useState(false);

  // 初回のみ sessionStorage から復元
  useEffect(() => {
    const savedOrder = sessionStorage.getItem('order');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      setOrder(parsedOrder);
    }
    setLoaded(true);
  }, []);

  // 金額自動計算 + sessionStorage への保存
  useEffect(() => {
    if (!loaded) return; // 初期化中はスキップ

    const polishedKg = Number(order.polishedKg) || 0;
    const polishedCount = Number(order.polishedCount) || 0;
    const brownKg = Number(order.brownKg) || 0;
    const brownCount = Number(order.brownCount) || 0;

    const polishedTotal = polishedKg * polishedCount * 500 + polishedCount * 1000;
    const brownTotal = brownKg * brownCount * 500;
    const total = polishedTotal + brownTotal;

    // 金額を更新
    const updatedOrder = { ...order, amount: total };
    setOrder(updatedOrder);

    // 保存（無限ループ防止のため、loadedチェック済）
    sessionStorage.setItem('order', JSON.stringify(updatedOrder));
  }, [
    order.polishedKg,
    order.polishedCount,
    order.brownKg,
    order.brownCount,
    loaded,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!order.date || !order.trader) {
      alert('日付と取引者は必須です。');
      return;
    }

    sessionStorage.setItem('order', JSON.stringify(order));
    router.push('/order/confirm');
  };

  const kgOptions = [10, 30];
  const countOptions = Array.from({ length: 100 }, (_, i) => i);

  return (
    <main className="main_page">
      {/* ステップバー */}
      <div className="step-indicator">
        <div className="step active">
          <div className="circle">1</div>
          <div className="label">入力</div>
        </div>
        <div className="arrow">→</div>
        <div className="step">
          <div className="circle">2</div>
          <div className="label">確認</div>
        </div>
        <div className="arrow">→</div>
        <div className="step">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h2 className="subtitle">取引入力フォーム</h2>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault(); // Enter無効化
        }}
        className="on_submit"
      >
        {/* 日付 */}
        <div className="info_item">
          <h2 className="info_title">取引日</h2>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="ja"
            localeText={jaJP.components.MuiLocalizationProvider.defaultProps.localeText}
          >
            <DatePicker
              label=""
              format="YYYY年MM月DD日"
              value={dayjs(order.date)}
              onChange={(newDate) =>
                setOrder({
                  ...order,
                  date: newDate ? newDate.format('YYYY-MM-DD') : '',
                })
              }
              slotProps={{
                textField: {
                  variant: 'outlined',
                },
              }}
            />
          </LocalizationProvider>
        </div>

        {/* 取引者 */}
        <div className="info_item">
          <h2 className="info_title">取引者</h2>
          <div className="info_body">
            <TextField
              label="取引者名"
              variant="outlined"
              fullWidth
              type="text"  
              value={order.trader}
              onChange={(e) => setOrder({ ...order, trader: e.target.value })}
              required
              error={order.trader.length > 12}
              helperText={
                order.trader.length > 12
                  ? "12文字以内で入力してください"
                  : `${order.trader.length}/12`
              }
              slotProps={{
                htmlInput: { maxLength: 12 }
              }}
            />
          </div>
        </div>

        {/* 精米 */}
        <div className="info_item">
          <h2 className="info_title">精米</h2>
          <div className="info_body">
            <FormControl>
              <InputLabel>精米 (kg)</InputLabel>
              <Select
                value={order.polishedKg}
                label="精米 (kg)"
                onChange={(e) =>
                  setOrder({ ...order, polishedKg: e.target.value })
                }
              >
                {kgOptions.map((kg) => (
                  <MenuItem key={kg} value={kg}>
                    {kg} kg
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>精米 (個数)</InputLabel>
              <Select
                value={order.polishedCount}
                label="精米 (個数)"
                onChange={(e) =>
                  setOrder({ ...order, polishedCount: e.target.value })
                }
              >
                {countOptions.map((count) => (
                  <MenuItem key={count} value={count}>
                    {count} 個
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* 玄米 */}
        <div className="info_item">
          <h2 className="info_title">玄米</h2>
          <div className="info_body">
            <FormControl>
              <InputLabel>玄米 (kg)</InputLabel>
              <Select
                value={order.brownKg}
                label="玄米 (kg)"
                onChange={(e) =>
                  setOrder({ ...order, brownKg: e.target.value })
                }
              >
                {kgOptions.map((kg) => (
                  <MenuItem key={kg} value={kg}>
                    {kg} kg
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>玄米 (個数)</InputLabel>
              <Select
                value={order.brownCount}
                label="玄米 (個数)"
                onChange={(e) =>
                  setOrder({ ...order, brownCount: e.target.value })
                }
              >
                {countOptions.map((count) => (
                  <MenuItem key={count} value={count}>
                    {count} 個
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* 金額（自動計算結果） */}
        <div className="info_item">
          <h2 className="info_title">合計金額</h2>
          <div className="info_body">
            <TextField
              label=""
              variant="standard"
              fullWidth
              value={`${order.amount.toLocaleString()} 円`}
              inputProps={{
                readOnly: true,
                sx: {
                  '& .MuiInputBase-input': {
                    textAlign: 'center',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="submit_btn">
          <Button type="submit" variant="contained" color="primary">
            入力内容を確認
          </Button>
        </div>
      </form>
    </main>
  );
}
