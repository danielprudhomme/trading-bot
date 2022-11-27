import { ExchangeId } from '../enums/exchange-id';
import ExchangeConfig from './exchange-config';
import { FirebaseAdminSdkConfig } from './firebase-adminsdk-config';

export default interface Config {
  exchanges: Map<ExchangeId, ExchangeConfig>;
  firebaseAdminSdk: FirebaseAdminSdkConfig;
}