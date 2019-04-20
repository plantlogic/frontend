export class Chemical {
  // The name of the chemical or fertilizer
  name: string;
  // The rate, as a float - e.g. 2.31
  rate: number;
  // The unit in which the rate is measured
  unit: ChemicalUnit;
}

export enum ChemicalUnit {
  Gallons,
  Pounds
}
