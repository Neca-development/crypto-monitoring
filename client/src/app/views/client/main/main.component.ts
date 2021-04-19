import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { IWallet, IUser } from "src/app/models/models";
import { UsersService } from "src/app/services/users.service";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit {
  id: number;
  user: IUser;
  wallets: IWallet[] = [];

  private subscription: Subscription;
  constructor(
    private activateRoute: ActivatedRoute,
    private _usersService: UsersService
  ) {
    this.subscription = activateRoute.params.subscribe(
      (params: any) => (this.id = params["id"])
    );
  }
  ngOnInit(): void {
    this.user = this._usersService.getUserById(+this.id);
    this.wallets = this.wallets.concat(
      this.user.wallets.btcAdresses,
      this.user.wallets.ethAdresses
    );
  }
}
