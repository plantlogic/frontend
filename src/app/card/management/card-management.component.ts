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
import { DbFilterResponse } from 'src/app/_dto/card/dbFilterResponse';
import { DbFilter } from 'src/app/_dto/card/dbFilter';

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
  cardSizeNonLimited: number;
  filterRanchName: string;
  filterFieldID: string;
  filterLotNumber: string;
  filterCommodity: string;
  previous: string;
  viewSize = 20;
  numPages: number;
  pageNum = 1;
  pages: number[];
  hiddenPages: false;

  // Alternative sorting for mobile
  filterSort: string;
  filterOrder: string;

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = ['commodities'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('All Cards');
    this.initCommon((c) => {
      this.commonKeys.forEach((key) => {
        tempThis[`${key}`] = c[`${key}`];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCachedFilters();
      this.loadCardDataFiltered();
    });
  }

  private cardIDsToValues(card: Card): Card {
    // Only convert what is needed on this page
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    card.commodityArray.forEach((e) => {
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
    this.loadCardDataFiltered();
  }

  public filterItems() {
    // Update local storage to save query
    localStorage.setItem('managementQuery', JSON.stringify({
      ranchName: this.filterRanchName,
      fieldID: this.filterFieldID,
      lotNumber: this.filterLotNumber,
      commodity: this.filterCommodity
    }));
    this.loadCardDataFiltered();
  }

  /*
    Searches common values in [`${key}`] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message if targetID not found
  */
  private findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find((e) => {
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

  private findModifiedCards() {
    const modifiedCards = [];
    try {
      // Cycle through the cards being currently displayed, check if fieldID is different from raw
      for (const c of this.cards) {
        if (this.cardsRaw.find(c2 => c2.id === c.id).fieldID !== c.fieldID) {
          modifiedCards.push(c);
        }
      }
      return modifiedCards;
    } catch (e) {
      return [];
    }
  }

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public hasEditPermission(): boolean {
    return this.auth.hasPermission(PlRole.DATA_EDIT);
  }

  public hasShipperPermission(): boolean {
    return this.auth.hasPermission(PlRole.SHIPPER) && !this.hasViewPermission() && !this.hasEditPermission();
  }

  public hasViewPermission(): boolean {
    return this.auth.hasPermission(PlRole.DATA_VIEW);
  }

  private initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues((data) => {
      this.commonKeys.forEach((key) => {
        if (CommonLookup[`${key}`].type === 'hashTable') {
          const temp = [];
          data[`${key}`].forEach((entry) => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(data[`${key}`], key);
        }
      });
      if (this.hasShipperPermission()) {
        sortedCommon[`ranches`] = data[`ranches`];
      } else {
        sortedCommon[`ranches`] = data[`ranches`].filter((e) => userRanchAccess.includes(e.id));
      }
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  private loadCachedFilters(): void {
    if (this.route.snapshot.queryParams.saveFilter) {
      let previousQuery: any = localStorage.getItem('managementQuery');
      if (previousQuery) {
        previousQuery = JSON.parse(previousQuery);
        this.filterRanchName = previousQuery.ranchName;
        this.filterFieldID = previousQuery.fieldID;
        this.filterLotNumber = previousQuery.lotNumber;
        this.filterCommodity = previousQuery.commodity;
      }
    } else {
      this.filterRanchName = '';
      this.filterFieldID = '';
      this.filterLotNumber = '';
      this.filterCommodity = '';
      localStorage.removeItem('managementQuery');
    }
  }

  public loadCardDataFiltered(pageSelect?: boolean) {
    const previousPage = this.pageNum;
    if (!pageSelect) { this.pageNum = 1; }

    // Create the db filter
    const filter: DbFilter = new DbFilter();
    filter.fieldID = (this.filterFieldID) ? this.filterFieldID : '';
    filter.lotNumber = (this.filterLotNumber) ? this.filterLotNumber : '';
    filter.sort = (this.filterSort) ? this.filterSort : 'lastUpdated';
    this.filterSort = filter.sort;
    filter.order = (this.filterOrder) ? this.filterOrder : 'desc';
    this.filterOrder = filter.order;
    filter.start = (this.pageNum - 1) * Number(this.viewSize);
    filter.stop = Number(filter.start) + Number(this.viewSize);

    const ranches = [];
    const commodities = [];
    const commodityPairs = [];
    this.common.getAllValues((data) => {
      // Ranch Ids
      const ranchName = (this.filterRanchName) ? this.filterRanchName : '';
      if (ranchName === '') { filter.isAllRanches = true; }
      data.ranches.forEach((ranch) => {
        if (ranchName !== '' && ranchName !== null) {
          if (ranch.value.toLowerCase().includes(ranchName.toLowerCase())) {
            ranches.push(ranch.id);
          }
        } else {
          ranches.push(ranch.id);
        }
      });
      filter.ranches = ranches;
      // Commodity Ids
      const commodity = (this.filterCommodity) ? this.filterCommodity : '';
      if (commodity === '') { filter.isAllCommodities = true; }
      data.commodities.forEach((c) => {
        const id = c.id;
        const value = Object.keys(c.value)[0];
        commodityPairs.push({id, value});
        if (commodity !== '' && commodity !== null) {
          if (value.toLowerCase().includes(commodity.toLowerCase())) {
            commodities.push(id);
          }
        } else {
          commodities.push(id);
        }
      });
      filter.commodities = commodities;
      commodityPairs.sort((a, b) => {
        let comparison = 0;
        const valA = a.value;
        const valB = b.value;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        return comparison;
      });
      // console.log(commodityPairs);
      filter.allCommoditiesOrdered = commodityPairs.map((e) => e.id);

      // Permission Filters
      const shipperRestricted: boolean = this.hasShipperPermission();
      const shipperID = (shipperRestricted) ? this.auth.getShipperID() : null;

      this.cardService.getCardsFiltered(filter, shipperRestricted, shipperID).subscribe(
        e => {
          if (e.success) {
            const response: DbFilterResponse = e.data;
            // console.log(response);
            this.cards = response.cards.map((c) => (new Card()).copyConstructor(c));
            this.cardSizeNonLimited = response.size;

            // For display purposes, change any common IDs to their values
            this.cards.forEach((card) => {
              card = this.cardIDsToValues(card);
              card.initCommodityString();
            });
            // Keep a raw copy of the data
            this.cardsRaw = response.cards.map((c) => (new Card()).copyConstructor(c));
            this.updateNumPages();
            if (pageSelect) {
              this.setPage(previousPage, false);
            } else {
              this.setPage(1, false);
            }
          } else if (!e.success) {
            AlertService.newBasicAlert('Error: ' + e.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        }
      );
    });
  }

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }

  public resetFieldIds(): void {
    const tempThis = this;
    this.cards.forEach((card) => {
      try {
        card.fieldID = tempThis.cardsRaw.find((e) => e.id === card.id).fieldID;
      } catch (e) {
        console.log('Error resetting card fieldID');
      }
    });
  }

  public setPage(n: number, updateFilter?: boolean): void {
    if (this.pageNum === n) { return; }
    this.pageNum = n;
    if (this.pageNum > this.numPages) { this.pageNum = this.numPages; }
    if (this.pageNum < 1) { this.pageNum = 1; }
    if (updateFilter) { this.loadCardDataFiltered(true); }
  }

  public showListing(index: number): boolean {
    return true;
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
      const card = tempThis.cardsRaw.find((c) => c.id === m.id);
      if (!card) {
        log.failure += 1;
        tempThis.updateMessage(log, modified.length);
      } else {
        card.fieldID = m.fieldID;
        tempThis.cardEdit.updateCard(card).subscribe((data) => {
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

  private updateMessage(log, expected) {
    const total = log.success + log.failure;
    if (total >= expected) {
      AlertService.newBasicAlert(`Cards updated: ${log.success} successfully, ${log.failure} unsuccessfully`, false);
    }
  }

  public updateNumPages(e?: number): void {
    // When event is called, e is new viewSize value while this.viewSize is old Value
    if (e) { this.viewSize = e; }
    this.numPages = Math.ceil(this.cardSizeNonLimited / this.viewSize);
    this.pages = Array(this.numPages).fill(0).map((x, i) => i + 1);
  }

  public updateSortOrder(sort: string) {
    if (this.filterSort === sort) {
      if (this.filterOrder === 'asc') {
        this.filterOrder = 'desc';
      } else {
        this.filterOrder = 'asc';
      }
    } else {
      this.filterSort = sort;
      this.filterOrder = 'asc';
    }
    this.loadCardDataFiltered(false);
  }
}
