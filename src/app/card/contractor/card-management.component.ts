import {Component, OnInit} from '@angular/core';
import {Card, WorkType} from '../../_dto/card/card';
import {AlertService} from '../../_interact/alert/alert.service';
import {TitleService} from '../../_interact/title.service';
import {CardViewService} from '../../_api/card-view.service';
import {CardEditService} from '../../_api/card-edit.service';
import {MdbTableService} from 'angular-bootstrap-md';
import {NavService} from '../../_interact/nav.service';
import {AuthService} from '../../_auth/auth.service';
import {PlRole} from '../../_dto/user/pl-role.enum';
import {CommonFormDataService} from 'src/app/_api/common-form-data.service';

@Component({
  selector: 'app-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss']
})
export class CardContractorComponent implements OnInit {
  constructor(private titleService: TitleService, private cardService: CardViewService, private cardEdit: CardEditService,
              private tableService: MdbTableService, private nav: NavService, public common: CommonFormDataService,
              private auth: AuthService) { }

  cards: any[] = [];
  previous: string;
  filterRanchName: string;
  filterLotNumber: string;
  filterCommodity: string;
  viewSize = 20;
  numPages: number;
  pageNum: number;
  pages: number[];
  hiddenPages: false;

  ngOnInit() {
    this.titleService.setTitle('All Cards');
    this.loadCardData();
    this.setPage(1);
  }

  private loadCardData() {
    const tempThis = this;
    this.cardService.getAllCards().subscribe(
      data => {
        if (data.success) {
          this.cards = data.data.map(c => (new Card()).copyConstructor(c));
          this.cards.forEach(c => {
            c.initCommodityString();
            // Modify hoe and thin dates to hold both their input value (val) and the value used to sort by (num)
            c.hoeDate = {
                val: c.hoeDate,
                num: (c.hoeDate) ? new Date(c.hoeDate).valueOf() : ''
            };
            c.thinDate = {
              val: c.thinDate,
              num: (c.thinDate) ? new Date(c.thinDate).valueOf() : ''
           };
          });
          this.tableService.setDataSource(this.cards);
          this.previous = this.tableService.getDataSource();
          this.updateNumPages();
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
    return { data: cards, wasFiltered: filterApplied };
  }

  public clearFilter() {
    this.filterRanchName = '';
    this.filterLotNumber = '';
    this.filterCommodity = '';
    this.tableService.setDataSource(this.previous);
    this.cards = this.tableService.getDataSource();
    this.updateNumPages();
  }

  private updateCard(c: any): void {
    // Revert hoe and thin dates to their normal forms
    if (c.hoeDate.val) {
      c.hoeDate = (new Date(c.hoeDate.val)).valueOf();
    } else {
      c.hoeDate = null;
    }
    if (c.thinDate.val) {
      c.thinDate = (new Date(c.thinDate.val)).valueOf();
    } else {
      c.thinDate = null;
    }
    this.cardEdit.updateCard(c as Card).subscribe(data => {
      if (data.success) {
        AlertService.newBasicAlert('Change saved successfully!', false);
        this.loadCardData();
      } else {
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    },
    failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }

  hasViewPermission(): boolean {
    return this.auth.hasPermission(PlRole.DATA_VIEW);
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

  initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
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

  fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }
}
