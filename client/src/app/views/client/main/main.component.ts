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
  user: any;

  constructor(
    private activateRoute: ActivatedRoute,
    private _usersService: UsersService
  ) {}
  async ngOnInit() {
    this.id = this.activateRoute.snapshot.params["id"];
    this.user = await this._usersService.getUserById(+this.id);
  }
}
