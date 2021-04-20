import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IWallet } from "src/app/models/models";
import { UsersService } from "src/app/services/users.service";
import { WalletService } from "src/app/services/wallet.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit {
  wallet: IWallet;
  address: "";

  constructor(
    private activateRoute: ActivatedRoute,
    private _walletService: WalletService
  ) {}
  ngOnInit(): void {
    this.address = this.activateRoute.snapshot.params["address"];
    this.wallet = this._walletService.getWalletInfo(this.address);
  }
}
