import {IrrigationEntry} from './irrigation-entry';
import {TractorEntry} from './tractor-entry';
import {Commodities} from './commodities';
import {Chemicals} from './chemicals';
import {Comment} from './comment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Chemical } from './chemical';
import { ThinHoeCrew } from './thinHoeCrew';

export class Card {
  // Limits
  readonly MAX_LIST_SIZE_BIG: number = 12;
  readonly MAX_LIST_SIZE_SMALL: number = 3;

  readonly thinCrewsMax: number = 3;
  readonly hoeCrewsMax: number = 6;

  // Card ID (used by database to identify specific card)
  id: string;
  // Is the card closed?
  closed: boolean;
  // The date the card was created
  dateCreated: number;
  // The date the card was last updated
  lastUpdated: number;

  /*
   ======== IMPORTANT: ==========
   These are private for a reason - please access using the getters below (for example, access 'irrigation' by using 'card.irrigationArray'
   instead. These setters/getters prevent limit the size of the array. Additionally, you can check if the array is full by using
   'card.irrigationFull()', which returns a boolean.
   */
  // Irrigation Data (filled out after card creation) | Max 12
  readonly irrigationMax = this.MAX_LIST_SIZE_BIG;
  private irrigation: Array<IrrigationEntry> = new Array<IrrigationEntry>();
  // Tractor Data (filled out after card creation) | Max 12
  readonly tractorMax = this.MAX_LIST_SIZE_BIG;
  private tractor: Array<TractorEntry> = new Array<TractorEntry>();
  // Commodity Data (filled out on card creation) | Max 3
  readonly commodityMax = this.MAX_LIST_SIZE_SMALL;
  private commodities: Array<Commodities> = new Array<Commodities>();
  // Pre-plant Chemicals (filled out on card creation) | Max 3
  readonly preChemicalsMax = this.MAX_LIST_SIZE_SMALL;
  private preChemicals: Array<Chemicals> = new Array<Chemicals>();
  // Post-plant Chemicals (filled out after card creation) | Max 12
  readonly postChemicalsMax = this.MAX_LIST_SIZE_BIG;
  private postChemicals: Array<Chemicals> = new Array<Chemicals>();

  // Name of the ranch
  ranchName: string;
  // The field ID (set only by admin)
  fieldID: number;
  // The name of the ranch manager
  ranchManagerName: string;
  //
  lotNumber: string;
  //
  shippers: Array<string> = new Array<string>();
  shippersString: string;
  //
  planterNumber: string;
  //
  comments: Array<Comment> = new Array<Comment>();
  //
  wetDate: number;
  //
  thinDate: number;
  //
  hoeDate: number;
  //
  thinCrews: Array<ThinHoeCrew> = new Array<ThinHoeCrew>();
  //
  hoeCrews: Array<ThinHoeCrew> = new Array<ThinHoeCrew>();
  //
  harvestDate: number;
  //
  cropYear: number = new Date().getFullYear();
  //
  thinType: WorkType;
  //
  hoeType: WorkType;

  // =======================
  // Cached Helper Values
  // =======================
  // These have to be set using the init() methods
  commodityString: string;
  totalAcres: number;



  // =======================
  // Methods
  // =======================

