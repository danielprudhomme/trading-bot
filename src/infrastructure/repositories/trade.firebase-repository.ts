import Trade from '../../models/trade';
import TradeRepository from './trade.repository';

export default class TradeFirebaseRepository extends TradeRepository {
  db: FirebaseFirestore.Firestore;
  collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(db: FirebaseFirestore.Firestore) {
    super();
    this.db = db;
    this.collectionRef = this.db.collection('trades');
  }

  async getAll(): Promise<Trade[]> {
    const snapshot = await this.collectionRef.get();
    return this.mapSnapshot(snapshot);
  }

  async getAllOpen(): Promise<Trade[]> {
    const snapshot = await this.collectionRef.where('isOpen', '==', true).get();
    return this.mapSnapshot(snapshot);
  }

  async insert(trade: Trade): Promise<string> {
    const entity = this.mapToDatabaseEntity(trade);
    const res = await this.collectionRef.add(entity);
    return res.id;
  }     

  async updateMultiple(trades: Trade[]): Promise<void> {
    if (trades.length === 0) return;
    const batch = this.db.batch();

    trades.forEach(trade => {
      const entity = this.mapToDatabaseEntity(trade);

      const tradeRef = this.collectionRef.doc(entity.id);
      batch.update(tradeRef, { ...entity });
    });

    await batch.commit();
  }

  private mapSnapshot(snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): Trade[] {
    if (snapshot.empty) return [];
    
    const trades: Trade[] = [];
    snapshot.forEach(doc => {
      const trade = this.mapToDomainObject(doc.data() as Trade);
      trades.push(trade);
    });
    return trades;
  }

  async deleteAll(): Promise<void> {
    const snapshot = await this.collectionRef.get();

    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}