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
    try {
      await this.sessionService.logIn(this.username, this.password);
    } catch (error) {
      return false;
    }
    this.authLoading = false;
    this.router.navigate(["dashboard"]);
  }
}
