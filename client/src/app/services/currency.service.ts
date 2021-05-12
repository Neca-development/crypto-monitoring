import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BTCResponse, ETHResponse } from "../models/models";
import { BaseRequestService } from "./base-request.service";

@Injectable({
  providedIn: "root",
})
export class CurrencyService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  async getBTCtoEUR() {
    const response = await this.http
      .get<BTCResponse>(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR"
      )
      .toPromise();
    console.log("fetched", response);
    return response.bitcoin.eur;
  }

  async getETHtoEUR() {
    const response = await this.http
      .get<ETHResponse>(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=EUR"
      )
      .toPromise();
    console.log("fetched", response);
    return response.ethereum.eur;
  }
}
