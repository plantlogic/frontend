import {IrrigationEntry} from './irrigation-entry';
import {TractorEntry} from './tractor-entry';
import {Commodities} from './commodities';
import {Chemicals} from './chemicals';

export class Card {
  // Limits
  readonly MAX_LIST_SIZE_BIG: number = 12;
  readonly MAX_LIST_SIZE_SMALL: number = 3;

  // Card ID (used by database to identify specific card)
  id: string;
  // Is the card closed?
  closed: boolean;
  // The date the card was last updated
  lastUpdated: number;

  /*
   ======== IMPORTANT: ==========
   These are custom 'LimitedArrays' - when using push(), they will not add past the maximum allowed number of elements.
   You can then use, for example, irrigation.isFull() to check if the array is already full and if so show an error to the user (and hide
   the 'add' button).
   */
  // Irrigation Data (filled out after card creation) | Max 12
  irrigation: LimitedArray<IrrigationEntry> = new LimitedArray(this.MAX_LIST_SIZE_BIG);
  // Tractor Data (filled out after card creation) | Max 12
  tractor: LimitedArray<TractorEntry> = new LimitedArray(this.MAX_LIST_SIZE_BIG);
  // Commodity Data (filled out on card creation) | Max 3
  commodities: LimitedArray<Commodities> = new LimitedArray<Commodities>(this.MAX_LIST_SIZE_SMALL);
  // Pre-plant Chemicals (filled out on card creation) | Max 3
  preChemicals: LimitedArray<Chemicals> = new LimitedArray<Chemicals>(this.MAX_LIST_SIZE_SMALL);
  // Post-plant Chemicals (filled out after card creation) | Max 12
  postChemicals: LimitedArray<Chemicals> = new LimitedArray<Chemicals>(this.MAX_LIST_SIZE_BIG);

  // Name of the ranch
  ranchName: string;
  // The field ID (set only by admin)
  fieldID: number;
  // The name of the ranch manager
  ranchManagerName: string;
  //
  lotNumber: string;
  //
  shipperID: string;

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






  // =======================
  // Methods
  // =======================

  // Used for creating a copy of a card without referencing old data
  public copyConstructor(card: Card): Card {
    this.id = card.id;
    this.closed = card.closed;
    this.lastUpdated = card.lastUpdated;

    if (card.irrigation) {
      this.irrigation = JSON.parse(JSON.stringify(card.irrigation));
    }

    if (card.tractor) {
      this.tractor = JSON.parse(JSON.stringify(card.tractor));
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
    this.shipperID = card.shipperID;

    this.wetDate = card.wetDate;
    this.thinDate = card.thinDate;
    this.hoeDate = card.hoeDate;
    this.harvestDate = card.harvestDate;

    this.cropYear = card.cropYear;

    return this;
  }
}




export class LimitedArray<T> extends Array<T> {
  max: number;

  constructor(max: number) {
    super();
    this.max = max;
  }

  push = (...value: T[]): number => {
    if (this.length + value.length > this.max) {
      return this.length;
    } else {
      value.forEach(v => super.push(v));
      return this.length;
    }
  }

  isFull(): boolean {
    return this.length >= this.max;
  }
}
