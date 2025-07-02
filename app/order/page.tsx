'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function OrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState({
    product: '新米 こしひかり',
    kg: 5,
    method: 'delivery' as 'delivery' | 'pickup',
    address: '',
    name: '',
    phone: '',
    pickupDates: ['', '', ''],
    confirmedPickupDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!order.name || !order.phone) {
      alert('お名前と電話番号を入力してください。');
      return;
    }
    if (!isValidPhone(order.phone)) {
      alert('有効な電話番号を入力してください。例: 09012345678');
      return;
    }
    if (order.method === 'delivery' && !order.address) {
      alert('配送先住所を入力してください。');
      return;
    }
    if (order.method === 'pickup' && order.pickupDates.some((d) => !d)) {
      alert('第1〜第3希望の受け取り日をすべて入力してください。');
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
          <div className="label">注文入力</div>
        </div>

        <div className="arrow">→</div>

        <div className="step">
          <div className="circle">2</div>
          <div className="label">内容確認</div>
        </div>

        <div className="arrow">→</div>
        
        <div className="step">
          <div className="circle">3</div>
          <div className="label">完了</div>
        </div>
      </div>

      <h2 className="subtitle">お米の注文</h2>

      <form onSubmit={handleSubmit} className="on_submit">
        {/* 商品選択 */}
        <div className="info_item">
          <h2 className="info_title">商品選択</h2>
          <FormControl>
            <InputLabel id="product-label">商品</InputLabel>
            <Select
              labelId="product-label"
              id="product-select"
              value={order.product}
              label="商品"
              onChange={(e) => setOrder({ ...order, product: e.target.value })}
              style={{ minWidth: 200 }}
            >
              <MenuItem value="新米 こしひかり">新米 こしひかり</MenuItem>
              <MenuItem value="玄米 こしひかり">玄米 こしひかり</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* 数量選択 */}
        <div className="info_item">
          <h2 className="info_title">数量選択</h2>
          <p>（1kgあたり500円）</p>
          <FormControl>
            <InputLabel id="kg-label">数量 (kg)</InputLabel>
            <Select
              labelId="kg-label"
              id="kg-select"
              value={order.kg}
              label="数量 (kg)"
              onChange={(e) => setOrder({ ...order, kg: Number(e.target.value) })}
              style={{ minWidth: 200 }}
            >
              {[1, 5, 10, 20, 30].map((kg) => (
                <MenuItem key={kg} value={kg}>
                  {kg}kg
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* 受け取り方法 */}
        <div className="info_item">
          <FormControl component="fieldset">
            <h2 className="info_title">受け取り方法</h2>
            <RadioGroup
              value={order.method}
              onChange={(e) => setOrder({ ...order, method: e.target.value as 'delivery' | 'pickup' })}
            >
              <FormControlLabel value="delivery" control={<Radio />} label="配送（送料500円）" />
              <FormControlLabel value="pickup" control={<Radio />} label="農園で受け取り（送料無料）" />
            </RadioGroup>
          </FormControl>
        </div>

        {/* お客様情報 */}
        <div className="info_item">
          <h2 className="info_title">お客様情報</h2>
          <div className="info_customer flex flex-col gap-4 md:flex-row">
            <TextField
              label="お名前"
              variant="outlined"
              value={order.name}
              onChange={(e) => setOrder({ ...order, name: e.target.value })}
              required
            />
            <TextField
              label="電話番号"
              variant="outlined"
              value={order.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, '');
                if (!value.endsWith('--')) {
                  setOrder({ ...order, phone: value });
                }
              }}
              required
            />
          </div>
        </div>

        {/* 受け取り日時 */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {order.method === 'pickup' && (
            <div className="info_item">
              <h2 className="info_title">希望受け取り日（第1〜第3希望）</h2>
              <div className="wish_day">
                {[0, 1, 2].map((index) => (
                  <DatePicker
                    key={index}
                    label={`第${index + 1}希望日`}
                    format="YYYY-MM-DD"
                    value={order.pickupDates[index] ? dayjs(order.pickupDates[index]) : null}
                    onChange={(newDate) => {
                      const newDates = [...order.pickupDates];
                      newDates[index] = newDate ? newDate.format('YYYY-MM-DD') : '';
                      setOrder({ ...order, pickupDates: newDates });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </LocalizationProvider>

        {/* 配送先住所 */}
        {order.method === 'delivery' && (
          <div className="info_item">
            <h2 className="info_title">配送先住所</h2>
            <TextField
              label="配送先住所"
              placeholder="配送先住所を入力"
              multiline
              rows={2}
              required
              value={order.address}
              onChange={(e) => setOrder({ ...order, address: e.target.value })}
            />
          </div>
        )}

        {/* 注文内容確認ボタン */}
        <div className="submit_btn">
          <Button type="submit" variant="contained" color="primary">
            注文内容を確認
          </Button>
        </div>
      </form>
    </main>
  );
}

export function isValidPhone(phone: string): boolean {
  return /^0\d{1,4}\d{1,4}\d{3,4}$/.test(phone);
}