  // Used for creating a copy of a card without referencing old data
  public copyConstructor(card: Card): Card {
    this.id = card.id;
    this.closed = card.closed;
    this.dateCreated = card.dateCreated;
    this.lastUpdated = card.lastUpdated;

    if (card.comments && card.comments.length > 0) {
      this.comments = JSON.parse(JSON.stringify(card.comments));
    }

    if (card.irrigation) {
      const temp: Array<IrrigationEntry> = new Array<IrrigationEntry>();
      card.irrigation.forEach((t) => {
        const temp2 = Object.assign(new IrrigationEntry(), t);
        if (!temp2.chemicalArray) { temp2.chemicalArray = new Array<Chemical>(); }
        if (!temp2.fertilizerArray) { temp2.fertilizerArray = new Array<Chemical>(); }
        temp.push(temp2);
      });
      this.irrigation = temp;
    }

    if (card.tractor) {
      const temp: Array<TractorEntry> = new Array<TractorEntry>();
      card.tractor.forEach((t) => {
        const temp2 = Object.assign(new TractorEntry(), t);
        if (!temp2.chemicalArray) { temp2.chemicalArray = new Array<Chemical>(); }
        if (!temp2.fertilizerArray) { temp2.fertilizerArray = new Array<Chemical>(); }
        temp.push(temp2);
      });
      this.tractor = temp;
    }

    if (card.thinCrews) {
      const temp: Array<ThinHoeCrew> = new Array<ThinHoeCrew>();
      card.thinCrews.forEach((c) => {
        const temp2 = Object.assign(new ThinHoeCrew(), c);
        temp.push(temp2);
      });
      this.thinCrews = temp;
    }

    if (card.hoeCrews) {
      const temp: Array<ThinHoeCrew> = new Array<ThinHoeCrew>();
      card.hoeCrews.forEach((c) => {
        const temp2 = Object.assign(new ThinHoeCrew(), c);
        temp.push(temp2);
      });
      this.hoeCrews = temp;
    }

    if (card.commodities) {
      this.commodities = JSON.parse(JSON.stringify(card.commodities));
    }

    if (card.preChemicals) {
      this.preChemicals = JSON.parse(JSON.stringify(card.preChemicals));
    }

    if (card.postChemicals) {
      this.postChemicals = JSON.parse(JSON.stringify(card.postChemicals));
    }

    this.ranchName = card.ranchName;
    this.fieldID = card.fieldID;
    this.ranchManagerName = card.ranchManagerName;
    this.lotNumber = card.lotNumber;
    this.shippers = card.shippers;
    this.planterNumber = card.planterNumber;
    this.wetDate = card.wetDate;
    this.thinDate = card.thinDate;
    this.hoeDate = card.hoeDate;
    this.harvestDate = card.harvestDate;
    this.cropYear = card.cropYear;
    this.thinType = card.thinType;
    this.hoeType = card.hoeType;
    return this;
  }

  // =======================
  // Getters and Setters
  // =======================
  get irrigationArray(): Array<IrrigationEntry> {
    if (this.irrigation.length > this.irrigationMax) {
      this.irrigation = this.irrigation.slice(0, this.irrigationMax);
    }
    return this.irrigation.sort(this.compareIrrigations);
  }

  set irrigationArray(value: Array<IrrigationEntry>) {
    if (value.length > this.irrigationMax) {
      this.irrigation = value.slice(0, this.irrigationMax);
    } else {
      this.irrigation = value;
    }
  }

  irrigationFull(): boolean {
    return this.irrigation.length >= this.irrigationMax;
  }

  get tractorArray(): Array<TractorEntry> {
    if (this.tractor.length > this.tractorMax) {
      this.tractor = this.tractor.slice(0, this.tractorMax);
    }
    return this.tractor.sort(this.compareTractors);
  }

  set tractorArray(value: Array<TractorEntry>) {
    if (value.length > this.tractorMax) {
      this.tractor = value.slice(0, this.tractorMax);
    } else {
      this.tractor = value;
    }
  }

  tractorFull(): boolean {
    return this.tractor.length >= this.tractorMax;
  }

  get commodityArray(): Array<Commodities> {
    if (this.commodities.length > this.commodityMax) {
      this.commodities = this.commodities.slice(0, this.commodityMax);
    }
    return this.commodities;
  }

  set commodityArray(value: Array<Commodities>) {
    if (value.length > this.commodityMax) {
      this.commodities = value.slice(0, this.commodityMax);
    } else {
      this.commodities = value;
    }
  }

  commoditiesFull(): boolean {
    return this.commodities.length >= this.commodityMax;
  }

