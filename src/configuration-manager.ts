import dotenv from 'dotenv';

interface ApiAuth {
  apiKey: string;
  secretKey: string;
}

export interface Config {
  binance: ApiAuth;
  ftx: ApiAuth;
}

export class ConfigurationManager {
  private static _config: Config | null = null;
  static get config(): Config {
    if (!ConfigurationManager._config) throw new Error('Please load configuration before accessing it.');
    return ConfigurationManager._config;
  }

  static load() {
    dotenv.config();

    ConfigurationManager._config = {
      binance: {
        apiKey: process.env.BINANCE_API_KEY as string,
        secretKey: process.env.BINANCE_API_SECRET as string,
      },
      ftx: {
        apiKey: process.env.FTX_API_KEY as string,
        secretKey: process.env.FTX_API_SECRET as string,
      },
    };
  }
}

