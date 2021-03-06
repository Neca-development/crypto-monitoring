import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTableModule } from "@angular/material/table";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatRadioModule } from "@angular/material/radio";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";

import { LoginComponent } from "./views/login/login.component";
import { HeaderComponent } from "./components/header/header.component";
import { DashboardComponent } from "./views/dashboard/dashboard.component";
import { AddUserComponent } from "./views/dashboard/add-user/add-user.component";
import { ClientComponent } from "./views/client/client.component";
import { TransactionsHistoryComponent } from "./components/transactions-history/transactions-history.component";
import { WalletComponent } from "./views/client/wallet/wallet.component";
import { MainComponent } from "./views/client/main/main.component";
import { LoadingService } from "./services/loading.service";
import { HttpRequestInterceptor } from "./http-request-interceptor";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ChartComponent } from "./components/chart/chart.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    DashboardComponent,
    AddUserComponent,
    ClientComponent,
    TransactionsHistoryComponent,
    WalletComponent,
    MainComponent,
    ChartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatSnackBarModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatChipsModule,
    NgxChartsModule,
  ],
  providers: [
    LoadingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
