import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service'
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { ClipboardService } from 'ngx-clipboard';
import { humanizer } from 'humanize-duration';

@Component({
  selector: 'app-partials',
  templateUrl: './partials.component.html',
  styleUrls: ['./partials.component.css']
})

export class PartialsComponent implements OnInit {

  tabActive = 1;

  partialsYAxisLabel: string = $localize`Last Partials (24 hours)`;
  partialsXAxisLabel: string = $localize`Time`;

  partialsGradient: boolean = true;
  partialsData: any[] = null;
  partialsXTicks: any[] = [];
  partialsTable: any[] = [];
  partialsFiltered: any[] = [];
  partialsCollectionSize: number = 0;
  partialsPage: number = 1;
  partialsPageSize: number = 100;
  partialsSuccessful: number = 0;
  partialsFailed: number = 0;
  partialsPoints: number = 0;
  failedPartials: boolean = false;

  harvesterYAxisLabel: string = $localize`Partials`;
  harvesterXAxisLabel: string = $localize`Time`;
  harvesterXTicks: any[] = [];
  perHarvesterData: Map<String, object> = new Map();

  sizeYAxisLabel: string = $localize`Estimated Size`;
  sizeXAxisLabel: string = $localize`Time`;
  sizeLegend: boolean = true;
  sizeLegendTitle: string = '';
  sizeLegendPosition: string = 'below';
  sizeData: any[] = null;

  rewardsYAxisLabel: string = $localize`Daily Amount`;
  rewardsXAxisLabel: string = $localize`Day`;
  rewardsData: any[] = null;
  rewardsChartColors = { domain: ['#006400'] };

  harvesters: Set<string> = new Set();

  xch_current_price_usd: number = 0;
  xch_tb_month: number = 0;

  payoutaddrs$: Observable<any[]>;
  _payoutaddrs$ = new BehaviorSubject<any[]>([]);
  payoutsCollectionSize: number = 0;
  payoutsPage: number = 1;
  payoutsPageSize: number = 25;
  payoutsCountTotal: number = 0;
  payoutsAmountTotal: number = 0;

  payouttxs$: Observable<any[]>;
  _payouttxs$ = new BehaviorSubject<any[]>([]);
  payouttxsCollectionSize: number = 0;
  payouttxsPage: number = 1;
  payouttxsPageSize: number = 25;
  payouttxsCountTotal: number = 0;
  payouttxsAmountTotal: number = 0;

  blocks$: Observable<any[]>;
  _blocks$ = new BehaviorSubject<any[]>([]);
  blocksCollectionSize: number = 0;
  blocksPage: number = 1;
  blocksPageSize: number = 25;

  giveaways$: Observable<any[]>;

  ticketsRound$: Observable<any[]>;

  partialsChartColors = { domain: ['#129b00', '#e00000'] };
  sizeChartColors = { domain: ['#006400', '#9ef01a'] };

