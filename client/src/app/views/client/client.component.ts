import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { UsersService } from "./../../services/users.service";
import { IWallet, User } from "src/app/models/models";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-client",
  templateUrl: "./client.component.html",
  styleUrls: ["./client.component.scss"],
})
export class ClientComponent implements OnInit {
  id: number;
  user: User;
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
