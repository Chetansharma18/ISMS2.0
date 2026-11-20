import type { IpaCourseRow } from '../eoi/services/eoi-state.models';

/** An In-Principal Approval issued to the training partner, as the partner sees it. */
export interface TpIpa {
  ipaId: string;
  ipaNumber: string;
  schemeId: string;
  schemeTitle: string;
  refNo: string;
  /** Category as shown in tables ("Rajvik"). */
  category: string;
  /** Scheme and category codes handed to the SDC form. */
  scheme: string;
  schemeCategory: string;
  tpName: string;
  courses: IpaCourseRow[];
}
