import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { User, IAuthorizedUser } from "../models/models";
import { BaseRequestService } from "./base-request.service";
import jwtDecode from "jwt-decode";
import { MatSnackBar } from "@angular/material/snack-bar";

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

  async logIn(user: { login: string; password: string }): Promise<any> {
    // const data = await this.post<IAuthorizedUser>("/login", user);
    const data = {
      token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImY4ZWFlYTI0LWExMTgtNGI4Yy05ODA4LTIxOGM1OTE0NTBmOCIsImlhdCI6MTYxNzg3MDY1MywiZXhwIjoxNjE3ODc0MjUzfQ._yx-t8YvfwbgswTr_Vn3MpHGR2BX8C9Ln57FoqOvQy4",
    };
    localStorage.setItem("token", data.token);
    this.userJwtData = jwtDecode(data.token);
    return this.userJwtData;
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
