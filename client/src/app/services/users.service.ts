import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IUser } from "../models/models";
import { BaseRequestService } from "./base-request.service";

@Injectable({
  providedIn: "root",
})
export class UsersService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  async getUsers() {
    return await this.get("/wallet/users", {}, false);
  }

  async getUserById(id: number): Promise<IUser> {
    return await this.get(
      "/wallet/user?fullName=true&addresses=true&balancesSumm=true&balancesSummEur=true&transactions=true&userID=" +
        id,
      null,
      false
    );
  }

  async addUser(user: IUser): Promise<IUser> {
    return await this.post("/auth/admin/client", user, false);
  }

  async removeUser(id: number): Promise<IUser> {
    const user: IUser = await this.delete("/auth/admin/client", { id }, false);
    this._snackBar.open("Removed", null, {
      verticalPosition: "top",
      duration: 2000,
    });
    return user;
  }
}
