import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
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
    private _usersService: UsersService
  ) {}

  ngOnInit(): void {}

  addField(arr: string[]) {
    arr.push("");
  }

  addUser() {
    this._usersService.addUser({
      id: Date.now(),
      fullName: this.fullName,
      wallets: [...this.btcAdresses, ...this.ethAdresses],
    });
    this.dialogRef.close();
  }
}
