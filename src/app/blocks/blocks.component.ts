import { Component, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.css']
})
export class BlocksComponent implements OnInit {

  tabActive = 6;
  blocks$: Observable<any[]>;
  _blocks$ = new BehaviorSubject<any[]>([]);
  blocksCollectionSize: number = 0;
  blocksPage: number = 1;
  blocksPageSize: number = 25;
  private farmerid: string = '5e8ff6038b3fdebf5f090f685c6ae314aa79d6d5fda9241354e5e4fad60d8938';

  constructor(
    private dataService: DataService,

  ) {
    this.blocks$ = this._blocks$.asObservable();
  }

  ngOnInit(): void {
    this.refreshBlocks()
  }

  refreshBlocks() {
    this.dataService.getBlocks({
      launcher: this.farmerid,
      offset: (this.blocksPage - 1) * this.blocksPageSize,
      limit: this.blocksPageSize
    }).subscribe(data => this.handleBlocks(data));
  }

  private handleBlocks(data) {
    this.blocksCollectionSize = data['count'];
    this._blocks$.next(data['results']);
  }

}
