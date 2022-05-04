import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import { Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})

export class LandingComponent implements OnInit {

  @ViewChild('searchinput') searchInput: ElementRef;

  searchNotFound: boolean = false;
  farmersCollectionSize: number = 0;
  farmersPage: number = 1;
  farmersPageSize: number = 30;

  pool_space: number = 0;
  estimate_win: any;
  rewards_blocks: any;
  rewards_amount: number = 0;
  farmers: any;
  netspace: number = 0;
  poolLog: string = '';
  xch_current_price: number = 0;
  pool_wallets: Array<any> = new Array();
  current_effort: number = 0;
  time_since_last_win: string = '';
  xch_tb_month: number = 0;
  average_effort: number = 0;


  blocks$: Observable<any[]>;
  _blocks$: Subject<any[]> = new Subject<any[]>();
  launchers$: Observable<any[]>;
  _launchers$: Subject<any[]> = new Subject<any[]>();
  payouts$: Observable<any[]>;
  _payouts$: Subject<any[]> = new Subject<any[]>();
  searchSubscription: Subscription;

  leaderboard: Array<any> = new Array();


  farmersFilterActive: number = 1;

  blocksCollectionSize: number = 0;
  blocksPage: number = 1;
  blocksPageSize: number = 10;

  payoutsCollectionSize: number = 0;
  payoutsPage: number = 1;
  payoutsPageSize: number = 10;

  constructor(private dataService: DataService) {
    this.blocks$ = this._blocks$.asObservable();
    this.launchers$ = this._launchers$.asObservable();
    this.payouts$ = this._payouts$.asObservable();
  }

  ngOnInit() {

    this.dataService.getStats().subscribe(data => {
      this.pool_space = data['pool_space'];
      this.estimate_win = this.secondsToHm(data['estimate_win'] * 60);
      this.rewards_blocks = data['rewards_blocks'];
      this.rewards_amount = data['rewards_amount'];
      this.farmers = data['farmers_active'];
      this.netspace = data['blockchain_space'];
      this.xch_current_price = data['xch_current_price'];
      this.pool_wallets = data['pool_wallets'];
      this.current_effort = (data['time_since_last_win'] / (data['estimate_win'] * 60)) * 100;
      this.time_since_last_win = this.secondsToHm(data['time_since_last_win']);
      this.xch_tb_month = data['xch_tb_month'];
      this.average_effort = data['average_effort'];
    });

    this.dataService.getBlocks({
      limit: this.blocksPageSize
    }).subscribe(this.handleBlocks.bind(this));

    this.dataService.getPayouts({
      limit: this.payoutsPageSize
    }).subscribe(this.handlePayouts.bind(this));

  }

  searchFarmer() {
    this.searchNotFound = false;
    this.farmersPage = 1;
    this.dataService.getLaunchers({
      search: this.searchInput.nativeElement.value,
      limit: this.farmersPageSize,
      offset: (this.farmersPage - 1) * this.farmersPageSize
    }).subscribe(res => console.log(res));
  }

  private secondsToHm(d: number) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);

    var hDisplay = h > 0 ? h + "h" : "";
    var mDisplay = m > 0 ? m + "m" : "";
    return hDisplay + " " + mDisplay;
  }

  refreshBlocks() {
    this.dataService.getBlocks({
      offset: (this.blocksPage - 1) * this.blocksPageSize,
      limit: this.blocksPageSize
    }).subscribe(this.handleBlocks.bind(this));
  }

  private handleBlocks(data) {
    console.log('data', data)
    this.blocksCollectionSize = data['count'];
    this._blocks$.next(data['results']);
  }

  refreshPayouts() {
    this.dataService.getPayouts({
      offset: (this.payoutsPage - 1) * this.payoutsPageSize,
      limit: this.payoutsPageSize
    }).subscribe(this.handlePayouts.bind(this));
  }

  private handlePayouts(data) {
    this.payoutsCollectionSize = data['count'];
    this._payouts$.next(data['results']);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

}
