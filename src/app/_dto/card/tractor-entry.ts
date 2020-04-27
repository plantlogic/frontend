import {Chemical} from './chemical';

export class TractorEntry {
  readonly MAX_LIST_SIZE: number = 2;
  readonly chemicalsMax = this.MAX_LIST_SIZE;
  readonly fertilizersMax = this.MAX_LIST_SIZE;
  // The date on which the work was performed
  workDate: number = Date.now();
  // The work that was performed by the tractor
  workDone: string;
  // The name of who operated the tractor
  operator: string;
  // Any fertilizer applied by tractor
  private fertilizers: Array<Chemical> = new Array<Chemical>();
  // Any chemical applied by tractor
  private chemicals: Array<Chemical> = new Array<Chemical>();
  // Tractor number
  tractorNumber: string;

  get chemicalArray(): Array<Chemical> {
    if (this.chemicals.length > this.chemicalsMax) {
      this.chemicals = this.chemicals.slice(0, this.chemicalsMax);
    }
    return (this.chemicals) ? this.chemicals : new Array<Chemical>();
  }

  set setChemicalArray(value: Array<Chemical>) {
    if (value.length > this.chemicalsMax) {
      this.chemicals = value.slice(0, this.chemicalsMax);
    } else {
      this.chemicals = value;
    }
  }
  chemicalsFull(): boolean {
    return this.chemicals.length >= this.chemicalsMax;
  }
  get fertilizerArray(): Array<Chemical> {
    if (this.fertilizers.length > this.fertilizersMax) {
      this.fertilizers = this.fertilizers.slice(0, this.fertilizersMax);
    }
    return (this.fertilizers) ? this.fertilizers : new Array<Chemical>();
  }
  set setFertilizerArray(value: Array<Chemical>) {
    if (value.length > this.fertilizersMax) {
      this.fertilizers = value.slice(0, this.fertilizersMax);
    } else {
      this.fertilizers = value;
    }
  }
  fertilizersFull(): boolean {
    return this.fertilizers.length >= this.fertilizersMax;
  }
}
