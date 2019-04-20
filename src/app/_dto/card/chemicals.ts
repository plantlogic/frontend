import {Chemical} from './chemical';

export class Chemicals {
  // The date on which the chemical was applied
  date: number = Date.now();
  // Any chemical applied (I believe pesticides would go here)
  chemical: Chemical;
  // Any fertilizer applied
  fertilizer: Chemical;
}
