import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {

  tabActive = 4

  rewardsYAxisLabel: string = $localize`Daily Amount`;
  rewardsXAxisLabel: string = $localize`Day`;
  rewardsData: any[] = null;
  rewardsChartColors = { domain: ['#006400'] };

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
  private farmerid: string = '5e8ff6038b3fdebf5f090f685c6ae314aa79d6d5fda9241354e5e4fad60d8938';
  public farmer: any = {};


  constructor(
    private dataService: DataService,
  ) {
    this.payoutaddrs$ = this._payoutaddrs$.asObservable();
    this.payouttxs$ = this._payouttxs$.asObservable();
  }

  ngOnInit(): void {
    this.refreshPayouts()
    this.dataService.getLauncher(this.farmerid).subscribe(launcher => {
      this.farmer = launcher;
      this.getRewards();
    });
  }



  getRewards() {
    this.rewardsData = Array.from(this.farmer.rewards.last_per_day, (i, idx) => {
      return { "name": i['day'], "value": i['amount'] };
    });
  }

  rewardsFormatAxisY(data: number) {
    return (data / 10 ** 12).toFixed(2).toString() + ' XCH';
  }

  refreshPayouts() {
    this.dataService.getPayoutAddrs({
      launcher: this.farmerid,
      offset: (this.payoutsPage - 1) * this.payoutsPageSize,
      limit: this.payoutsPageSize
    }).subscribe(data => this.handlePayouts(data));
  }
  private handlePayouts(data) {
    console.log('data', data)
    this.payoutsCollectionSize = data['count'];
    this._payoutaddrs$.next(data['results']);
  }

}
