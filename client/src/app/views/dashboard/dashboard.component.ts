import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { User } from "src/app/models/models";
import { UsersService } from "./../../services/users.service";
import { AddUserComponent } from "./add-user/add-user.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  users: User[];

  constructor(private _usersService: UsersService, private dialog: MatDialog) {}

  addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: "1000px",
    });
  }

  ngOnInit(): void {
    this.users = this._usersService.getUsers();
  }
}
