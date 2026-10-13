/**
 * Mock history for the EOI applicants: results of earlier schemes (against target) and
 * remarks already recorded by department users on applications under review.
 */
import type { ApplicantResponse, ApplicationActivityLog, PastEngagement } from './eoi-state.models';

const PAST_ENGAGEMENTS: Record<string, PastEngagement[]> = {
  'APP-2024-001': [
    { schemeName: 'Seekho aur Kamao Yojana', financialYear: '2024-25', eoiRefNo: 'RSLDC/EOI/2024/SAKY-02', target: 600, trained: 585, certified: 540, placed: 462, status: 'Completed' },
    { schemeName: 'Mukhya Mantri Yuva Sambal Yojana', financialYear: '2023-24', eoiRefNo: 'RSLDC/EOI/2023/MMYSY-01', target: 400, trained: 392, certified: 371, placed: 318, status: 'Completed' },
    { schemeName: 'Rajasthan Yuva Sambal Yojana', financialYear: '2022-23', eoiRefNo: 'DSEE/EOI/2022/RYSY-01', target: 300, trained: 276, certified: 250, placed: 201, status: 'Completed' }
  ],
  'APP-2024-002': [
    { schemeName: 'PMKVY 4.0 Special Projects', financialYear: '2024-25', eoiRefNo: 'RSLDC/EOI/2024/PMKVY-04', target: 500, trained: 310, certified: 262, placed: 148, status: 'Completed' },
    { schemeName: 'Seekho aur Kamao Yojana', financialYear: '2023-24', eoiRefNo: 'RSLDC/EOI/2023/SAKY-01', target: 250, trained: 240, certified: 228, placed: 190, status: 'Completed' }
  ],
  'APP-2024-003': [
    { schemeName: 'Mukhya Mantri Yuva Sambal Yojana', financialYear: '2023-24', eoiRefNo: 'RSLDC/EOI/2023/MMYSY-02', target: 350, trained: 344, certified: 330, placed: 289, status: 'Completed' }
  ],
  'APP-2024-004': [
    { schemeName: 'Skill Development for Divyangjan (Hunarmand)', financialYear: '2023-24', eoiRefNo: 'RSLDC/EOI/2023/HUN-01', target: 300, trained: 142, certified: 98, placed: 41, status: 'Completed' },
    { schemeName: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana', financialYear: '2022-23', eoiRefNo: 'MORD/EOI/2022/DDUGKY-02', target: 200, trained: 118, certified: 90, placed: 52, status: 'Completed' }
  ],
  'APP-2024-005': [
    { schemeName: 'Rajasthan Yuva Sambal Yojana', financialYear: '2024-25', eoiRefNo: 'DSEE/EOI/2024/RYSY-03', target: 450, trained: 438, certified: 410, placed: 352, status: 'Completed' },
    { schemeName: 'Mukhya Mantri Yuva Sambal Yojana', financialYear: '2025-26', eoiRefNo: 'RSLDC/EOI/2025/MMYSY-03', target: 500, trained: 280, certified: 120, placed: 60, status: 'Ongoing' }
  ],
  'APP-2024-007': [
    { schemeName: 'Seekho aur Kamao Yojana', financialYear: '2024-25', eoiRefNo: 'RSLDC/EOI/2024/SAKY-03', target: 320, trained: 316, certified: 300, placed: 266, status: 'Completed' },
    { schemeName: 'PMKVY 4.0 Special Projects', financialYear: '2023-24', eoiRefNo: 'RSLDC/EOI/2023/PMKVY-03', target: 280, trained: 268, certified: 251, placed: 207, status: 'Completed' },
    { schemeName: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana', financialYear: '2022-23', eoiRefNo: 'MORD/EOI/2022/DDUGKY-01', target: 200, trained: 190, certified: 176, placed: 139, status: 'Completed' }
  ],
  'APP-2024-008': [
    { schemeName: 'Rajasthan Yuva Sambal Yojana', financialYear: '2024-25', eoiRefNo: 'DSEE/EOI/2024/RYSY-04', target: 250, trained: 205, certified: 181, placed: 120, status: 'Completed' }
  ]
};

/** Remarks recorded by department users on applications that are still under review. */
function remarkLog(app: ApplicantResponse, remarks: { actor: string; role: ApplicationActivityLog['actorRole']; at: string; text: string }[]): ApplicationActivityLog[] {
  const base: ApplicationActivityLog[] = [
    {
      id: `ACT-${app.id}-1`,
      timestamp: app.submissionDate,
      action: 'SUBMITTED',
      title: 'EOI Proposal Submitted',
      actor: `${app.authorizedSignatory.name} (${app.authorizedSignatory.designation})`,
      actorRole: 'Applicant / TP',
      description: `Proposal submitted under ${app.schemeName}.`
    }
  ];

  const added = remarks.map((r, i): ApplicationActivityLog => ({
    id: `ACT-${app.id}-R${i + 1}`,
    timestamp: r.at,
    action: 'REMARK_ADDED',
    title: 'Remark added',
    actor: r.actor,
    actorRole: r.role,
    description: r.text,
    meta: { remarks: r.text }
  }));

  return [...base, ...added];
}

const SEED_REMARKS: Record<string, Parameters<typeof remarkLog>[1]> = {
  'APP-2024-001': [
    {
      actor: 'Committee Member 1',
      role: 'Department Scrutiny Officer',
      at: '09/09/2026 11:05 AM',
      text: 'Registration, PAN and GST documents verified against OTR. Training centres at Alwar and Jaipur need an infrastructure check.'
    },
    {
      actor: 'Committee Member 2',
      role: 'Department Scrutiny Officer',
      at: '10/09/2026 03:30 PM',
      text: 'Past track record is satisfactory. Confirm the placement proofs for the FY 2024-25 batch before recommending.'
    }
  ],
  'APP-2024-002': [
    {
      actor: 'Committee Member 1',
      role: 'Department Scrutiny Officer',
      at: '08/09/2026 04:10 PM',
      text: 'Turnover certificate is attached but the UDIN is not legible. Placement in the PMKVY 4.0 project was below target.'
    }
  ],
  'APP-2024-005': [
    {
      actor: 'Committee Member 3',
      role: 'Department Scrutiny Officer',
      at: '06/09/2026 12:20 PM',
      text: 'Documents are complete. Ongoing Mukhya Mantri Yuva Sambal Yojana batch is behind schedule; ask for a status note.'
    },
    {
      actor: 'Committee Member 2',
      role: 'Department Scrutiny Officer',
      at: '07/09/2026 10:45 AM',
      text: 'EMD and processing fee payments are reconciled.'
    }
  ],
  'APP-2024-006': [
    {
      actor: 'Committee Member 3',
      role: 'Department Scrutiny Officer',
      at: '08/09/2026 09:50 AM',
      text: 'First application from this organisation. Society registration and bank mandate verified.'
    }
  ]
};

/** Attaches the mock past engagements and department remarks to the seeded applicants. */
export function withSeedHistory(responses: ApplicantResponse[]): ApplicantResponse[] {
  return responses.map(app => ({
    ...app,
    pastEngagements: PAST_ENGAGEMENTS[app.id] ?? [],
    activityLog: app.activityLog ?? (SEED_REMARKS[app.id] ? remarkLog(app, SEED_REMARKS[app.id]) : undefined)
  }));
}
