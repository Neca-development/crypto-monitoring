import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/models";
import { UsersService } from "./../../services/users.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  constructor(private _usersService: UsersService) {}
  users: User[];
  ngOnInit(): void {
    this.users = this._usersService.getUsers();
  }
}
