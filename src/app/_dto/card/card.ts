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
   ==============================
   ======== IMPORTANT: ==========
   ==============================
   These have a $ after them, but access as if it didn't have it (e.g. access 'irrigation$' as 'irrigation'). This will use the setters
   and getters below (important for helping to enforce the list maximum sizes).
   */
  // Irrigation Data (filled out after card creation) | Max 12
  private irrigation$: Array<IrrigationEntry> = [];
  // Tractor Data (filled out after card creation) | Max 12
  private tractor$: Array<TractorEntry> = [];
  // Commodity Data (filled out on card creation) | Max 3
  private commodities$: Array<Commodities> = [];
  // Pre-plant Chemicals (filled out on card creation) | Max 3
  private preChemicals$: Array<Chemicals> = [];
  // Post-plant Chemicals (filled out after card creation) | Max 12
  private postChemicals$: Array<Chemicals> = [];

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

    this.irrigation$ = JSON.parse(JSON.stringify(card.irrigation));
    this.tractor$ = JSON.parse(JSON.stringify(card.tractor));
    this.commodities$ = JSON.parse(JSON.stringify(card.commodities));
    this.preChemicals$ = JSON.parse(JSON.stringify(card.preChemicals));
    this.postChemicals$ = JSON.parse(JSON.stringify(card.postChemicals));

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






  // =======================
  // Getters and setters
  // =======================

  get irrigation(): Array<IrrigationEntry> {
    return this.irrigation$;
  }

  set irrigation(value: Array<IrrigationEntry>) {
    if (value.length > this.MAX_LIST_SIZE_BIG) {
      throw new Error('Only ' + this.MAX_LIST_SIZE_BIG + ' irrigation entries allowed.');
    } else {
      this.irrigation$ = value;
    }
  }

  get tractor(): Array<TractorEntry> {
    return this.tractor$;
  }

  set tractor(value: Array<TractorEntry>) {
    if (value.length > this.MAX_LIST_SIZE_BIG) {
      throw new Error('Only ' + this.MAX_LIST_SIZE_BIG + ' tractor entries allowed.');
    } else {
      this.tractor$ = value;
    }
  }

  get commodities(): Array<Commodities> {
    return this.commodities$;
  }

  set commodities(value: Array<Commodities>) {
    if (value.length > this.MAX_LIST_SIZE_SMALL) {
      throw new Error('Only ' + this.MAX_LIST_SIZE_SMALL + ' commodities allowed.');
    } else {
      this.commodities$ = value;
    }
  }

  get preChemicals(): Array<Chemicals> {
    return this.preChemicals$;
  }

  set preChemicals(value: Array<Chemicals>) {
    if (value.length > this.MAX_LIST_SIZE_SMALL) {
      throw new Error('Only ' + this.MAX_LIST_SIZE_SMALL + ' pre-plant chemicals allowed.');
    } else {
      this.preChemicals$ = value;
    }
  }

  get postChemicals(): Array<Chemicals> {
    return this.postChemicals$;
  }

  set postChemicals(value: Array<Chemicals>) {
    if (value.length > this.MAX_LIST_SIZE_BIG) {
      throw new Error('Only ' + this.MAX_LIST_SIZE_BIG + ' post-plant chemicals allowed.');
    } else {
      this.postChemicals$ = value;
    }
  }


}
