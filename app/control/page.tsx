'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Card, CardContent, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';

import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import dayjs from 'dayjs';

const drawerWidth = 240;
const MAX_KG = 7000;

type Order = {
  id: string;
  date: any;
  customerName: string;
  polishedKg: number;
  polishedCount: number;
  brownKg: number;
  brownCount: number;
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [totalKg, setTotalKg] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<'home' | 'history'>('home');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');

  const db = getFirestore(app);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      let sumKg = 0;
      const allOrders: Order[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const polishedKg = Number(data.polishedKg ?? 0);
        const polishedCount = Number(data.polishedCount ?? 0);
        const brownKg = Number(data.brownKg ?? 0);
        const brownCount = Number(data.brownCount ?? 0);

        sumKg += polishedKg + brownKg;

        allOrders.push({
          id: docSnap.id,
          date: data.date ?? data.createdAt ?? new Date(),
          customerName: data.trader ?? '名無し',
          polishedKg,
          polishedCount,
          brownKg,
          brownCount,
        });
      });

      setOrders(allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setTotalKg(sumKg);
      setPercentage(Math.min((sumKg / MAX_KG) * 100, 100));
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  }, [db]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  const filteredOrders = orders.filter(o => {
    const d = new Date(o.date);
    if (yearFilter !== 'all' && d.getFullYear() !== yearFilter) return false;
    if (monthFilter !== 'all' && d.getMonth() + 1 !== monthFilter) return false;
    return true;
  });

  const getPolishedAmount = (order: Order) =>
    (order.polishedKg * order.polishedCount * 500) + (order.polishedCount * 1000);
  const getBrownAmount = (order: Order) => order.brownKg * order.brownCount * 500;
  const getTotalAmount = (order: Order) => getPolishedAmount(order) + getBrownAmount(order);

  if (!mounted) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" fontWeight="bold">祖父の蔵</Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton selected={viewMode === 'home'} onClick={() => setViewMode('home')}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="ホーム" />
            </ListItemButton>
            <ListItemButton selected={viewMode === 'history'} onClick={() => setViewMode('history')}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary="取引履歴" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#e3e9ed', p: 3, minHeight: '100vh' }}>
        <Toolbar />

        {viewMode === 'home' && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6">総量</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  現在の総量: {totalKg} kg / 最大許容量: {MAX_KG} kg
                </Typography>
                <LinearProgress variant="determinate" value={percentage} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  在庫率：{percentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            {/* 注文ページボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={() => router.push('/order')}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0px 3px 6px rgba(0,0,0,0.2)',
                  '&:hover': { boxShadow: '0px 5px 10px rgba(0,0,0,0.25)' },
                }}
              >
                注文ページへ
              </Button>
            </Box>
          </>
        )}

        {viewMode === 'history' && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>取引履歴</Typography>

              {/* フィルターと合計 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {/* 年月フィルター */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small">
                    <InputLabel>年度</InputLabel>
                    <Select
                      value={yearFilter}
                      label="年度"
                      onChange={(e) => setYearFilter(e.target.value as number | 'all')}
                    >
                      <MenuItem value="all">すべて</MenuItem>
                      {[...new Set(orders.map(o => new Date(o.date).getFullYear()))].map(y => (
                        <MenuItem key={y} value={y}>{y}年</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small">
                    <InputLabel>月</InputLabel>
                    <Select
                      value={monthFilter}
                      label="月"
                      onChange={(e) => setMonthFilter(e.target.value as number | 'all')}
                    >
                      <MenuItem value="all">すべて</MenuItem>
                      {[...Array(12)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>{i + 1}月</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* 合計情報 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    {
                      label: '合計精米kg',
                      value: filteredOrders.reduce((sum, o) => sum + (o.polishedKg || 0), 0) + 'kg',
                    },
                    {
                      label: '合計玄米kg',
                      value: filteredOrders.reduce((sum, o) => sum + (o.brownKg || 0), 0) + 'kg',
                    },
                    {
                      label: '総合計kg',
                      value:
                        (filteredOrders.reduce((sum, o) => sum + (o.polishedKg || 0), 0) +
                          filteredOrders.reduce((sum, o) => sum + (o.brownKg || 0), 0)) + 'kg',
                    },
                    {
                      label: '総合計金額',
                      value:
                        filteredOrders
                          .reduce(
                            (sum, o) =>
                              sum +
                              ((o.polishedKg * o.polishedCount * 500 + o.polishedCount * 1000) +
                                (o.brownKg * o.brownCount * 500)),
                            0
                          )
                          .toLocaleString() + '円',
                    },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 0.6,
                        px: 1.2,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1.5,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 130,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#555', fontSize: '0.75rem' }}>{item.label}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#080808', fontSize: '1.05rem' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* 表 */}
              <TableContainer component={Paper}>
                <Table size="small" sx={{ '& td, & th': { fontSize: '1rem' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>日付</TableCell>
                      <TableCell>取引者名</TableCell>
                      <TableCell>精米kg</TableCell>
                      <TableCell>精米金額</TableCell>
                      <TableCell>玄米kg</TableCell>
                      <TableCell>玄米金額</TableCell>
                      <TableCell>合計額</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{dayjs(order.date).format('YYYY年MM月DD日')}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.polishedKg}kg</TableCell>
                        <TableCell>{getPolishedAmount(order).toLocaleString()}円</TableCell>
                        <TableCell>{order.brownKg}kg</TableCell>
                        <TableCell>{getBrownAmount(order).toLocaleString()}円</TableCell>
                        <TableCell>{getTotalAmount(order).toLocaleString()}円</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
