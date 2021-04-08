import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { User } from "../models/models";
import { BaseRequestService } from "./base-request.service";

@Injectable({
  providedIn: "root",
})
export class UsersService extends BaseRequestService {
  constructor(public _snackBar: MatSnackBar, public http: HttpClient) {
    super(_snackBar, http);
  }

  fakeUsers: User[] = [
    {
      id: 1,
      FirstName: "Dante",
      SecondName: "Alighieri",
      wallets: [
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
      ],
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
    {
      id: 2,
      FirstName: "Troy",
      SecondName: "Yates",
      wallets: [
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
      ],
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
    {
      id: 3,
      FirstName: "Heather",
      SecondName: "Graham",
      wallets: [
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
      ],
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
    {
      id: 4,
      FirstName: "Aimee",
      SecondName: "Pearce",
      wallets: [
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
      ],
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
    {
      id: 5,
      FirstName: "Gracie",
      SecondName: "Hensley",
      wallets: [
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
      ],
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash: "asd3423423sdfsdf",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
  ];

  getUsers() {
    return this.fakeUsers;
  }
}
