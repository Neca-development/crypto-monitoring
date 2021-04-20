import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { IWallet, IUser } from "src/app/models/models";
import { WalletService } from "src/app/services/wallet.service";
import { UsersService } from "./../../../services/users.service";

@Component({
  selector: "app-add-user",
  templateUrl: "./add-user.component.html",
  styleUrls: ["./add-user.component.scss"],
})
export class AddUserComponent implements OnInit {
  fullName: string;
  btcAdresses: IWallet[] = [{ address: "", type: "BTC" }];
  ethAdresses: IWallet[] = [{ address: "", type: "ETH" }];

  constructor(
    private dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IUser,
    private _usersService: UsersService,
    private _walletService: WalletService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.fullName = this.data.fullName;
      this.btcAdresses = this.data.wallets.btcAdresses;
      this.ethAdresses = this.data.wallets.ethAdresses;
    }
  }

  addField(wallet: IWallet[], type: string) {
    wallet.push({ address: "", type });
  }

  submit() {
    this.data ? this.updateUser() : this.addUser();
  }

  async addUser() {
    const user: IUser = await this._usersService.addUser({
      fullName: this.fullName,
    });

    console.log(user);

    this.btcAdresses.forEach(async (el) => {
      await this._walletService.addWallet(el.address, user.id, el.type);
    });
    this.ethAdresses.forEach(async (el) => {
      await this._walletService.addWallet(el.address, user.id, el.type);
    });
    this.dialogRef.close();
  }

  updateUser() {
    // this._usersService.updateUser({
    //   ...this.data,
    //   fullName: this.fullName,
    //   wallets: {
    //     btcAdresses: this.btcAdresses,
    //     ethAdresses: this.ethAdresses,
    //   },
    // });
    this.dialogRef.close();
  }
}
