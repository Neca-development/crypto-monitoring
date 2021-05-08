import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IWallet } from "src/app/models/models";
import { CurrencyService } from 'src/app/services/currency.service';
import { UsersService } from "src/app/services/users.service";
import { WalletService } from "src/app/services/wallet.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit {
  wallet: IWallet;
  id: "";
  type: "";
  averageCost = '';
  purchasePrice = 0;
  profitEUR = 0;
  profitPercent = 0;
  ethOrBtc = 0;

  constructor(
    private activateRoute: ActivatedRoute,
    private _walletService: WalletService,
    private currencyService: CurrencyService
  ) {}
  async ngOnInit() {
    this.id = this.activateRoute.snapshot.params["id"];
    this.type = this.activateRoute.snapshot.queryParams["type"];
    this.wallet = await this._walletService.getWalletInfo(this.id, this.type);
    const btcToEUR = await this.currencyService.getBTCtoEUR();
    const ethToEUR = await this.currencyService.getETHtoEUR();
    console.log('fetched', btcToEUR, ethToEUR);
    this.ethOrBtc = this.wallet.type === "ETH" ? ethToEUR : btcToEUR;
  }

  calculate() {
    console.log('average cost', this.averageCost);
    this.purchasePrice = +this.averageCost * +this.wallet.balance || 0;
    console.log('crypto:', this.ethOrBtc);
    this.profitEUR = this.ethOrBtc - +this.purchasePrice;
    this.profitPercent = this.profitEUR / this.ethOrBtc * 100;
    console.log(this.wallet);
  }
}
