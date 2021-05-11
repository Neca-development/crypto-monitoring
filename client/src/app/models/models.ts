export interface IUser {
  id?: number;
  fullName: string;
  wallets?: IWallet[];
  transactions?: Transaction[];
}

export interface IWallet {
  address: string;
  holderName?: string;
  balance?: string;
  balanceEur?: any;
  type?: string;
  transactions?: Transaction[];
}

export interface ITag {
  id: number;
  text: string;
}

export interface Transaction {
  id: number;
  currency: string;
  TXHash: string;
  ToAdress: string;
  __hashtags__: ITag[];
  date: Date;
  type: "In" | "Out";
  time: string;
}

export interface IAuthorizedUser {
  accessToken: string;
  refreshToken: string;
}

export interface IAPIResponse<T> {
  data?: T;
  errorMessage?: string;
  status: any;
}

export interface BTCResponse {
  bitcoin: {
    eur: number;
  }
}

export interface ETHResponse {
  ethereum: {
    eur: number;
  }
}