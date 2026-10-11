export interface IpaCourseRow {
  id: string;
  sector: string;
  courseName: string;
  courseCode: string;
  durationDays: number;
  durationHours: number;
  mandatoryOjt: string;
  minEdu: string;
  minAge: string;
  rnr: string;
  rCat: string;
  costC: number;
  costH: number;
  costToolkit: string;
  totalCostPerTrainee: number;
  approvedTrainees: number;
  costPerBatch: number;
  cycles: number;
  totalBudget: number;
  perDayHours: number;
}

export interface TargetSummaryRow {
  sNo: number;
  particular: string;
  value: string;
}
