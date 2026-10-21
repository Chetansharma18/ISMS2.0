/**
 * Dummy sanction orders shown on the training partner's Sanction Order page, as the partner sees them:
 * only the orders that sanction them, with their own district, sector, grade and target.
 * Not linked to the real applications or to the login yet.
 */
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

export const TP_SANCTION_ORDERS: TpSanctionOrder[] = [
  {
    id: 'MMKVY-01',
    orderNo: 'RSLDC/SO/2026-27/0147',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    refNo: 'RSLDC/EOI/2026/MMKVY-01',
    category: 'Rajvik',
    district: 'Alwar',
    sector: 'Handicraft & Local Resource Based Skills',
    grade: 'A+',
    target: 90,
    releasedOn: '14 Oct 2026, 12:40 AM'
  },
  {
    id: 'MMKVY-02',
    orderNo: 'RSLDC/SO/2026-27/0213',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    refNo: 'RSLDC/EOI/2026/MMKVY-02',
    category: 'Samarth',
    district: 'Jaipur, Kota',
    sector: 'Food Processing, IT-ITeS',
    grade: 'A',
    target: 150,
    releasedOn: '02 Nov 2026, 11:15 AM'
  }
];
