import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
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

  constructor(
    private activateRoute: ActivatedRoute,
    private _usersService: UsersService
  ) {}
  ngOnInit(): void {
    this.id = this.activateRoute.snapshot.params["id"];
    this.user = this._usersService.getUserById(+this.id);
    this.wallets = this.wallets.concat(
      this.user.wallets.btcAdresses,
      this.user.wallets.ethAdresses
    );
  }
}
