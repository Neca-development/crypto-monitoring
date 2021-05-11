import {
  Component,
  AfterViewInit,
  ViewChild,
  Input,
  OnInit,
} from "@angular/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Transaction } from "src/app/models/models";

@Component({
  selector: "app-transactions-history",
  templateUrl: "./transactions-history.component.html",
  styleUrls: ["./transactions-history.component.scss"],
})
export class TransactionsHistoryComponent implements AfterViewInit, OnInit {
  @Input() data: Transaction[];
  @Input() type?: string;
  tags: string[] = ["lorem", "ipsum", "dolor"];
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
  constructor() {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || "").trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  remove(tag: any): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
}
