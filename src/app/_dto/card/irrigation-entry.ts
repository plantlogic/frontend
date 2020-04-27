import {Chemical} from './chemical';

export class IrrigationEntry {
  readonly MAX_LIST_SIZE: number = 2;
  readonly chemicalsMax = this.MAX_LIST_SIZE;
  readonly fertilizersMax = this.MAX_LIST_SIZE;
  // The date on which the work was performed
  workDate: number = Date.now();
  // The method	by which the work was performed
  method: string;
  // Any fertilizers applied with irrigation
  private fertilizers: Array<Chemical> = new Array<Chemical>();
  // Any chemicals applied with irrigation
  private chemicals: Array<Chemical> = new Array<Chemical>();
  // Person overseeing the irrigation proccess
  irrigator: string;
  // Duration spent (in hours)
  duration: number;

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