  get preChemicalArray(): Array<Chemicals> {
    if (this.preChemicals.length > this.preChemicalsMax) {
      this.preChemicals = this.preChemicals.slice(0, this.preChemicalsMax);
    }
    return this.preChemicals.sort(this.compareChemicalApplications);
  }

  set preChemicalArray(value: Array<Chemicals>) {
    if (value.length > this.preChemicalsMax) {
      this.preChemicals = value.slice(0, this.preChemicalsMax);
    } else {
      this.preChemicals = value;
    }
  }

  preChemicalsFull(): boolean {
    return this.preChemicals.length >= this.preChemicalsMax;
  }

  get postChemicalArray(): Array<Chemicals> {
    if (this.postChemicals.length > this.postChemicalsMax) {
      this.postChemicals = this.postChemicals.slice(0, this.postChemicalsMax);
    }
    return this.postChemicals;
  }

  set postChemicalArray(value: Array<Chemicals>) {
    if (value.length > this.postChemicalsMax) {
      this.postChemicals = value.slice(0, this.postChemicalsMax);
    } else {
      this.postChemicals = value;
    }
  }

  postChemicalsFull(): boolean {
    return this.postChemicals.length >= this.postChemicalsMax;
  }

  get thinCrewsArray(): Array<ThinHoeCrew> {
    if (!this.thinCrews) { this.thinCrews = new Array<ThinHoeCrew>(); }
    if (this.thinCrews.length > this.thinCrewsMax) {
      this.thinCrews = this.thinCrews.slice(0, this.thinCrewsMax);
    }
    return this.thinCrews;
  }

  set thinCrewsArray(value: Array<ThinHoeCrew>) {
    if (value.length > 1) {
      this.thinCrews = value.slice(0, this.thinCrewsMax);
    } else {
      this.thinCrews = value;
    }
  }

  thinCrewsFull(): boolean {
    return this.thinCrews.length >= this.thinCrewsMax;
  }

  get hoeCrewsArray(): Array<ThinHoeCrew> {
    if (!this.hoeCrews) { this.hoeCrews = new Array<ThinHoeCrew>(); }
    if (this.hoeCrews.length > this.hoeCrewsMax) {
      this.hoeCrews = this.hoeCrews.slice(0, this.hoeCrewsMax);
    }
    return this.hoeCrews;
  }

  set hoeCrewsArray(value: Array<ThinHoeCrew>) {
    if (value.length > this.hoeCrewsMax) {
      this.hoeCrews = value.slice(0, this.hoeCrewsMax);
    } else {
      this.hoeCrews = value;
    }
  }

  hoeCrewsFull(): boolean {
    return this.hoeCrews.length >= this.hoeCrewsMax;
  }

  initCommodityString(): void {
    try {
      if (this.commodityArray) {
        this.commodityString = this.commodityArray.map(v => v.commodity).sort().join(', ');
      } else {
        this.commodityString = '';
      }
    } catch {
      // console.log('Error when initializing commodity string');
    }
  }

  initShippersString(): void {
    try {
      if (this.shippers) {
        this.shippersString = this.shippers.sort().join(', ');
      } else {
        this.shippersString = '';
      }
    } catch { console.log('Error when initializing shippers string'); }
  }

