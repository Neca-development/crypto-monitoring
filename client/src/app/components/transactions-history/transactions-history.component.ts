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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _transactionService: TransactionService) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  async removeTag(tagId: any, row: number, coin: string): Promise<void> {
    const rowIdx = this.data.findIndex((el: Transaction) => el.id === row);
    const index = this.data[rowIdx].__hashtags__.findIndex(
      (el: any) => el.id === tagId
    );

    await this._transactionService.removeHashtag(tagId, coin);
    console.log(index);

    if (index >= 0) {
      this.data[rowIdx].__hashtags__.splice(index, 1);
    }
  }
}
