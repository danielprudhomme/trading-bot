import firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { ConfigurationManager } from './config/configuration-manager';
import Workspace from './workspace';

ConfigurationManager.load();

Workspace.readOnly = true;

firebase.initializeApp({
  credential: firebase.credential.cert(ConfigurationManager.getFirebaseServiceAccount()),
});

const db = getFirestore();

let t = {
  ticker: {
    asset: 'BTC',
    base: 'USDT',
    exchangeId: 'binance'
  }  
};

const tradesRef = db.collection('trades');

const res = await tradesRef.add(t);

const tradeId = res.id;
const tradeRef = tradesRef.doc(tradeId); // tradesRef.doc('TMVgddXaKPqNWWS9g5y2');
const trade = await tradeRef.get();

t = trade.data() as any;

console.log('trade t', t);

t = { ...t,
  orders:
  [
    { id: 1, quantity: 1, limit: 1000 },
    { id: 2, quantity: 20, limit: 1000 },
    { id: 3, quantity: 30, limit: 1000 },
  ]
} as any;

console.log('trade tt', t);

await tradeRef.set(t);

t = { ...t, orders: [
  { id: 1, quantity: 999, limit: 1000 },
  { id: 2, quantity:999, limit: 1000 },
  { id: 3, quantity: 999, limit: 1000 },
] } as any;

await tradeRef.set(t);

console.log('trade end');

// const snapshot = await tradesRef.get();
// snapshot.forEach((doc) => {
//   console.log(doc.id, '=>', doc.data());
// });

// const orders = await tradesRef.doc('z8JXdmfrr7UoMtl1fM3F').collection('orders').get();
// orders.forEach((doc) => {
//   console.log(doc.id, '=>', doc.data());
// });

// var ordersGroupRef = db.collectionGroup("orders");
// const ordersSnapshot = await ordersGroupRef.get();
// ordersSnapshot.forEach((doc) => {
//   console.log(doc.id, '=>', doc.data());
// });

// const docRef = db.collection('users').doc('alovelace');

// await docRef.set({
//   first: 'Ada',
//   last: 'Lovelace',
//   born: 1815
// });

// const ticker = new Ticker(AssetSymbol.btc, AssetSymbol.usdt, ExchangeId.binance);
// const strategy = new LowOutsideBBStrategy(ticker, TimeFrame.t1h);

// const backtest = new BackTest(
//   strategy,
//   TimeFrame.t15m,
//   '2022-10-27T22:00:00Z',
//   '2022-10-28T10:00:00Z',
// );

// const backtest = new BackTestIndicator(TimeFrame.t1d,
//   '2022-10-04T12:00:00Z',
//   '2022-10-07T00:00:00Z',
//   ticker,
//   new BollingerBands(20, 2.5));

// await backtest.init();
// await backtest.launch();
