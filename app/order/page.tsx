'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { jaJP } from '@mui/x-date-pickers/locales';
import InputAdornment from "@mui/material/InputAdornment";

export default function OrderPage() {
  const router = useRouter();

  type Order = {
    date: string;
    trader: string;
    polishedKg: string;
    polishedCount: string;
    brownKg: string;
    brownCount: string;
    amount: string;
  };

  const [order, setOrder] = useState<Order>({
    date: dayjs().format('YYYY-MM-DD'),
    trader: '',
    polishedKg: '',
    polishedCount: '',
    brownKg: '',
    brownCount: '',
    amount: '',
  });

  const [loaded, setLoaded] = useState(false);

  // 数字入力制御（数字以外削除＋先頭ゼロ除去）
  const numericInput = (value: string) => {
    value = value.replace(/[^0-9]/g, ''); // 数字以外削除
    return value === '' ? '' : String(Number(value)); // 先頭0削除
  };

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('order');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
    setLoaded(true);
  }, []);

  // 自動計算（amountが未入力時のみ反映）
  useEffect(() => {
    if (!loaded) return;

    const polishedKg = Number(order.polishedKg) || 0;
    const polishedCount = Number(order.polishedCount) || 0;
    const brownKg = Number(order.brownKg) || 0;
    const brownCount = Number(order.brownCount) || 0;

    const polishedTotal = polishedKg * polishedCount * 500 + polishedCount * 1000;
    const brownTotal = brownKg * brownCount * 500;
    const autoTotal = polishedTotal + brownTotal;

    const updatedOrder = {
      ...order,
      amount: order.amount === '' ? String(autoTotal) : order.amount,
    };

    setOrder(updatedOrder);
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

      <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="on_submit">

        {/* 日付 */}
        <div className="info_item">
          <h2 className="info_title">取引日</h2>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja" localeText={jaJP.components.MuiLocalizationProvider.defaultProps.localeText}>
            <DatePicker
              label=""
              format="YYYY年MM月DD日"
              value={dayjs(order.date)}
              onChange={(newDate) => setOrder({ ...order, date: newDate ? newDate.format('YYYY-MM-DD') : '' })}
            />
          </LocalizationProvider>
        </div>

        {/* 取引者 */}
        <div className="info_item">
          <h2 className="info_title" style={{ textAlign: "center" }}>取引者</h2>
          
          <div style={{ width: "350px", margin: "0 auto", textAlign: "center" }}> 
            <TextField
              label=""
              variant="outlined"
              type="text"
              size="small"
              fullWidth
              value={order.trader}
              onChange={(e) => setOrder({ ...order, trader: e.target.value })}
              inputProps={{
                maxLength: 12,
                style: { textAlign: "center" },
              }}
              sx={{ input: { textAlign: "center" } }}
            />
        
            <div style={{ fontSize: "12px", opacity: 0.6 }}>
              {order.trader.length}/12
            </div>
          </div>
        </div>


        {/* 精米 */}
        <div className="info_item">
          <h2 className="info_title">精米</h2>
          <div className="info_body">
            <TextField
              label="精米 (kg)"
              type="text"
              value={order.polishedKg}
              onChange={(e) => setOrder({ ...order, polishedKg: numericInput(e.target.value) })}
            />
            <TextField
              label="精米 (個数)"
              type="text"
              value={order.polishedCount}
              onChange={(e) => setOrder({ ...order, polishedCount: numericInput(e.target.value) })}
            />
          </div>
        </div>

        {/* 玄米 */}
        <div className="info_item">
          <h2 className="info_title">玄米</h2>
          <div className="info_body">
            <TextField
              label="玄米 (kg)"
              type="text"
              value={order.brownKg}
              onChange={(e) => setOrder({ ...order, brownKg: numericInput(e.target.value) })}
            />
            <TextField
              label="玄米 (個数)"
              type="text"
              value={order.brownCount}
              onChange={(e) => setOrder({ ...order, brownCount: numericInput(e.target.value) })}
            />
          </div>
        </div>

        {/* 金額 */}
        <div className="info_item">
          <h2 className="info_title" style={{ textAlign: "center" }}>合計金額</h2>

          <div className="info_body">
            <TextField
              variant="standard"
              type="text"
              value={order.amount ? Number(order.amount).toLocaleString() : ""}
              onChange={(e) => {
                // 入力から数字以外を除去
                const raw = e.target.value.replace(/,/g, "");
                setOrder({ ...order, amount: numericInput(raw) });
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ fontSize: "1.2rem" }}>
                    円
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "200px",
                margin: "0 auto",
                input: {
                  textAlign: "center",
                  fontSize: "1.2rem",
                  padding: "4px 0 0 22px",
                },
                "& .MuiInput-underline:before": {
                  borderBottomWidth: "1.5px",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomWidth: "2px",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "#333",
                },
              }}
            />
          </div>
        </div>

        {/* 送信 */}
        <div className="submit_btn">
          <Button type="submit" variant="contained" color="primary">
            入力内容を確認
          </Button>
        </div>
      </form>
    </main>
  );
}
