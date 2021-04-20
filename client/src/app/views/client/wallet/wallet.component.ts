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
  id: "";
  type: "";

  constructor(
    private activateRoute: ActivatedRoute,
    private _walletService: WalletService
  ) {}
  async ngOnInit() {
    this.id = this.activateRoute.snapshot.params["id"];
    this.type = this.activateRoute.snapshot.queryParams["type"];
    this.wallet = await this._walletService.getWalletInfo(this.id, this.type);
  }
}
