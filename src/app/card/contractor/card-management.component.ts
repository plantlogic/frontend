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
import {ActivatedRoute} from '@angular/router';
import { CommonLookup } from 'src/app/_api/common-data.service';

@Component({
    selector: 'app-contractor',
    templateUrl: './card-management.component.html',
    styleUrls: ['./card-management.component.scss']
  })
  export class CardContractorComponent implements OnInit {
  constructor(private titleService: TitleService, private cardService: CardViewService, private cardEdit: CardEditService,
              private tableService: MdbTableService, private nav: NavService, public common: CommonFormDataService,
              private route: ActivatedRoute, private auth: AuthService) { }

  cards: any[] = [];
  cardsRaw: Card[] = [];
  filterRanchName: string;
  filterFieldID: string;
  filterLotNumber: string;
  filterCommodity: string;
  previous: string;
  viewSize = 20;
  numPages: number;
  pageNum: number;
  pages: number[];
  hiddenPages: false;

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['commodities'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('All Cards');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
      this.setPage(1);
    });
  }

  private cardIDsToValues(card: Card): Card {
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    card.commodityArray.forEach(e => {
      e.commodity = this.findCommonValue('commodities', ['value', 'key'], e.commodity);
    });
    return card;
  }

  public clearFilter() {
    this.filterRanchName = '';
    this.filterFieldID = '';
    this.filterLotNumber = '';
    this.filterCommodity = '';
    localStorage.removeItem('contractorQuery');
    this.tableService.setDataSource(this.previous);
    this.cards = this.tableService.getDataSource();
    this.updateNumPages();
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
    localStorage.setItem('contractorQuery', JSON.stringify({
      ranchName: this.filterRanchName,
      lotNumber: this.filterLotNumber,
      commodity: this.filterCommodity
    }));
    return { data: cards, wasFiltered: filterApplied };
  }

  /*
    Searches common values in [key] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find(e => {
      return e.id === targetID;
    });
    try {
      valuePropertyArr.forEach(p => {
        commonValue = commonValue[p];
      });
    } catch (e) {
      console.log(e);
    }
    return (commonValue) ? commonValue : 'Unknown ' + key + ' ID';
  }

  findModifiedCards() {
    const modifiedCards = [];
    try {
      for (let i = 0; i < this.cards.length; i++) {
        if (this.showListing(i)) {
          const card1 = this.cardsRaw.find(c => c.id === this.cards[i].id);
          const card2 = this.cards[i];
          const hoeDate1 = new Date(card1.hoeDate).valueOf();
          const hoeDate2 = new Date(card2.hoeDate.val).valueOf();
          const thinDate1 = new Date(card1.thinDate).valueOf();
          const thinDate2 = new Date(card2.thinDate.val).valueOf();
          if ((hoeDate1 !== hoeDate2) || (thinDate1 !== thinDate2)
          || (card1.hoeType !== card2.hoeType) || (card1.thinType !== card2.thinType)) {
            modifiedCards.push(this.cards[i]);
          }
        }
      }
      return modifiedCards;
    } catch (e) {
      return [];
    }
  }

  fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  hasViewPermission(): boolean {
    return this.auth.hasPermission(PlRole.CONTRACTOR_VIEW);
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
        if (CommonLookup[key].type === 'hashTable') {
          const temp = [];
          data[key].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[key] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
        }
      });
      sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
  }

  private loadCardData() {
    this.cardService.getAllCards().subscribe(
      data => {
        if (data.success) {
          this.cards = data.data.map(c => (new Card()).copyConstructor(c));

          // For display purposes, change any common IDs to their values
          this.cards.forEach(card => {
            card = this.cardIDsToValues(card);
            card.initCommodityString();
            // Modify hoe and thin dates to hold both their input value (val) and the value used to sort by (num)
            card.hoeDate = {
                val: card.hoeDate,
                num: (card.hoeDate) ? new Date(card.hoeDate).valueOf() : ''
            };
            card.thinDate = {
              val: card.thinDate,
              num: (card.thinDate) ? new Date(card.thinDate).valueOf() : ''
           };
          });
          // Keep a raw copy of the data
          this.cardsRaw = data.data.map(c => (new Card()).copyConstructor(c));
          this.tableService.setDataSource(this.cards);
          this.previous = this.tableService.getDataSource();
          this.updateNumPages();

          if (this.route.snapshot.queryParams.saveFilter) {
            let previousQuery: any = localStorage.getItem('contractorQuery');
            if (previousQuery) {
              previousQuery = JSON.parse(previousQuery);
              this.filterRanchName = previousQuery.ranchName;
              this.filterFieldID = previousQuery.fieldID;
              this.filterLotNumber = previousQuery.lotNumber;
              this.filterCommodity = previousQuery.commodity;
              this.filterItems();
            }
          } else {
            this.filterRanchName = '';
            this.filterFieldID = '';
            this.filterLotNumber = '';
            this.filterCommodity = '';
            localStorage.removeItem('managementQuery');
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

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }

  public resetCards(): void {
    const tempThis = this;
    this.cards.forEach(card => {
      try {
        const rawCard = tempThis.cardsRaw.find(e => e.id === card.id);
        // Modify hoe and thin dates to hold both their input value (val) and the value used to sort by (num)
        card.hoeDate = {
          val: rawCard.hoeDate,
          num: (rawCard.hoeDate) ? new Date(rawCard.hoeDate).valueOf() : ''
        };
        card.hoeType = rawCard.hoeType;
        card.thinDate = {
          val: rawCard.thinDate,
          num: (rawCard.thinDate) ? new Date(rawCard.thinDate).valueOf() : ''
        };
        card.thinType = rawCard.thinType;
      } catch (e) {
        console.log('Error resetting card fieldID');
      }
    });
  }

  setPage(n: number): void {
    if (this.pageNum === n) { return; }
    this.pageNum = n;
    if (this.pageNum > this.numPages) { this.pageNum = this.numPages; }
    if (this.pageNum < 1) { this.pageNum = 1; }
  }

  showListing(index: number): boolean {
    const low = (this.pageNum - 1) * this.viewSize;
    const high = (this.pageNum * this.viewSize) - 1;
    if ((index >= low) && (index <= high)) {
      return true;
    }
    return false;
  }

  public updateCards(): void {
    const tempThis = this;
    const log = {
      success: 0,
      failure: 0
    };
    const modified = this.findModifiedCards();
    modified.forEach(m => {
      const card = tempThis.cardsRaw.find(c => c.id === m.id);
      if (!card) {
        log.failure += 1;
        tempThis.updateMessage(log, modified.length);
      } else {
        card.hoeDate = (new Date(m.hoeDate.val)).valueOf();
        card.hoeType = m.hoeType;
        card.thinDate = (new Date(m.thinDate.val)).valueOf();
        card.thinType = m.thinType;
        tempThis.cardEdit.updateCard(card as Card).subscribe(data => {
          if (data.success) {
            log.success += 1;
          } else {
            log.failure += 1;
          }
          tempThis.updateMessage(log, modified.length);
        },
        failure => {
          log.failure += 1;
          tempThis.updateMessage(log, modified.length);
        });
      }
    });
  }

  updateMessage(log, expected) {
    const total = log.success + log.failure;
    if (total >= expected) {
      AlertService.newBasicAlert(`Cards updated: ${log.success} successfully, ${log.failure} unsuccessfully`, false);
    }
  }

  updateNumPages(e?: number): void {
    // When event is called, e is new viewSize value while this.viewSize is old Value
    if (e) { this.viewSize = e; }
    this.numPages = Math.ceil(this.cards.length / this.viewSize);
    this.pages = Array(this.numPages).fill(0).map((x, i) => i + 1);
    this.setPage(1);
  }
}
