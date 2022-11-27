import dotenv from 'dotenv';
import firebase from 'firebase-admin';
import { ExchangeId } from '../enums/exchange-id';
import Config from './config';
import ExchangeConfig from './exchange-config';

export class ConfigurationManager {
  private static _config: Config | null = null;

  private static get config(): Config {
    if (!this._config) throw new Error('Please load configuration before accessing it.');
    return this._config;
  }

  static load() {
    dotenv.config();

    ConfigurationManager._config = {
      exchanges: new Map<ExchangeId, ExchangeConfig>([
        [
          'binance',
          { apiKey: process.env.BINANCE_API_KEY as string,
            secretKey: process.env.BINANCE_API_SECRET as string }
        ],
      ]),
      firebaseAdminSdk: {
        type: 'service_account',
        projectId: 'trading-bot-d6ddc',
        privateKeyId: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID as string,
        privateKey: process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY as string,
        clientEmail: 'firebase-adminsdk-nhmqz@trading-bot-d6ddc.iam.gserviceaccount.com',
        clientId: '100838424647434949829',
        authUri: 'https://accounts.google.com/o/oauth2/auth',
        tokenUri: 'https://oauth2.googleapis.com/token',
        authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
        clientX509CertUrl: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nhmqz%40trading-bot-d6ddc.iam.gserviceaccount.com'
      }
    };
  }

  static getExchangeConfig(exchangeId: ExchangeId): ExchangeConfig {
    const exchangeConfig = this.config.exchanges.get(exchangeId);
    if (!exchangeConfig) throw new Error(`No configuration have been found for exchange ${exchangeId}.`);
    return exchangeConfig;
  }

  static getFirebaseServiceAccount = (): firebase.ServiceAccount => ({
    clientEmail: this.config.firebaseAdminSdk.clientEmail,
    projectId: this.config.firebaseAdminSdk.projectId,
    privateKey: this.config.firebaseAdminSdk.privateKey.replace(/\\n/gm, "\n")
  });
}

