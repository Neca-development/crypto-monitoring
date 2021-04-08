import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { environment } from "./../../environments/environment";
import { IAPIResponse } from "../models/models";

@Injectable({
  providedIn: "root",
})
export class BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {}

  get<T>(url: string, headersObj: any): Promise<T> {
    return this.request(url, "GET", headersObj);
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.request(url, "POST", null, data);
  }

  private async request<T>(
    url: string,
    method: "GET" | "POST" = "GET",
    headersObj: any = null,
    data: any = null
  ): Promise<T> {
    let body;

    const headers = {
      authorization: localStorage.getItem("token") || "",
      ...headersObj,
    };
    if (data) {
      headers["Content-Type"] = "application/json";
      body = data;
    }
    try {
      const response = await this.http
        .request<IAPIResponse<T>>(method, environment.serverUrl + url, {
          headers,
          body,
        })
        .toPromise();
      return response.data;
    } catch (e) {
      const errorObject = e as HttpErrorResponse;
      const errorData = errorObject.error as IAPIResponse<any>;
      if (
        errorData != null &&
        errorData.errorMessage != null &&
        errorData.errorMessage !== ""
      ) {
        this.openSnackBar(errorData.errorMessage, "error");
      } else {
        this.openSnackBar(errorObject.message, "error");
      }

      throw e;
    }
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: "top",
    });
  }
}
