import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "./../../services/session.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  constructor(private sessionService: SessionService, private router: Router) {}
  username = "";
  password = "";
  authLoading = false;
  hide = true;

  ngOnInit(): void {}

  async logIn() {
    this.authLoading = true;
    const user = {
      login: this.username,
      password: this.password,
    };

    try {
      await this.sessionService.logIn(user);
      this.authLoading = false;
      this.router.navigate(["dashboard"]);
    } catch (error) {
      this.authLoading = false;
    }
  }
}
