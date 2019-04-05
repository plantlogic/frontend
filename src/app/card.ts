export class Card {
    constructor(
        public ranchName: string,
        public lotNumber: string,
        public acreSize: number,
        public cropYear: number,
        public cropNumber: number,
        public commodity: string,
        public variety: string,
        public bedCount: number,
        public seedLotNumber: number,
        public bedType: number,
        public prepMaterial: string
      ) {}
}
