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
import { DbFilter } from 'src/app/_dto/card/dbFilter';
import { DbFilterResponse } from 'src/app/_dto/card/dbFilterResponse';

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
  cardSizeNonLimited: number;
  filterRanchName: string;
  filterLotNumber: string;
  filterCommodity: string;
  previous: string;
  viewSize = 20;
  numPages: number;
  pageNum = 1;
  pages: number[];
  hiddenPages: false;

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
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    card.commodityArray.forEach((e) => {
      e.commodity = this.findCommonValue('commodities', ['value', 'key'], e.commodity);
    });
    return card;
  }

  public clearFilter() {
    this.filterRanchName = '';
    this.filterLotNumber = '';
    this.filterCommodity = '';
    localStorage.removeItem('contractorQuery');
    this.loadCardDataFiltered();
  }

  public filterItems() {
    // Update local storage to save query
    localStorage.setItem('contractorQuery', JSON.stringify({
      ranchName: this.filterRanchName,
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
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
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

  findModifiedCards() {
    const modifiedCards = [];
    try {
      for (const card2 of this.cards) {
        const card1 = this.cardsRaw.find((c) => c.id === card2.id);
        const hoeDate1 = (card1.hoeDate) ? new Date(card1.hoeDate).valueOf() : null;
        const hoeDate2 = (card2.hoeDate) ? new Date(card2.hoeDate).valueOf() : null;
        const thinDate1 = (card1.thinDate) ? new Date(card1.thinDate).valueOf() : null;
        const thinDate2 = (card2.thinDate) ? new Date(card2.thinDate).valueOf() : null;
        if ((hoeDate1 !== hoeDate2) || (thinDate1 !== thinDate2)
        || (card1.hoeType !== card2.hoeType) || (card1.thinType !== card2.thinType)) {
          modifiedCards.push(card2);
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
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  hasViewPermission(): boolean {
    return this.auth.hasPermission(PlRole.CONTRACTOR_VIEW);
  }

  hasEditPermission(): boolean {
    return this.auth.hasPermission(PlRole.CONTRACTOR_EDIT);
  }

  public initCommon(f): void {
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
      sortedCommon[`ranches`] = data[`ranches`].filter((e) => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
  }

  private loadCachedFilters(): void {
    if (this.route.snapshot.queryParams.saveFilter) {
      let previousQuery: any = localStorage.getItem('contractorQuery');
      if (previousQuery) {
        previousQuery = JSON.parse(previousQuery);
        this.filterRanchName = previousQuery.ranchName;
        this.filterLotNumber = previousQuery.lotNumber;
        this.filterCommodity = previousQuery.commodity;
      }
    } else {
      this.filterRanchName = '';
      this.filterLotNumber = '';
      this.filterCommodity = '';
      localStorage.removeItem('contractorQuery');
    }
  }

  public loadCardDataFiltered(pageSelect?: boolean) {
    const previousPage = this.pageNum;
    if (!pageSelect) { this.pageNum = 1; }

    // Create the db filter
    const filter: DbFilter = new DbFilter();
    filter.fieldID =  '';
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

      this.cardService.getCardsFiltered(filter, false).subscribe(
        (e) => {
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

  public resetCards(): void {
    const tempThis = this;
    this.cards.forEach((card) => {
      try {
        const rawCard = tempThis.cardsRaw.find((e) => e.id === card.id);
        // Modify hoe and thin dates to hold both their input value (val) and the value used to sort by (num)
        card.hoeDate = rawCard.hoeDate;
        card.hoeType = rawCard.hoeType;
        card.thinDate = rawCard.thinDate;
        card.thinType = rawCard.thinType;
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

  public updateCards(): void {
    if (!this.hasEditPermission()) {
      AlertService.newBasicAlert('Failed to Edit: CONTRACTOR EDIT Permission Required', true);
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
        card.wetDate = (m.wetDate) ? (new Date(m.wetDate)).valueOf() : null;
        card.hoeDate = (m.hoeDate) ? (new Date(m.hoeDate)).valueOf() : null;
        card.hoeType = m.hoeType;
        card.thinDate = (m.thinDate) ? (new Date(m.thinDate)).valueOf() : null;
        card.thinType = m.thinType;
        tempThis.cardEdit.updateCard(card as Card).subscribe((data) => {
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
