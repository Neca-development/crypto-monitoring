import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { IWallet } from "src/app/models/models";
import { UsersService } from "src/app/services/users.service";
import { WalletService } from "src/app/services/wallet.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit {
  address: null;
  wallet: IWallet;

  private subscription: Subscription;
  constructor(
    private activateRoute: ActivatedRoute,
    private _usersService: UsersService,
    private _walletService: WalletService
  ) {
    this.subscription = activateRoute.params.subscribe(
      (params: any) => (this.address = params["address"])
    );
  }
  ngOnInit(): void {
    this.wallet = this._walletService.getWalletInfo(this.address);
  }
}
