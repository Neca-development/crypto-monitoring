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

  fakeUsers: IUser[] = [
    {
      id: 1,
      fullName: "Dante Alighieri",
      wallets: {
        btcAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],

        ethAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],
      },
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
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
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],

        ethAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],
      },
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
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
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],

        ethAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],
      },
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
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
          { value: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],

        ethAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],
      },
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "2JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
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
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],

        ethAdresses: [
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
          { value: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV" },
        ],
      },
      transactions: [
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "ETH",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "In",
        },
        {
          currency: "BTC",
          date: new Date(),
          TXHash:
            "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
          ToAdress: "1JbM7yFVCT8e1sxZFa5sa7VEqCGCJVXQVV",
          type: "Out",
        },
      ],
    },
  ];

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

  removeUser(id: number) {
    const idx = this.fakeUsers.findIndex((el) => el.id === id);
    this.fakeUsers.splice(idx, 1);
  }

  updateUser(user: IUser) {
    const idx = this.fakeUsers.findIndex((el) => el.id === user.id);
    this.fakeUsers[idx] = user;
  }
}
