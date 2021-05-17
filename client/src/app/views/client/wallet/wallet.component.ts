import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IWallet } from "src/app/models/models";
import { CurrencyService } from "src/app/services/currency.service";
import { UsersService } from "src/app/services/users.service";
import { WalletService } from "src/app/services/wallet.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit {
  wallet: IWallet;
  id: number;
  type: "";
  purchasePrice = 0;
  profitEUR = 0;
  profitPercent = 0;
  ethOrBtc = 0;
  totalBalance: number = 0;

  constructor(
    private activateRoute: ActivatedRoute,
    private _walletService: WalletService,
    private currencyService: CurrencyService
  ) {}
  async ngOnInit() {
    this.id = parseInt(this.activateRoute.snapshot.params["id"], 10);
    this.type = this.activateRoute.snapshot.queryParams["type"];
    this.wallet = await this._walletService.getWalletInfo(this.id, this.type);
    const btcToEUR = await this.currencyService.getBTCtoEUR();
    const ethToEUR = await this.currencyService.getETHtoEUR();
    this.ethOrBtc = this.wallet.type === "ETH" ? ethToEUR : btcToEUR;
    this.calculate();

    this.wallet.erc20tokens.forEach((token: any) => {
      this.totalBalance += token.eur;
    });
    this.totalBalance += this.wallet.balanceEur;
  }

  calculate() {
    this.purchasePrice =
      +this.wallet.mediumBuyPrice * +this.wallet.balance || 0;
    this.profitEUR = +this.wallet.balanceEur - +this.purchasePrice;
    this.profitPercent = (this.profitEUR / this.purchasePrice) * 100;
  }

  colorize(val: number) {
    if (val === 0) {
      return "";
    } else if (val > 0) {
      return "green";
    } else {
      return "red";
    }
  }

  setAverageCost() {
    this._walletService.setAveragePrice(
      this.id,
      this.type,
      +this.wallet.mediumBuyPrice
    );
  }
}
