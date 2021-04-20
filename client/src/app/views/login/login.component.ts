import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "./../../services/session.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  username = "";
  password = "";
  authLoading = false;
  showPassword = false;

  constructor(private sessionService: SessionService, private router: Router) {}

  ngOnInit(): void {}

  async logIn() {
    this.authLoading = true;

    await this.sessionService.logIn({
      login: this.username,
      password: this.password,
    });
    this.authLoading = false;
    this.router.navigate(["dashboard"]);
  }
}
