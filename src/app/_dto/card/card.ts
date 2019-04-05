import {IrrigationEntry} from './irrigation-entry';
import {TractorEntry} from './tractor-entry';

export class Card {
  // bedCount	[integer($int32)]
  bedCount: Array<number>;
  // bedType	integer($int32)
  bedType: number;
  // commodity	[string]
  commodity: Array<string>;
  // cropAcres	[number($float)]
  cropAcres: Array<number>;
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
  irrigationData: Array<IrrigationEntry>;
  // kerbRate	number($float)
  kerbRate: number;
  // lorsbanRate	number($float)
  lorsbanRate: number;
  // lotNumber	string
  lotNumber: string;
  // ranchManagerName	string
  ranchManagerName: string;
  // ranchName	string
  ranchName: string;
  // seedLotNumber	[integer($int32)]
  seedLotNumber: Array<number>;
  // thinDate	string($date-time)
  thinDate: number;
  // totalAcres	number($float)
  totalAcres: number;
  // tractorData	[TractorData{...}]
  tractorData: Array<TractorEntry>;
  // variety	[string]
  variety: Array<string>;
  // wetDate	string($date-time)
  wetDate: number;
}
