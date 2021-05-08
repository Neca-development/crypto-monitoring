import {
  Component,
  AfterViewInit,
  ViewChild,
  Input,
  OnInit,
} from "@angular/core";
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
  tags: string[] = ["lorem", "ipsum", "dolor", "sit", "amet"];
  displayedColumns: string[] = [
    "coin",
    "txHash",
    "from",
    "to",
    "date",
    "type",
    "val",
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
    // @ts-ignore
    const filterValue = (event.target as HTMLInputElement).value as Date;
    this.dataSource.data = this.data.filter((t) => new Date(t.time).toDateString() === filterValue.toDateString());
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
