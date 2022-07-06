interface ApiAuth {
  apiKey: string;
  secretKey: string;
}

export interface Config {
  ftx: ApiAuth
}

const config: Config = {
  ftx: {
    apiKey: process.env.FTX_API_KEY as string,
    secretKey: process.env.FTX_SECRET_KEY as string,
  },
};

export { config };
