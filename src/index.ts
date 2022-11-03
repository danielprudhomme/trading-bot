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

const tradesRef = db.collection('trades');

const snapshot = await tradesRef.get();
snapshot.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});

const orders = await tradesRef.doc('z8JXdmfrr7UoMtl1fM3F').collection('orders').get();
orders.forEach((doc) => {
  console.log(doc.id, '=>', doc.data());
});

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
