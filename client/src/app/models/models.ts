export interface IUser {
  id?: number;
  fullName: string;
  wallets?: {
    btcAdresses: IWallet[];
    ethAdresses: IWallet[];
  };
  transactions?: Transaction[];
}

export interface IWallet {
  address: string;
  holderName?: string;
  type?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  currency: string;
  TXHash: string;
  ToAdress: string;
  date: Date;
  type: "In" | "Out";
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
