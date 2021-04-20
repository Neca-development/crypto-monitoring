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

  get<T>(url: string, headersObj: any, useDataWrapper = true): Promise<T> {
    return this.request(url, "GET", headersObj, null, useDataWrapper);
  }

  post<T>(url: string, data: any, useDataWrapper = true): Promise<T> {
    return this.request(url, "POST", null, data, useDataWrapper);
  }

  private async request<T>(
    url: string,
    method: "GET" | "POST" = "GET",
    headersObj: any = {},
    data: any = null,
    useDataWrapper = true
  ): Promise<T> {
    let body;

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}` || "",
      ...headersObj,
    };
    if (data) {
      headers["Content-Type"] = "application/json";
      body = data;
    }
    try {
      if (useDataWrapper) {
        const response = await this.http
          .request<IAPIResponse<T>>(method, environment.serverUrl + url, {
            headers,
            body,
          })
          .toPromise();
        return response.data;
      } else {
        const response = await this.http
          .request<T>(method, environment.serverUrl + url, {
            headers,
            body,
          })
          .toPromise();
        return response;
      }
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
