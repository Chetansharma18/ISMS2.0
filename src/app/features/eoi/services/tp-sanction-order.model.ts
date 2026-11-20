/** A sanction order as the training partner it sanctions sees it: their own district, sector, grade and target. */
export interface TpSanctionOrder {
  /** Scheme id; "View" opens the sanction order of this scheme. */
  id: string;
  /** Sanction order number. */
  orderNo: string;
  schemeTitle: string;
  refNo: string;
  category: string;
  district: string;
  sector: string;
  grade: string;
  target: number;
  releasedOn: string;
}
