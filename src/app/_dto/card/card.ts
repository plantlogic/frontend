import {IrrigationEntry} from './irrigation-entry';
import {TractorEntry} from './tractor-entry';

export class Card {
  // bedCount	[integer($int32)]
  bedCount: Array<number> = [];
  // bedType	integer($int32)
  bedType: number;
  // commodity	[string]
  commodity: Array<string> = [];
  // cropAcres	[number($float)]
  cropAcres: Array<number> = [];
  // cropYear	integer($int32)
  cropYear: number;
  // dacthalRate	number($float)
  dacthalRate: number;
  // diaznonRate	number($float)
  diaznonRate: number;
  // fieldID	integer($int32)
  fieldID: number;
  // harvestDate	string($date-time)
  harvestDate: number;
  // hoeDate	string($date-time)
  hoeDate: number;
  // id	string
  id: string;
  // irrigationData	[IrrigationData{...}]
  irrigationData: Array<IrrigationEntry> = [];
  // isClosed	boolean
  isClosed: boolean;
  // kerbRate	number($float)
  kerbRate: number;
  // lastUpdated: string($date-time)
  lastUpdated: number;
  // lorsbanRate	number($float)
  lorsbanRate: number;
  // lotNumber	string
  lotNumber: string;
  // ranchManagerName	string
  ranchManagerName: string;
  // ranchName	string
  ranchName: string;
  // seedLotNumber	[integer($int32)]
  seedLotNumber: Array<number> = [];
  // thinDate	string($date-time)
  thinDate: number;
  // totalAcres	number($float)
  totalAcres: number;
  // tractorData	[TractorData{...}]
  tractorData: Array<TractorEntry> = [];
  // variety	[string]
  variety: Array<string> = [];
  // wetDate	string($date-time)
  wetDate: number;

  public copyConstructor(card: Card): Card {
    this.bedCount = JSON.parse(JSON.stringify(card.bedCount));
    this.bedType = card.bedType;
    this.commodity = JSON.parse(JSON.stringify(card.commodity));
    this.cropAcres = JSON.parse(JSON.stringify(card.cropAcres));
    this.cropYear = card.cropYear;
    this.dacthalRate = card.dacthalRate;
    this.diaznonRate = card.diaznonRate;
    this.fieldID = card.fieldID;
    this.harvestDate = card.harvestDate;
    this.hoeDate = card.hoeDate;
    this.id = card.id;
    this.irrigationData = JSON.parse(JSON.stringify(card.irrigationData));
    this.isClosed = card.isClosed;
    this.kerbRate = card.kerbRate;
    this.lastUpdated = card.lastUpdated;
    this.lorsbanRate = card.lorsbanRate;
    this.lotNumber = card.lotNumber;
    this.ranchManagerName = card.ranchManagerName;
    this.ranchName = card.ranchName;
    this.seedLotNumber = JSON.parse(JSON.stringify(card.seedLotNumber));
    this.thinDate = card.thinDate;
    this.totalAcres = card.totalAcres;
    this.tractorData = JSON.parse(JSON.stringify(card.tractorData));
    this.variety = JSON.parse(JSON.stringify(card.variety));
    this.wetDate = card.wetDate;
    return this;
  }
}
