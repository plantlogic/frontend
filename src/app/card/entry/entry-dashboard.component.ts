import {Component, OnInit} from '@angular/core';
import {Card} from '../../_dto/card/card';
import {AlertService} from '../../_interact/alert/alert.service';
import {TitleService} from '../../_interact/title.service';
import {CardEntryService} from '../../_api/card-entry.service';
import {MdbTableService} from 'angular-bootstrap-md';
import {NavService} from '../../_interact/nav.service';
import {CommonFormDataService} from 'src/app/_api/common-form-data.service';
import {AuthService} from 'src/app/_auth/auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-entry',
  templateUrl: './entry-dashboard.component.html',
  styleUrls: ['./entry-dashboard.component.scss']
})
export class EntryDashboardComponent implements OnInit {
  constructor(private titleService: TitleService, private cardService: CardEntryService, private tableService: MdbTableService,
              private nav: NavService, public common: CommonFormDataService, private route: ActivatedRoute,
              private auth: AuthService) { }

  cards: Card[] = [];
  filterRanchName: string;
  filterLotNumber: string;
  filterCommodity: string;
  previous: string;
  viewSize = 20;
  numPages: number;
  pageNum: number;
  pages: number[];
  hiddenPages: false;

  ngOnInit() {
    this.titleService.setTitle('Open Cards');
    this.loadCardData();
    this.setPage(1);
  }


  private loadCardData() {
    this.cardService.getMyCards().subscribe(
      data => {
        if (data.success) {
          this.cards = data.data.map(c => (new Card()).copyConstructor(c));
          this.cards.forEach(c => c.initCommodityString());
          this.tableService.setDataSource(this.cards);
          this.previous = this.tableService.getDataSource();
          this.updateNumPages();

          if (this.route.snapshot.queryParams.saveFilter) {
            let previousQuery: any = localStorage.getItem('entryQuery');
            if (previousQuery) {
              previousQuery = JSON.parse(previousQuery);
              this.filterRanchName = previousQuery.ranchName;
              this.filterLotNumber = previousQuery.lotNumber;
              this.filterCommodity = previousQuery.commodity;
              this.filterItems();
            }
          } else {
            this.filterRanchName = '';
            this.filterLotNumber = '';
            this.filterCommodity = '';
            localStorage.removeItem('entryQuery');
          }

        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
      }
    );
  }

  public filterItems() {
    const prev = this.tableService.getDataSource();
    const filter = this.filterCards();
    if (!filter.wasFiltered) {
      this.tableService.setDataSource(this.previous);
      this.cards = this.tableService.getDataSource();
    } else {
      this.cards = filter.data;
      this.tableService.setDataSource(prev);
    }
    this.updateNumPages();
  }

  public filterCards() {
    let filterApplied = false;
    let cards = this.tableService.getDataSource();
    const tempThis = this;
    if (this.filterRanchName) {
      cards = cards.filter(card => (card.ranchName) && card.ranchName.toLowerCase().includes(tempThis.filterRanchName.toLowerCase()));
      filterApplied = true;
    }
    if (this.filterLotNumber) {
      cards = cards.filter(card => (card.lotNumber) && card.lotNumber.toLowerCase().includes(tempThis.filterLotNumber.toLowerCase()));
      filterApplied = true;
    }
    if (this.filterCommodity) {
      cards = cards.filter(c => (c.commodityString) && c.commodityString.toLowerCase().includes(tempThis.filterCommodity.toLowerCase()));
      filterApplied = true;
    }
    // Update local storage to save query
    localStorage.setItem('entryQuery', JSON.stringify({
      ranchName: this.filterRanchName,
      lotNumber: this.filterLotNumber,
      commodity: this.filterCommodity
    }));
    return { data: cards, wasFiltered: filterApplied };
  }

  public clearFilter() {
    this.filterRanchName = '';
    this.filterLotNumber = '';
    this.filterCommodity = '';
    localStorage.removeItem('entryQuery');
    this.tableService.setDataSource(this.previous);
    this.cards = this.tableService.getDataSource();
    this.updateNumPages();
  }

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }

  initRanches(): Array<string> {
    try {
      return this.common.getValues('ranches').filter(r => this.auth.getRanchAccess().includes(r)).sort();
    } catch (E) {
      // Block error messages while data is loading
     }
  }

  initCommodities(): Array<string> {
    try {
      return this.common.getMapKeys('commodities').sort();
    } catch { console.log('Error when initializing commodities'); }
  }

  setPage(n: number): void {
    if (this.pageNum === n) { return; }
    this.pageNum = n;
    if (this.pageNum > this.numPages) { this.pageNum = this.numPages; }
    if (this.pageNum < 1) { this.pageNum = 1; }
  }

  updateNumPages(e?: number): void {
    // When event is called, e is new viewSize value while this.viewSize is old Value
    if (e) { this.viewSize = e; }
    this.numPages = Math.ceil(this.cards.length / this.viewSize);
    this.pages = Array(this.numPages).fill(0).map( (x, i) => i + 1);
    this.setPage(1);
  }

  showListing(index: number): boolean {
    const low = (this.pageNum - 1) * this.viewSize;
    const high = (this.pageNum * this.viewSize) - 1;
    if ((index >= low) && (index <= high)) {
      return true;
    }
    return false;
  }
}
