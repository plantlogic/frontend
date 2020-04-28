import {IrrigationEntry} from './irrigation-entry';
import {TractorEntry} from './tractor-entry';
import {Commodities} from './commodities';
import {Chemicals} from './chemicals';
import {Comment} from './comment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Chemical } from './chemical';

export class Card {
  // Limits
  readonly MAX_LIST_SIZE_BIG: number = 12;
  readonly MAX_LIST_SIZE_SMALL: number = 3;


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
      card.irrigation.forEach(t => {
        const temp2 = Object.assign(new IrrigationEntry(), t);
        if (!temp2.chemicalArray) { temp2.chemicalArray = new Array<Chemical>(); }
        if (!temp2.fertilizerArray) { temp2.fertilizerArray = new Array<Chemical>(); }
        temp.push(temp2);
      });
      this.irrigation = temp;
    }

    if (card.tractor) {
      const temp: Array<TractorEntry> = new Array<TractorEntry>();
      card.tractor.forEach(t => {
        const temp2 = Object.assign(new TractorEntry(), t);
        if (!temp2.chemicalArray) { temp2.chemicalArray = new Array<Chemical>(); }
        if (!temp2.fertilizerArray) { temp2.fertilizerArray = new Array<Chemical>(); }
        temp.push(temp2);
      });
      this.tractor = temp;
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

  initCommodityString(): void {
    try {
      if (this.commodityArray) {
        this.commodityString = this.commodityArray.map(v => v.commodity).sort().join(', ');
      } else {
        this.commodityString = '';
      }
    } catch { console.log('Error when initializing commodity string'); }
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

  initTotalAcres(): void {
    if (this.commodityArray) {
      this.totalAcres = this.commodityArray.map(v => v.cropAcres).reduce((v, a) => v + a);
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
