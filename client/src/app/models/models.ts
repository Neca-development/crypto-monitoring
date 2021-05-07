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

export interface Transaction {
  currency: string;
  TXHash: string;
  ToAdress: string;
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
