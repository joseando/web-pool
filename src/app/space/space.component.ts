import { Component, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.css']
})
export class SpaceComponent implements OnInit {

  tabActive = 3;


  sizeYAxisLabel: string = $localize`Estimated Size`;
  sizeXAxisLabel: string = $localize`Time`;
  sizeLegend: boolean = true;
  sizeLegendTitle: string = '';
  sizeLegendPosition: string = 'below';
  sizeData: any[] = null;


  partialsChartColors = { domain: ['#129b00', '#e00000'] };
  sizeChartColors = { domain: ['#006400', '#9ef01a'] };

  private farmerid: string = '5e8ff6038b3fdebf5f090f685c6ae314aa79d6d5fda9241354e5e4fad60d8938';
  public farmer: any = {};
  constructor(
    private dataService: DataService,
  ) {

  }

  ngOnInit(): void {
    this.getSize(this.farmerid);
  }

  getSize(launcher_id: string) {
    this.dataService.getLauncherSize(launcher_id).subscribe((r) => {
      this.sizeData = [
        {
          "name": $localize`Size (24 hours average)`,
          "series": [],
        },
        {
          "name": $localize`Size (8 hours average)`,
          "series": [],
        },
      ];
      (<any[]>r).map((i) => {
        var where: any[];
        if (i['field'] == 'size') {
          where = this.sizeData[0];
        } else if (i['field'] == 'size_8h') {
          where = this.sizeData[1];
        }
        where['series'].push({
          'name': new Date(i['datetime']).toLocaleString(),
          'value': i['value'],
          'label': where['name'] + ': ' + (i['value'] / 1024 ** 4).toFixed(2).toString() + ' TiB',
        })
      });

    });
  }

  spaceFormatAxisY(spaceData: number) {
    return (spaceData / 1024 ** 4).toFixed(2).toString() + ' TiB';
  }

}
