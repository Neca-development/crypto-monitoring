import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClientComponent } from "./views/client/client.component";
import { DashboardComponent } from "./views/dashboard/dashboard.component";
import { LoginComponent } from "./views/login/login.component";
import { WalletComponent } from "./views/client/wallet/wallet.component";
import { MainComponent } from "./views/client/main/main.component";

const clientRoutes = [
  { path: "", component: MainComponent },
  { path: "wallet", component: WalletComponent },
];

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "client/:id", component: ClientComponent, children: clientRoutes },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
