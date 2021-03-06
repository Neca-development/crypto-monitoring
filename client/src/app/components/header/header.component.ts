import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  constructor(public location: Location, public router: Router) {}

  ngOnInit(): void {}

  logout() {
    this.router.navigate(["login"]);
  }
}