  private farmerid: string = '5e8ff6038b3fdebf5f090f685c6ae314aa79d6d5fda9241354e5e4fad60d8938';
  public farmer: any = {};

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private modal: NgbModal,
    private clipboardApi: ClipboardService
  ) {
    this.blocks$ = this._blocks$.asObservable();
    this.payoutaddrs$ = this._payoutaddrs$.asObservable();
    this.payouttxs$ = this._payouttxs$.asObservable();
  }

  ngOnInit(): void {
    this.dataService.getLauncher(this.farmerid).subscribe(launcher => {
      this.farmer = launcher;
      this.getPartialsData(this.farmerid);
      this.getSize(this.farmerid);
      this.getHarvesters(this.farmerid);
      this.getRewards();
    });
  }

  humanize(seconds: number) {
    var h = humanizer();
    return h(seconds);
  }

  _handlePartial(subscriber, data, successes, errors, hours) {

    this.partialsTable = this.partialsTable.concat(data['results']);
    data['results'].forEach(v => {
      this.harvesters.add(v['harvester_id']);
      var hour = Math.floor(v['timestamp'] / 3600) * 3600;
      hours.add(hour);

      if (v.error === null) {
        this.partialsSuccessful++;
        this.partialsPoints += v['difficulty'];
        errors.set(hour, (errors.get(hour) || 0))
        successes.set(hour, (successes.get(hour) || 0) + 1)
      } else {
        this.partialsFailed++;
        errors.set(hour, (errors.get(hour) || 0) + 1)
        successes.set(hour, (successes.get(hour) || 0))
      }

    });

    if (data['next']) {
      this.dataService.getNext(data['next']).subscribe(
        (data) => { this._handlePartial(subscriber, data, successes, errors, hours); }
      );
    } else {
      subscriber.complete();
      this.filterPartials();
    }

  }

  payoutDownloadCSV() {
    this.dataService.getPayoutTxs({ launcher: this.farmerid, limit: 800 }).subscribe(res => {

      // FIXME: get next pages if count is > limit (800)
      let csv_array = [];
      const out = Object.keys(res['results']).map(index => {
        let data = res['results'][index];
        csv_array.push({
          datetime: data['created_at_time'],
          transaction: data['transaction_name'],
          amount: data['amount'] / 1000000000000,
          price: (data['xch_price']) ? data['xch_price']['usd'] * (data['amount'] / 1000000000000) : "",
        });
      });
      var options = {
        headers: ["Datetime", "Transaction", "Amount", "Price USD"]
      };
      new AngularCsv(csv_array, 'payouts', options);
    });
  }

  getRewards() {
    this.rewardsData = Array.from(this.farmer.rewards.last_per_day, (i, idx) => {
      return { "name": i['day'], "value": i['amount'] };
    });
  }

  private handleBlocks(data) {
    this.blocksCollectionSize = data['count'];
    this._blocks$.next(data['results']);
  }

  refreshBlocks() {
    this.dataService.getBlocks({
      launcher: this.farmerid,
      offset: (this.blocksPage - 1) * this.blocksPageSize,
      limit: this.blocksPageSize
    }).subscribe(data => this.handleBlocks(data));
  }

  private handlePayouts(data) {
    this.payoutsCollectionSize = data['count'];
    this._payoutaddrs$.next(data['results']);
  }

  refreshPayouts() {
    this.dataService.getPayoutAddrs({
      launcher: this.farmerid,
      offset: (this.payoutsPage - 1) * this.payoutsPageSize,
      limit: this.payoutsPageSize
    }).subscribe(data => this.handlePayouts(data));
  }

  private handlePayoutTxs(data) {
    this.payouttxsCollectionSize = data['count'];
    this._payouttxs$.next(data['results']);
  }

  refreshPayoutTxs() {
    this.dataService.getPayoutTxs({
      launcher: this.farmerid,
      offset: (this.payouttxsPage - 1) * this.payouttxsPageSize,
      limit: this.payouttxsPageSize
    }).subscribe(data => this.handlePayoutTxs(data));
  }

  toggleFailedPartials(event): void {
    this.failedPartials = event.target.checked;
    this.filterPartials();
  }

  filterPartials() {
    if (this.failedPartials) {
      this.partialsFiltered = this.partialsTable.filter(entry => entry.error !== null)
    } else {
      this.partialsFiltered = [...this.partialsTable];
    }
  }

  getPartialsData(launcher_id) {

    var successes = new Map();
    var errors = new Map();
    var hours = new Set();

    this.partialsTable = [];
    this.partialsFiltered = [];
    this.harvesters.clear();

    var obs = new Observable(subscriber => {
      this.dataService.getPartials(launcher_id).subscribe((data) => {
        this.partialsCollectionSize = data['count'];
        this._handlePartial(subscriber, data, successes, errors, hours);
      });
    });

    obs.subscribe(
      (x) => { },
      (err) => { console.error('something wrong occurred: ' + err); },
      () => {

        this.partialsXTicks = Array.from(hours);

        this.partialsData = [
          {
            "name": $localize`Successful Partials`,
            "series": Array.from(successes, (i, idx) => {
              return { "name": i[0], "value": i[1] };
            }),
          },
          {
            "name": $localize`Failed Partials`,
            "series": Array.from(errors, (i, idx) => {
              return { "name": i[0], "value": i[1] };
            }),
          },
        ];

      }
    );

  }

  getHarvesters(launcher_id) {
    var xTicks: Set<number> = new Set();
    this.perHarvesterData.clear();
    this.dataService.getPartialsTs({ launcher: launcher_id }).subscribe((d) => {
      (<any[]>d).forEach(i => {

        var harvester = this.perHarvesterData.get(i['harvester']);
        if (!harvester) {
          harvester = {
            'points_total': 0,
            'partials_failed': 0,
            'partials_success': 0,
            'data': [
              {
                "name": $localize`Successful Partials`,
                "series": [],
              },
              {
                "name": $localize`Failed Partials`,
                "series": [],
              },
            ]
          };
          this.perHarvesterData.set(i['harvester'], harvester);
        }
        if (i['result'] == 'count') {
          var date = new Date(i['datetime']);
          var hour = Math.floor(date.getTime() / (3600 * 1000)) * 3600;
          xTicks.add(hour);
          if (i['error']) {
            harvester['data'][1]['series'].push({ 'name': date, 'value': i['value'], 'label': $localize`Failed Partials` + ': ' + i['value'] });
            harvester['partials_failed'] += i['value'];
          } else {
            harvester['data'][0]['series'].push({ 'name': date, 'value': i['value'], 'label': $localize`Successful Partials` + ': ' + i['value'] });
            harvester['partials_success'] += i['value'];
          }
        } else {
          if (!i['error']) {
            harvester['points_total'] += i['value'];
          }
        }
      });
      this.harvesterXTicks = Array.from(xTicks);
    });
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

  rewardsFormatAxisY(data: number) {
    return (data / 10 ** 12).toFixed(2).toString() + ' XCH';
  }


  partialsXAxisFormat(data) {
    return new Date(data * 1000).toLocaleTimeString();
  }

  showPartialError(content) {
    this.modal.open(content, { size: 'xl' });
  }

  copyToClipboard(content) {
    this.clipboardApi.copyFromContent(content);
  }

}
