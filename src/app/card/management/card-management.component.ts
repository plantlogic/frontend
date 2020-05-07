import {Component, OnInit} from '@angular/core';
import {Card} from '../../_dto/card/card';
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
  selector: 'app-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss']
})
export class CardManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private cardService: CardViewService, private cardEdit: CardEditService,
              private tableService: MdbTableService, private nav: NavService, public common: CommonFormDataService,
              private route: ActivatedRoute, private auth: AuthService) { }

  cards: Card[] = [];
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

  // Alternative sorting for mobile
  mFilterSort: string;
  mFilterOrder: string;

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
    // Only convert what is needed on this page
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
    localStorage.removeItem('managementQuery');
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

    // If displaying on mobile, sort with the current mobile sort settings
    if (window.getComputedStyle(document.getElementById('mobileSorter')).display !== 'none') {
      this.mobileSort();
    }
  }

  public filterCards() {
    let filterApplied = false;
    let cards = this.tableService.getDataSource();
    const tempThis = this;
    if (this.filterRanchName) {
      cards = cards.filter(card => (card.ranchName) && card.ranchName.toLowerCase().includes(tempThis.filterRanchName.toLowerCase()));
      filterApplied = true;
    }
    if (this.filterFieldID) {
      cards = cards.filter(card => (card.fieldID) && (card.fieldID + '').includes(tempThis.filterFieldID.toLowerCase()));
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
    localStorage.setItem('managementQuery', JSON.stringify({
      ranchName: this.filterRanchName,
      fieldID: this.filterFieldID,
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
      // Cycle through the cards being currently displayed, check if fieldID is different from raw
      for (let i = 0; i < this.cards.length; i++) {
        if (this.showListing(i)) {
          const cardID = this.cards[i].id;
          if (this.cardsRaw.find(c => c.id === cardID).fieldID !== this.cards[i].fieldID) {
            modifiedCards.push(this.cards[i]);
          }
        }
      }
      return modifiedCards;
    } catch (e) {
      return [];
    }
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  hasEditPermission(): boolean {
    return this.auth.hasPermission(PlRole.DATA_EDIT);
  }

  hasShipperPermission(): boolean {
    return this.auth.hasPermission(PlRole.SHIPPER);
  }

  hasViewPermission(): boolean {
    return this.auth.hasPermission(PlRole.DATA_VIEW);
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
      if (this.hasShipperPermission() && !this.hasViewPermission()) {
        sortedCommon[`ranches`] = data[`ranches`];
      } else {
        sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
      }
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  private loadCardData() {
    const shipperRestricted: boolean = this.hasShipperPermission() && !this.hasViewPermission();
    const shipperID = (shipperRestricted) ? this.auth.getShipperID() : null;
    this.cardService.getAllCards(shipperRestricted, shipperID).subscribe(
      data => {
        if (data.success) {
          this.cards = data.data.map(c => (new Card()).copyConstructor(c));

          // For display purposes, change any common IDs to their values
          this.cards.forEach(card => {
            card = this.cardIDsToValues(card);
            card.initCommodityString();
          });
          // Keep a raw copy of the data
          this.cardsRaw = data.data.map(c => (new Card()).copyConstructor(c));
          this.tableService.setDataSource(this.cards);
          this.previous = this.tableService.getDataSource();
          this.updateNumPages();

          if (this.route.snapshot.queryParams.saveFilter) {
            let previousQuery: any = localStorage.getItem('managementQuery');
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

  mobileSort(): void {
    if (this.mFilterSort) {
      if (!this.mFilterOrder) { this.mFilterOrder = 'asc'; }
      switch (this.mFilterSort) {
        case 'ranchName':
          // Sort by ranch name
          if (this.mFilterOrder === 'asc') {
            // Ascending
            this.cards = this.cards.sort((a, b) => a.ranchName > b.ranchName ? 1 : -1);
          } else {
            // Descending
            this.cards = this.cards.sort((a, b) => a.ranchName > b.ranchName ? -1 : 1);
          }
          break;
        case 'lotNumber':
          // Sort by lot number
          if (this.mFilterOrder === 'asc') {
            // Ascending
            this.cards = this.cards.sort((a, b) => a.lotNumber > b.lotNumber ? 1 : -1);
          } else {
            // Descending
            this.cards = this.cards.sort((a, b) => a.lotNumber > b.lotNumber ? -1 : 1);
          }
          break;
        case 'commodity':
          // Sort by Commodity
          if (this.mFilterOrder === 'asc') {
            // Ascending
            this.cards = this.cards.sort((a, b) => a.commodityString > b.commodityString ? 1 : -1);
          } else {
            // Descending
            this.cards = this.cards.sort((a, b) => a.commodityString > b.commodityString ? -1 : 1);
          }
          break;
        case 'fieldID':
          // Sort by Commodity
          if (this.mFilterOrder === 'asc') {
            // Ascending
            this.cards = this.cards.sort((a, b) => a.fieldID > b.fieldID ? 1 : -1);
          } else {
            // Descending
            this.cards = this.cards.sort((a, b) => a.fieldID > b.fieldID ? -1 : 1);
          }
          break;
        default:
          break;
      }
    }
  }

  public resetFieldIds(): void {
    const tempThis = this;
    this.cards.forEach(card => {
      try {
        card.fieldID = tempThis.cardsRaw.find(e => e.id === card.id).fieldID;
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

  public updateFieldIds(): void {
    if (!this.hasEditPermission()) {
      AlertService.newBasicAlert('Failed to Edit: DATA EDIT Permission Required', true);
      return;
    }
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
        card.fieldID = m.fieldID;
        tempThis.cardEdit.updateCard(card).subscribe(data => {
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
