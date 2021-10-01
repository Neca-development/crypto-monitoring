import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BaseRequestService } from "./base-request.service";
import jwtDecode from "jwt-decode";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IAuthorizedUser } from "../models/models";

@Injectable({
  providedIn: "root",
})
export class SessionService extends BaseRequestService {
  constructor(
    private router: Router,
    public _snackBar: MatSnackBar,
    public http: HttpClient
  ) {
    super(_snackBar, http);
  }

  userJwtData?: any;

  init() {
    const token = localStorage.getItem("token");

    if (token) {
      this.userJwtData = jwtDecode(token);
    }
  }

  async logIn(login: string, password: string): Promise<any> {
    const data: IAuthorizedUser = await this.post(
      "/auth/signin",
      {
        email: login,
        password,
      },
      false
    );
    localStorage.setItem("token", data.accessToken);
    this.userJwtData = jwtDecode(data.accessToken);
    return true;
  }

  logOut() {
    localStorage.removeItem("token");
    this.userJwtData = "";
    this.router.navigateByUrl("login");
  }

  isAuthroized(): boolean {
    return this.userJwtData != null;
  }
}
