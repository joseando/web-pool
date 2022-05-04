import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';

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
  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
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

}
