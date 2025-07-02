'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Card, CardContent, LinearProgress, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

const drawerWidth = 240;
const MAX_KG = 7000;

type Order = {
  id: string;
  kg: number;
  status: string;
  customerName: string;
  date: Date | string;
  address: string;
  phone: string;
  pickupDate: any;
  product: string;
  method: string;
  confirmedPickupDate: string;
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [totalKg, setTotalKg] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<'home' | 'reservations' | 'histories'>('home');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const db = getFirestore(app);

  const fetchData = useCallback(async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      let sumKg = 0;
      const allOrders: Order[] = [];

      ordersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (typeof data.kg === 'number') sumKg += data.kg;

        allOrders.push({
          id: docSnap.id,
          kg: data.kg ?? 0,
          status: data.status ?? '',
          customerName: data.name ?? '',
          date: data.createdAt ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          pickupDate: data.pickupDates ?? '',
          product: data.product ?? '',
          method: data.method ?? '',
          confirmedPickupDate: data.confirmedPickupDate ?? '',
        });
      });

      setOrders(allOrders);
      setTotalKg(sumKg);
      setPercentage(Math.min((sumKg / MAX_KG) * 100, 100));
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  }, [db]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [mounted, fetchData]);

  const handleComplete = async (order: Order) => {
    const confirmed = window.confirm(`「${formatName(order.customerName)}」さんの注文を完了にしますか？`);
    if (!confirmed) return;

    try {
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, { status: 'completed' });
      await fetchData();
    } catch (error) {
      console.error('完了処理に失敗しました:', error);
      alert('完了に失敗しました');
    }
  };


  const handleConfirmStatusChange = async () => {
    if (!selectedOrder) return;
    try {
      const docRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(docRef, { status: 'completed' });
      setConfirmOpen(false);
      setSelectedOrder(null);
      await fetchData();
    } catch (error) {
      console.error('ステータス更新エラー:', error);
    }
  };

  const formatDate = (date: any): string => {
    if (Array.isArray(date)) {
      return date
        .map(d => {
          try {
            const dt = d?.toDate ? d.toDate() : new Date(d);
            if (!(dt instanceof Date) || isNaN(dt.getTime())) return null;
            const y = dt.getFullYear();
            const m = ('0' + (dt.getMonth() + 1)).slice(-2);
            const day = ('0' + dt.getDate()).slice(-2);
            return `${y}年${m}月${day}日`;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .join(', ') || '日付なし';
    }
    try {
      const d = date?.toDate ? date.toDate() : new Date(date);
      if (!(d instanceof Date) || isNaN(d.getTime())) return '日付なし';
      const y = d.getFullYear();
      const m = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${y}年${m}月${day}日`;
    } catch {
      return '日付なし';
    }
  };

  const formatName = (name: any): string =>
    typeof name === 'string' && name.trim() !== '' ? name : '名無し';

  if (!mounted) return null;

  const reservations = orders.filter(o => o.status !== 'completed');
  const histories = orders.filter(o => o.status === 'completed');
  const sortByDateDesc = (a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime();
  const reservationsSorted = [...reservations].sort(sortByDateDesc);
  const historiesSorted = [...histories].sort(sortByDateDesc);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" noWrap fontWeight="bold">祖父の蔵</Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton selected={viewMode === 'home'} onClick={() => setViewMode('home')}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="ホーム" />
            </ListItemButton>
            <ListItemButton selected={viewMode === 'reservations'} onClick={() => setViewMode('reservations')}>
              <ListItemIcon><ListAltIcon /></ListItemIcon>
              <ListItemText primary="予約一覧" />
            </ListItemButton>
            <ListItemButton selected={viewMode === 'histories'} onClick={() => setViewMode('histories')}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary="履歴一覧" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

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
              
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="h6">予約（最新5件）</Typography>
              {reservationsSorted.length === 0 ? (
                <Typography>予約はありません</Typography>
              ) : (
                <List dense disablePadding>
                  {reservationsSorted.slice(0, 5).map(order => (
                    <ListItemButton key={order.id} sx={{ py: 0.5 }} divider>
                      <ListItemText
                        primary={`${formatDate(order.date)} - ${formatName(order.customerName)} - ${order.product} - ${order.kg}kg`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
            
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="h6">履歴（最新3件）</Typography>
              {historiesSorted.length === 0 ? (
                <Typography>履歴はありません</Typography>
              ) : (
                <List dense disablePadding>
                  {historiesSorted.slice(0, 3).map(order => (
                    <ListItemButton key={order.id} sx={{ py: 0.5 }} divider>
                      <ListItemText
                        primary={`${formatDate(order.date)} - ${formatName(order.customerName)} - ${order.product} - ${order.kg}kg`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </>
      )}

        {viewMode === 'reservations' && (
          <Card sx={{ mb: 4 }}><CardContent>
            <Typography variant="h6" gutterBottom>予約 一覧</Typography>
            {reservationsSorted.length === 0 ? (
              <Typography>予約はありません</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small"><TableHead><TableRow>
                  <TableCell>注文日</TableCell><TableCell>名前</TableCell><TableCell>商品名</TableCell>
                  <TableCell>kg</TableCell><TableCell>受け取り方法</TableCell><TableCell>住所・希望日</TableCell><TableCell>完了</TableCell>
                </TableRow></TableHead><TableBody>
                  {reservationsSorted.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{formatName(order.customerName)}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.kg}</TableCell>
                      <TableCell>{order.method === 'delivery' ? '配送' : '手渡し'}</TableCell>
                      <TableCell>{order.method === 'delivery' ? order.address : formatDate(order.pickupDate)}</TableCell>
                      <TableCell>
                        
                        {order.status !== 'completed' ? (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handleComplete(order)}
                          >
                            完了
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            完了済
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </TableContainer>
            )}
          </CardContent></Card>
        )}

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>完了にしますか？</DialogTitle>
          <DialogContent>この注文を「履歴」に移動します。</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
            <Button onClick={handleConfirmStatusChange} variant="contained" color="primary">OK</Button>
          </DialogActions>
        </Dialog>

        {viewMode === 'histories' && (
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>履歴 一覧</Typography>
            {historiesSorted.length === 0 ? (
              <Typography>履歴はありません</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small"><TableHead><TableRow>
                  <TableCell>注文日</TableCell><TableCell>名前</TableCell><TableCell>商品名</TableCell>
                  <TableCell>kg</TableCell><TableCell>受け取り方法</TableCell><TableCell>住所・希望日</TableCell>
                </TableRow></TableHead><TableBody>
                  {historiesSorted.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{formatName(order.customerName)}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.kg}</TableCell>
                      <TableCell>{order.method === 'delivery' ? '配送' : '手渡し'}</TableCell>
                      <TableCell>{order.method === 'delivery' ? order.address : formatDate(order.pickupDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </TableContainer>
            )}
          </CardContent></Card>
        )}
      </Box>
    </Box>
  );
}
