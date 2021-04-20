import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { IUser } from "src/app/models/models";
import { UsersService } from "./../../services/users.service";
import { AddUserComponent } from "./add-user/add-user.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  users: any;

  constructor(private _usersService: UsersService, private dialog: MatDialog) {}

  async addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      maxHeight: "80vh",
      width: "1000px",
    });
    await dialogRef.afterClosed().toPromise();
    this.users = await this._usersService.getUsers();
  }

  async ngOnInit() {
    this.users = await this._usersService.getUsers();
  }

  removeUser(id: number) {
    // this._usersService.removeUser(id);
  }

  async editUser(user: IUser) {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: "1000px",
      maxHeight: "80vh",
      data: user,
    });
    await dialogRef.afterClosed().toPromise();
  }
}
