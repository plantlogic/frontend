export class ThinHoeCrew {
    date: number = Date.now();
    crew: string;
    numEmployees: number;
    hoursWorked: number;
    comment: string;
    rehoe: false; // Only used for Hoe-Crews
    cpa: number; // Cost Per Acre; Only initialized on frontend (formula based)
}
