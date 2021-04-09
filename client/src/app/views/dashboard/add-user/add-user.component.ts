import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { User } from "src/app/models/models";
import { UsersService } from "./../../../services/users.service";

@Component({
  selector: "app-add-user",
  templateUrl: "./add-user.component.html",
  styleUrls: ["./add-user.component.scss"],
})
export class AddUserComponent implements OnInit {
  fullName: string;
  btcAdresses: string[] = [""];
  ethAdresses: string[] = [""];

  constructor(
    private dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private _usersService: UsersService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.fullName = this.data.fullName;
      this.btcAdresses = this.data.wallets.btcAdresses;
      this.ethAdresses = this.data.wallets.ethAdresses;
    }
  }

  addField(wallet: string[]) {
    wallet.push("");
  }

  submit() {
    this.data ? this.updateUser() : this.addUser();
  }

  addUser() {
    this._usersService.addUser({
      id: Date.now(),
      fullName: this.fullName,
      wallets: {
        btcAdresses: this.btcAdresses,
        ethAdresses: this.ethAdresses,
      },
    });
    this.dialogRef.close();
  }

  updateUser() {
    this._usersService.updateUser({
      ...this.data,
      fullName: this.fullName,
      wallets: {
        btcAdresses: this.btcAdresses,
        ethAdresses: this.ethAdresses,
      },
    });
    this.dialogRef.close();
  }
}
