import {Chemical} from './chemical';

export class IrrigationEntry {
  // The date on which the work was performed
  workDate: number = Date.now();
  // The method	by which the work was performed
  method: string;
  // Any fertilizer applied with irrigation
  fertilizer: Chemical;
  // Any chemical applied with irrigation
  chemical: Chemical;
}