  initThinHoeCostPerAcre(thinHoeCommonData): void {
    const that = this;
    if (!this.totalAcres) { this.initTotalAcres(); }
    // Init Thin Crews
    this.thinCrewsArray.forEach((crew: ThinHoeCrew) => {
      if (!that.totalAcres || that.totalAcres === 0) {
        crew.cpa = 0;
      } else {
        let crewInfo = thinHoeCommonData.find((entry) => entry.id === crew.crew);
        crewInfo = (crewInfo) ? crewInfo.value.value : { wage: 0, overhead: 100};
        const numEmployees = (crew.numEmployees != null) ? crew.numEmployees : 1;
        const hoursWorked = (crew.hoursWorked != null) ? crew.hoursWorked : 1;
        crew.cpa = (numEmployees * hoursWorked * crewInfo.wage * (crewInfo.overhead / 100)) / that.totalAcres;
      }
    });
    // Init Hoe Crews
    this.hoeCrewsArray.forEach((crew: ThinHoeCrew) => {
      if (!that.totalAcres || that.totalAcres === 0) {
        crew.cpa = 0;
      } else {
        let crewInfo = thinHoeCommonData.find((entry) => entry.id === crew.crew);
        crewInfo = (crewInfo) ? crewInfo.value.value : { wage: 0, overhead: 100};
        const numEmployees = (crew.numEmployees != null) ? crew.numEmployees : 1;
        const hoursWorked = (crew.hoursWorked != null) ? crew.hoursWorked : 1;
        crew.cpa = (numEmployees * hoursWorked * crewInfo.wage * (crewInfo.overhead / 100)) / that.totalAcres;
      }
    });
  }

  updateHoeCrewCPA(hoeCrewsIndex: number, thinHoeCommonData): void {
    if (!this.totalAcres) { this.initTotalAcres(); }
    if (!this.totalAcres || this.totalAcres === 0) {
      this.hoeCrewsArray[hoeCrewsIndex].cpa = 0;
    } else {
      const that = this;
      const crew = that.hoeCrewsArray[hoeCrewsIndex];
      let crewInfo = thinHoeCommonData.find((entry) => entry.id === crew.crew);
      if (crewInfo) {
        crewInfo = crewInfo.value.value;
      } else {
        crewInfo = {wage: 0, overhead: 0};
      }
      const numEmployees = (crew.numEmployees != null) ? crew.numEmployees : 1;
      const hoursWorked = (crew.hoursWorked != null) ? crew.hoursWorked : 1;
      crew.cpa = (numEmployees * hoursWorked * crewInfo.wage * (crewInfo.overhead / 100)) / that.totalAcres;
    }
  }

  updateThinCrewCPA(thinCrewsIndex: number, thinHoeCommonData): void {
    if (!this.totalAcres) { this.initTotalAcres(); }
    if (!this.totalAcres || this.totalAcres === 0) {
      this.thinCrewsArray[thinCrewsIndex].cpa = 0;
    } else {
      const that = this;
      const crew = that.thinCrewsArray[thinCrewsIndex];
      let crewInfo = thinHoeCommonData.find((entry) => entry.id === crew.crew);
      if (crewInfo) {
        crewInfo = crewInfo.value.value;
      } else {
        crewInfo = {wage: 0, overhead: 0};
      }
      const numEmployees = (crew.numEmployees != null) ? crew.numEmployees : 1;
      const hoursWorked = (crew.hoursWorked != null) ? crew.hoursWorked : 1;
      crew.cpa = (numEmployees * hoursWorked * crewInfo.wage * (crewInfo.overhead / 100)) / that.totalAcres;
    }
  }

  initTotalAcres(): void {
    if (this.commodityArray) {
      let totalAcres = 0;
      this.commodityArray.forEach((c) => {
        if (c.cropAcres != null) {
          totalAcres += c.cropAcres;
        }
      });
      this.totalAcres = totalAcres;
    } else {
      this.totalAcres = 0;
    }
  }

  public compareChemicalApplications(a: Chemicals, b: Chemicals): number {
    let comparison = 0;
    const valA = a.date;
    const valB = b.date;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  public compareIrrigations(a: IrrigationEntry, b: IrrigationEntry): number {
    let comparison = 0;
    const valA = a.workDate;
    const valB = b.workDate;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  public compareTractors(a: TractorEntry, b: TractorEntry): number {
    let comparison = 0;
    const valA = a.workDate;
    const valB = b.workDate;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }
}
export enum WorkType {
  Hand, Machine
}
