import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';


@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  tabActive = 5;
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
    this.refreshPayoutTxs();
    this.refreshPayouts();
    this.dataService.getLauncher(this.farmerid).subscribe(launcher => {
      this.farmer = launcher;
    });
  }

  refreshPayoutTxs() {
    this.dataService.getPayoutTxs({
      launcher: this.farmerid,
      offset: (this.payouttxsPage - 1) * this.payouttxsPageSize,
      limit: this.payouttxsPageSize
    }).subscribe(data => this.handlePayoutTxs(data));
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

  private handlePayouts(data) {
    this.payoutsCollectionSize = data['count'];
    this._payoutaddrs$.next(data['results']);
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

}
