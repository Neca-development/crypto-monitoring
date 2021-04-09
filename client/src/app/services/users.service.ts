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
      fullName: "Dante Alighieri",
      wallets: {
        btcAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],

        ethAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],
      },
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
      fullName: "Troy Yates",
      wallets: {
        btcAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],

        ethAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],
      },
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
      fullName: "Heather Graham",
      wallets: {
        btcAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],

        ethAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],
      },
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
      fullName: "Aimee Pearce",
      wallets: {
        btcAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],

        ethAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],
      },
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
      fullName: "Gracie Hensley",
      wallets: {
        btcAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],

        ethAdresses: [
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
        ],
      },
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

  addUser(user: User) {
    this.fakeUsers.push(user);
  }

  removeUser(id: number) {
    const idx = this.fakeUsers.findIndex((el) => el.id === id);
    this.fakeUsers.splice(idx, 1);
  }

  updateUser(user: User) {
    console.log(user);
    const idx = this.fakeUsers.findIndex((el) => el.id === user.id);
    console.log(idx);
    this.fakeUsers[idx] = user;
  }
}
