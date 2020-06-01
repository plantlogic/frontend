export class ExportPreset {
    // Preset Info
    id: string;
    name: string;
    dateCreated: number;

    dynamic = {
        card : {
            irrigation : false,
            tractor : false,
            commodities: false,
            preChemicals: false,
        },
        irrigationEntry : {
            fertilizers: false,
            chemicals: false,
        },
        tractorEntry : {
            fertilizers: false,
            chemicals: false
        }
    };

    // 1st Level Depth
    card = [
        {key: 'id', value : true, display: 'Id'},
        {key: 'dateCreated', value : true, display: 'Date Created'},
        {key: 'lastUpdated', value : true, display: 'Last Updated'},
        {key: 'ranchName', value : true, display: 'Ranch Name'},
        {key: 'lotNumber', value : true, display: 'Lot Number'},
        {key: 'fieldID', value : true, display: 'Field Id'},
        {key: 'closed', value : true, display: 'Closed'},
        {key: 'commodities', value : true, display: 'Commodities'},
        {key: 'ranchManagerName', value : true, display: 'Ranch Manager Name'},
        {key: 'shippers', value : true, display: 'Shippers'},
        {key: 'planterNumber', value : true, display: 'Planter Number'},
        {key: 'wetDate', value : true, display: 'Wet Date'},
        {key: 'thinDate', value : true, display: 'Thin Date'},
        {key: 'thinType', value : true, display: 'Thin Type'},
        {key: 'hoeDate', value : true, display: 'Hoe Date'},
        {key: 'hoeType', value : true, display: 'Hoe Type'},
        {key: 'harvestDate', value : true, display: 'Harvest Date'},
        {key: 'cropYear', value : true, display: 'Crop Year'},
        {key: 'totalAcres', value : true, display: 'Total Acres'},
        {key: 'irrigation', value : true, display: 'Irrigation'},
        {key: 'tractor', value : true, display: 'Tractor'},
        {key: 'dripTape', value : true, display: 'Driptape'},
        {key: 'preChemicals', value : true, display: 'Pre-Application'},
        {key: 'comments', value : true, display: 'Comments'}
    ];

    // 2nd Level Depth
    irrigationEntry = [
        {key: 'workDate', value: true, display: 'Work Date'},
        {key: 'method', value: true, display: 'Method'},
        {key: 'fertilizers', value: true, display: 'Fertilizers'},
        {key: 'chemicals', value: true, display: 'Chemicals'},
        {key: 'irrigator', value: true, display: 'Irrigator'},
        {key: 'duration', value: true, display: 'Duration'}
    ];

    tractorEntry = [
        {key: 'workDate', value: true, display: 'Work Date'},
        {key: 'workDone', value: true, display: 'Work Done'},
        {key: 'fertilizers', value: true, display: 'Fertilizers'},
        {key: 'chemicals', value: true, display: 'Chemicals'},
        {key: 'operator', value: true, display: 'Operator'},
        {key: 'tractorNumber', value: true, display: 'Tractor Number'}
    ];

    commodities = [
        {key: 'commodity', value: true, display: 'Commodity'},
        {key: 'variety', value: true, display: 'Variety'},
        {key: 'seedLotNumber', value: true, display: 'Seed Lot Number'},
        {key: 'cropAcres', value: true, display: 'Crop Acres'},
        {key: 'bedCount', value: true, display: 'Bed Count'},
        {key: 'bedType', value: true, display: 'Bed Type'}
    ];

    preChemicals = [
        {key: 'date', value: true, display: 'Date'},
        {key: 'chemical', value: true, display: 'Chemical'},
        {key: 'fertilizer', value: true, display: 'Fertilizer'}
    ];

    // 3rd Level Depth
    irrigationEntryFertilizers = [
        {key: 'name', value: true, display: 'Fertilizer'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    irrigationEntryChemicals = [
        {key: 'name', value: true, display: 'Chemical'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    tractorEntryFertilizers = [
        {key: 'name', value: true, display: 'Fertilizer'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    tractorEntryChemicals = [
        {key: 'name', value: true, display: 'Chemical'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    preChemicalsFertilizer = [
        {key: 'name', value: true, display: 'Fertilizer'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    preChemicalsChemical = [
        {key: 'name', value: true, display: 'Chemical'},
        {key: 'rate', value: true, display: 'Rate'},
        {key: 'unit', value: true, display: 'Unit'}
    ];

    public getPropertyKeys(propertyArrayName: string): Array<string> {
        // Avoid object injection sink
        const keys = [];
        if (this[`${propertyArrayName}`]) {
            this[`${propertyArrayName}`].forEach((e) => {
                keys.push(e[`key`]);
            });
        }
        return keys;
    }

    public getPropertyValue(propertyArrayName: string, key: string): boolean {
        // Avoid object injection sink
        try {
            const index = this.getPropertyKeys(`${propertyArrayName}`).indexOf( `${key}`);
            if (index === -1) {
                return false;
            } else {
                return this[`${propertyArrayName}`][`${index}`][`value`];
            }
        } catch (e) {
            return false;
        }
    }

    public setPropertyValue(propertyArrayName: string, key: string, value: boolean): boolean {
        // Avoid object injection sink
        try {
            const index = this.getPropertyKeys(`${propertyArrayName}`).indexOf(`${key}`);
            if (index === -1) {
                return false;
            } else {
                this[`${propertyArrayName}`][`${index}`][`value`] = value;
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    public getDynamicAccessor(parentObject: string, key: string): string {
        switch (parentObject) {
            case 'card':
                switch (key) {
                    case 'commodities':
                        return 'commodities';
                    case 'irrigation':
                        return 'irrigationEntry';
                    case 'tractor':
                        return 'tractorEntry';
                    case 'preChemicals':
                        return 'preChemicals';
                    default:
                        return null;
                }
            case 'irrigationEntry':
                switch (key) {
                    case 'fertilizers':
                        return 'irrigationEntryFertilizers';
                    case 'chemicals':
                        return 'irrigationEntryChemicals';
                    default:
                        return null;
                }
            case 'tractorEntry':
                switch (key) {
                    case 'fertilizers':
                        return 'tractorEntryFertilizers';
                    case 'chemicals':
                        return 'tractorEntryChemicals';
                    default:
                        return null;
                }
            case 'preChemicals':
                switch (key) {
                    case 'fertilizer':
                        return 'preChemicalsFertilizer';
                    case 'chemical':
                        return 'preChemicalsChemical';
                    default:
                        return null;
                }
            default:
                return null;
        }
    }

    public hasNestedObject(parentObject: string, key: string): boolean {
        switch (parentObject) {
            case 'card':
                switch (key) {
                    case 'commodities':
                    case 'irrigation':
                    case 'tractor':
                    case 'preChemicals':
                        return true;
                    default:
                        return false;
                }
            case 'irrigationEntry':
                switch (key) {
                    case 'fertilizers':
                    case 'chemicals':
                        return true;
                    default:
                        return false;
                }
            case 'tractorEntry':
                switch (key) {
                    case 'fertilizers':
                    case 'chemicals':
                        return true;
                    default:
                        return false;
                }
            case 'preChemicals':
                switch (key) {
                    case 'fertilizer':
                    case 'chemical':
                        return true;
                    default:
                        return false;
                }
            default:
                return false;
        }
    }

    public hasDynamic(parentObject: string, key: string): boolean {
        // Avoid object injection sink
        if (this.dynamic[`${parentObject}`]) {
            const val = this.dynamic[`${parentObject}`][`${key}`];
            if ( val === true || val === false) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public shiftDown(parentObject: string, key: string) {
        // Avoid object injection sink
        const keys = this.getPropertyKeys(`${parentObject}`);
        const index = keys.indexOf(`${key}`);
        if (index < (keys.length - 1)) {
            const copy = Object.assign({}, this[`${parentObject}`][parseInt(`${index}`, 10) + 1]);
            this[`${parentObject}`][parseInt(`${index}`, 10) + 1] = this[`${parentObject}`][`${index}`];
            this[`${parentObject}`][`${index}`] = copy;
        }
    }

    public shiftUp(parentObject: string, key: string) {
        // Avoid object injection sink
        const keys = this.getPropertyKeys(`${parentObject}`);
        const index = keys.indexOf(`${key}`);
        if (index > 0) {
            const copy = Object.assign({}, this[`${parentObject}`][parseInt(`${index}`, 10) - 1]);
            this[`${parentObject}`][parseInt(`${index}`, 10) - 1] = this[`${parentObject}`][`${index}`];
            this[`${parentObject}`][`${index}`] = copy;
        }
    }
}
