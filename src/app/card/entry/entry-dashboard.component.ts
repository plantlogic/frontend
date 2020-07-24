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
import { CommonLookup } from 'src/app/_api/common-data.service';
import { PlRole } from 'src/app/_dto/user/pl-role.enum';
import { DbFilter } from 'src/app/_dto/card/dbFilter';
import { DbFilterResponse } from 'src/app/_dto/card/dbFilterResponse';

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
  cardSizeNonLimited: number;
  filterRanchName: string;
  filterLotNumber: string;
  filterCommodity: string;
  previous: string;
  viewSize = 20;
  numPages: number;
  pageNum: number;
  pages: number[];
  hiddenPages: false;
  filterSort: string;
  filterOrder: string;

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['commodities'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Open Cards');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCachedFilters();
      this.loadCardDataFiltered();
    });
  }

  private cardIDsToValues(card: Card): Card {
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    card.commodityArray.forEach(e => {
      e.commodity = this.findCommonValue('commodities', ['value', 'key'], e.commodity);
      e.bedType = this.findCommonValue('bedTypes', ['value'], e.bedType);
    });
    card.preChemicalArray.forEach(e => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.postChemicalArray.forEach(e => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.tractorArray.forEach(e => {
      e.workDone = this.findCommonValue('tractorWork', ['value'], e.workDone);
      e.operator = this.findCommonValue('tractorOperators', ['value'], e.operator);
      if (e.chemicalArray) {
        for (const c of e.chemicalArray) {
          c.name = this.findCommonValue('chemicals', ['value'], c.name);
          c.unit = this.findCommonValue('chemicalRateUnits', ['value'], c.unit);
        }
      }
      if (e.fertilizerArray) {
        for (const f of e.fertilizerArray) {
          f.name = this.findCommonValue('fertilizers', ['value'], f.name);
          f.unit = this.findCommonValue('chemicalRateUnits', ['value'], f.unit);
        }
      }
    });
    card.irrigationArray.forEach(e => {
      e.method = this.findCommonValue('irrigationMethod', ['value'], e.method);
      e.irrigator = this.findCommonValue('irrigators', ['value'], e.irrigator);
      if (e.chemicalArray) {
        for (const c of e.chemicalArray) {
          c.name = this.findCommonValue('chemicals', ['value'], c.name);
          c.unit = this.findCommonValue('chemicalRateUnits', ['value'], c.unit);
        }
      }
      if (e.fertilizerArray) {
        for (const f of e.fertilizerArray) {
          f.name = this.findCommonValue('fertilizers', ['value'], f.name);
          f.unit = this.findCommonValue('chemicalRateUnits', ['value'], f.unit);
        }
      }
    });
    return card;
  }

  public clearFilter() {
    this.filterRanchName = '';
    this.filterLotNumber = '';
    this.filterCommodity = '';
    localStorage.removeItem('entryQuery');
    this.loadCardDataFiltered();
  }

  public filterItems() {
    // Update local storage to save query
    localStorage.setItem('entryQuery', JSON.stringify({
      ranchName: this.filterRanchName,
      lotNumber: this.filterLotNumber,
      commodity: this.filterCommodity
    }));
    this.loadCardDataFiltered();
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

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public hasEntryPermission() {
    return this.auth.hasPermission(PlRole.DATA_ENTRY);
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

  private loadCachedFilters(): void {
    if (this.route.snapshot.queryParams.saveFilter) {
      let previousQuery: any = localStorage.getItem('entryQuery');
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
      localStorage.removeItem('entryQuery');
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

      this.cardService.getMyCardsFiltered(filter).subscribe(
        e => {
          if (e.success) {
            const response: DbFilterResponse = e.data;
            // console.log(response);
            this.cards = response.cards.map(c => (new Card()).copyConstructor(c));
            this.cardSizeNonLimited = response.size;

            // For display purposes, change any common IDs to their values
            this.cards.forEach(card => {
              card = this.cardIDsToValues(card);
              card.initCommodityString();
            });
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

  private loadCardData() {
    const tempThis = this;
    this.cardService.getMyCards().subscribe(
      data => {
        if (data.success) {
          tempThis.cards = data.data.map(c => (new Card()).copyConstructor(c));
          tempThis.cards.forEach(c => {
            // For display purposes, change any common IDs to their values
            c = tempThis.cardIDsToValues(c);
            c.initCommodityString();
          });
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

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }

  public setPage(n: number, updateFilter?: boolean): void {
    if (this.pageNum === n) { return; }
    this.pageNum = n;
    if (this.pageNum > this.numPages) { this.pageNum = this.numPages; }
    if (this.pageNum < 1) { this.pageNum = 1; }
    if (updateFilter) { this.loadCardDataFiltered(true); }
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
