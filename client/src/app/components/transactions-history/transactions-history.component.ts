import {
  Component,
  AfterViewInit,
  ViewChild,
  Input,
  OnInit,
} from "@angular/core";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Transaction } from "src/app/models/models";
import { TransactionService } from "./../../services/transaction.service";
import { ITag } from "./../../models/models";

@Component({
  selector: "app-transactions-history",
  templateUrl: "./transactions-history.component.html",
  styleUrls: ["./transactions-history.component.scss"],
})
export class TransactionsHistoryComponent implements AfterViewInit, OnInit {
  @Input() data: Transaction[];
  @Input() type?: string;
  displayedColumns: string[] = [
    "coin",
    "txHash",
    "from",
    "to",
    "date",
    "type",
    "val",
    "tags",
    "link",
  ];
  dataSource: MatTableDataSource<Transaction>;
  hashTags = new Set();
  dateFilter: Date | string | number;
  tagFilter: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _transactionService: TransactionService) {}

  ngOnInit() {
    this.data.sort((transaction: Transaction, nextTransaction: Transaction) => {
      const transactionTime = new Date(transaction.time);
      const nextTransactionTime = new Date(nextTransaction.time);

      if (transactionTime > nextTransactionTime) {
        return -1;
      } else if (transactionTime < nextTransactionTime) {
        return 1;
      }
      return 0;
    });
    this.dataSource = new MatTableDataSource(this.data);
    this.resetHashtags();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  resetHashtags() {
    this.data.forEach((el: Transaction) => {
      if (el.__hashtags__) {
        el.__hashtags__.forEach((tag: ITag) => {
          this.hashTags.add(tag.text);
        });
      } else {
        el.__hashtags__ = [];
      }
    });
  }

  applyFilter(event: Event) {
    // @ts-ignore
    const filterValue = (event.target as HTMLInputElement).value as Date;
    this.dataSource.data = this.data.filter(
      (t) => new Date(t.time).toDateString() === filterValue.toDateString()
    );
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByTag(event: any) {
    const filterValue = event.value;
    this.dataSource.data = this.data.filter((t: Transaction) => {
      let flag = false;
      t.__hashtags__.forEach((tag) => {
        if (tag.text.includes(filterValue)) {
          flag = true;
        }
      });
      return flag;
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilter() {
    this.dataSource.data = this.data;
    this.dateFilter = "";
    this.tagFilter = "";
  }

  async addTag(
    event: MatChipInputEvent,
    coin: string,
    rowId: number
  ): Promise<void> {
    const input = event.input;
    const value = event.value;

    const tagId = await this._transactionService.addHashtag(rowId, coin, value);
    // Add our fruit
    if ((value || "").trim()) {
      const idx = this.data.findIndex((el: Transaction) => el.id === rowId);
      this.data[idx].__hashtags__.push({ id: tagId, text: value.trim() });
    }
    this.resetHashtags();

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  async removeTag(tag: any, row: number, coin: string): Promise<void> {
    const tagId = tag.id;
    const rowIdx = this.data.findIndex((el: Transaction) => el.id === row);
    const index = this.data[rowIdx].__hashtags__.findIndex(
      (el: any) => el.id === tagId
    );

    await this._transactionService.removeHashtag(tagId, coin);
    console.log(index);

    if (index >= 0) {
      const removed = this.data[rowIdx].__hashtags__.splice(index, 1);
      console.log(removed);
      this.hashTags.delete(tag.text);
    }
  }

  showTagInput(tagArr: any[]) {
    if (!tagArr) {
      return true;
    }
    if (tagArr.length < 3) {
      return true;
    } else {
      return false;
    }
  }
}
