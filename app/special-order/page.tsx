'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { jaJP } from '@mui/x-date-pickers/locales';

export default function SpecialOrderPage() {
  const router = useRouter();

  const [order, setOrder] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    trader: '',
    item: '',
    weight: '',
    amount: '',
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('specialOrder');
    if (saved) setOrder(JSON.parse(saved));
    setLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!order.date || !order.trader || !order.item || !order.weight || !order.amount) {
      alert('すべての項目を入力してください。');
      return;
    }

    sessionStorage.setItem('specialOrder', JSON.stringify(order));
    router.push('/special-order/confirm');
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

      <h2 className="subtitle">特別注文フォーム</h2>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
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
              format="YYYY年MM月DD日"
              value={dayjs(order.date)}
              onChange={(newDate) =>
                setOrder({ ...order, date: newDate?.format('YYYY-MM-DD') || '' })
              }
            />
          </LocalizationProvider>
        </div>

        {/* 取引者 */}
        <div className="info_item">
          <h2 className="info_title">取引者</h2>
          <TextField
            fullWidth
            label="取引者名"
            value={order.trader}
            onChange={(e) => setOrder({ ...order, trader: e.target.value })}
            required
            error={order.trader.length > 12}
            helperText={
              order.trader.length > 12
                ? '12文字以内で入力してください'
                : `${order.trader.length}/12`
            }
            inputProps={{ maxLength: 12 }}
          />
        </div>

        {/* 商品 */}
        <div className="info_item">
          <h2 className="info_title">商品</h2>
          <FormControl fullWidth>
            <InputLabel>商品を選択</InputLabel>
            <Select
              value={order.item}
              label="商品を選択"
              onChange={(e) => setOrder({ ...order, item: e.target.value })}
              required
            >
              <MenuItem value="精米">精米</MenuItem>
              <MenuItem value="玄米">玄米</MenuItem>
              <MenuItem value="もち米">もち米</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* 重量 */}
        <div className="info_item">
          <h2 className="info_title">重量 (kg)</h2>
          <TextField
            fullWidth
            type="number"
            placeholder="例: 25"
            value={order.weight}
            onChange={(e) => setOrder({ ...order, weight: e.target.value })}
            required
          />
        </div>

        {/* 金額 */}
        <div className="info_item">
          <h2 className="info_title">金額 (円)</h2>
          <TextField
            fullWidth
            type="number"
            placeholder="例: 12800"
            value={order.amount}
            onChange={(e) => setOrder({ ...order, amount: e.target.value })}
            required
          />
        </div>

        <div className="submit_btn">
          <Button type="submit" variant="contained" color="warning">
            入力内容を確認
          </Button>
        </div>
      </form>
    </main>
  );
}
