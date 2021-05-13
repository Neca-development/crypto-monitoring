import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-chart",
  templateUrl: "chart.component.html",
  styleUrls: ["chart.component.scss"],
})
export class ChartComponent implements OnInit {
  multi: any = [];
  view: any[] = [null, 450];

  // options
  legend = false;
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

  @Input() data: any;

  constructor() {}

  ngOnInit() {
    if (length in this.data) {
      console.log(true);
      this.multi.push({
        name: "Balance",
        series: this.converteData(this.data),
      });
    } else {
      for (const balance in this.data) {
        if (Object.prototype.hasOwnProperty.call(this.data, balance)) {
          const element = this.data[balance];
          this.multi.push({
            name: "Balance " + balance,
            series: this.converteData(element),
          });
        }
      }
    }
  }

  converteData(data: any[]) {
    data.reverse();
    data = data.map((el: any) => {
      const date: Date = new Date(el.date);
      el.name = date.getDate() + "/" + date.getMonth();
      return el;
    });
    return data;
  }
}
