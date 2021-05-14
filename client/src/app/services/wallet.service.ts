import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IWallet } from "../models/models";
import { BaseRequestService } from "./base-request.service";

@Injectable({
  providedIn: "root",
})
export class WalletService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  async getWalletInfo(address: number, type: string): Promise<IWallet> {
    return await this.get(
      `/wallet?walletID=${address}&type=${type}&holderName=true&transactions=true&balanceInEur=true&hashtags=true&erc20tokens=true&balanceHistory=true`,
      null,
      false
    );
  }

  async addWallet(address: string, userID: number, type: string) {
    return await this.post("/wallet", { userID, address, type }, false);
  }

  async getAllStats() {
    return await this.get(
      "/wallet/stats?ethBalanceSumm=true&ethBalanceSummEur=true&btcBalanceSumm=true&btcBalanceSummEur=true&erc20BalancesSummEur=true",
      null,
      false
    );
  }

  async setAveragePrice(walletID: number, type: string, price: number) {
    return await this.post(
      "/wallet/mediumBuyPrice",
      { walletID, type, price },
      false
    );
  }
}
