import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { IUser, IWallet } from "src/app/models/models";
import { WalletService } from "src/app/services/wallet.service";
import { UsersService } from "./../../services/users.service";
import { AddUserComponent } from "./add-user/add-user.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  searchVal: string;
  users: any;
  stats: any;

  constructor(
    private _usersService: UsersService,
    private _walletService: WalletService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.users = await this._usersService.getUsers();
    this.stats = await this._walletService.getAllStats();
  }

  async addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      maxHeight: "80vh",
      width: "1000px",
    });
    await dialogRef.afterClosed().toPromise();
    this.users = await this._usersService.getUsers();
  }

  async removeUser(id: number) {
    await this._usersService.removeUser(id);
    this.users = await this._usersService.getUsers();
  }

  async editUser(user: IUser) {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: "1000px",
      maxHeight: "80vh",
      data: user,
    });
    await dialogRef.afterClosed().toPromise();
  }

  async search() {
    console.log(this.searchVal);
    if (!this.searchVal) {
      this.users = await this._usersService.getUsers();
    }
    this.users = this.users.filter((el: IUser) => {
      let bool = false;
      const name = el.fullName.toLocaleLowerCase();
      if (name.includes(this.searchVal.toLocaleLowerCase())) {
        bool = true;
      }
      el.wallets.forEach((element: IWallet) => {
        const wallet = element.address.toLocaleLowerCase();
        console.log(wallet);
        if (wallet.includes(this.searchVal.toLocaleLowerCase())) {
          bool = true;
        }
      });
      return bool;
    });
  }
}
