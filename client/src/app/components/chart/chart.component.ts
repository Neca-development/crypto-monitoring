import { Component, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgxChartsModule } from "@swimlane/ngx-charts";

@Component({
  selector: "app-chart",
  templateUrl: "chart.component.html",
  styleUrls: ["chart.component.scss"],
})
export class ChartComponent {
  multi: any = [
    {
      name: "Balance",
      series: [
        {
          name: "2021-05-07",
          value: 2.979401596,
        },
        {
          name: "2021-05-06",
          value: 2.979401596,
        },
        {
          name: "2021-05-05",
          value: 2.979401596,
        },
        {
          name: "2021-05-04",
          value: 0,
        },
        {
          name: "2021-05-03",
          value: 0,
        },
        {
          name: "2021-05-02",
          value: 0,
        },
        {
          name: "2021-05-01",
          value: 0,
        },
        {
          name: "2021-04-30",
          value: 0,
        },
        {
          name: "2021-04-29",
          value: 0,
        },
        {
          name: "2021-04-28",
          value: 0,
        },
        {
          name: "2021-04-27",
          value: 0,
        },
        {
          name: "2021-04-26",
          value: 0,
        },
        {
          name: "2021-04-25",
          value: 0,
        },
        {
          name: "2021-04-24",
          value: 0,
        },
        {
          name: "2021-04-23",
          value: 0,
        },
        {
          name: "2021-04-22",
          value: 0,
        },
        {
          name: "2021-04-21",
          value: 0,
        },
        {
          name: "2021-04-20",
          value: 0,
        },
        {
          name: "2021-04-19",
          value: 0,
        },
        {
          name: "2021-04-18",
          value: 0,
        },
        {
          name: "2021-04-17",
          value: 0,
        },
        {
          name: "2021-04-16",
          value: 0,
        },
        {
          name: "2021-04-15",
          value: 0,
        },
        {
          name: "2021-04-14",
          value: 0,
        },
        {
          name: "2021-04-13",
          value: 0,
        },
        {
          name: "2021-04-12",
          value: 0,
        },
        {
          name: "2021-04-11",
          value: 0,
        },
        {
          name: "2021-04-10",
          value: 0,
        },
        {
          name: "2021-04-09",
          value: 0,
        },
        {
          name: "2021-04-08",
          value: 0,
        },
      ],
    },
  ];
  view: any[] = [null, 450];

  // options
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = "Date";
  yAxisLabel = "Value";
  timeline = true;

  colorScheme = {
    domain: ["#5AA454"],
  };

  constructor() {}

  onSelect(data: any): void {
    console.log("Item clicked", JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log("Activate", JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log("Deactivate", JSON.parse(JSON.stringify(data)));
  }
}
