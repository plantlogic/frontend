import {Chemical} from './chemical';

export class TractorEntry {
  // The date on which the work was performed
  workDate: number = Date.now();
  // The work that was performed by the tractor
  workDone: string;
  // The name of who operated the tractor
  operator: string;

  // Any fertilizer applied by tractor
  fertilizer: Chemical;
  // Any chemical applied by tractor
  chemical: Chemical;
}
