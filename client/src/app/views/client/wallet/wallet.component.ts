import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { UsersService } from "src/app/services/users.service";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit {
  address: null;

  private subscription: Subscription;
  constructor(
    private activateRoute: ActivatedRoute,
    private _usersService: UsersService
  ) {
    this.subscription = activateRoute.params.subscribe(
      (params: any) => (this.address = params["address"])
    );
  }
  ngOnInit(): void {}
}
