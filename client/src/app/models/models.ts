export interface User {
  id: number;
  fullName: string;
  wallets: string[];
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
  id: number;
  role: string;
  token: string;
}

export interface IAPIResponse<T> {
  data?: T;
  errorMessage?: string;
  status: any;
}
