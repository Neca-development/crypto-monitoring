import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Transaction } from "../models/models";
import { BaseRequestService } from "./base-request.service";

@Injectable({
  providedIn: "root",
})
export class TransactionService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  async addHashtag(
    transactionID: number,
    type: string,
    text: string
  ): Promise<number> {
    const transaction: Transaction = await this.post(
      "/wallet/transaction/hashtag",
      {
        transactionID,
        type,
        text,
      },
      false
    );
    console.log(transaction);
    return transaction.id;
  }
  async removeHashtag(hashtagID: number, type: string) {
    return await this.delete(
      "/wallet/transaction/hashtag",
      {
        hashtagID,
        type,
      },
      false
    );
  }
}
