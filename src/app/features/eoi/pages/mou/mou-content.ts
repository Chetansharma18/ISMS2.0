/**
 * Text of the Memorandum of Understanding between RSLDC and a Project Implementing Agency (PIA).
 * Only the scheme name, the references and the dates change from one scheme to the next; the
 * details of the agency are left as blanks to be filled in before printing.
 *
 * Placeholders in a text are written in braces:
 *   {scheme}, {eoiRef}, {eoiDate}, {sanctionRef}, {sanctionDate}  - filled from the scheme and its sanction order
 *   {blank}, {blankShort}, {blankLong}                            - an underlined blank
 */

export interface MouItem {
  /** Clause number, for example "2.1.4". */
  no?: string;
  text: string;
  /** "heading" is a bold sub-heading (no hanging number); "clause" is a numbered clause. */
  kind: 'heading' | 'clause';
  /** Indent level: 1 for 2.1, 2 for 2.1.1, 3 for 11.4.3.1. */
  level: 1 | 2 | 3;
}

export interface MouArticle {
  title: string;
  items: MouItem[];
}

export interface MouRecital {
  letter: string;
  text: string;
}

export type MouPart =
  | { type: 'text'; value: string }
  | { type: 'value'; value: string }
  | { type: 'blank'; size: 'short' | 'normal' | 'long' };

/** Values that fill the placeholders. */
export type MouContext = Partial<Record<'scheme' | 'eoiRef' | 'eoiDate' | 'sanctionRef' | 'sanctionDate', string>>;

/** Splits a text into plain text, filled-in values and blanks. */
export function splitMouText(text: string, context: MouContext): MouPart[] {
  const parts: MouPart[] = [];
  const pattern = /\{(\w+)\}/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) parts.push({ type: 'text', value: text.slice(last, match.index) });
    const key = match[1];
    if (key === 'blankShort') parts.push({ type: 'blank', size: 'short' });
    else if (key === 'blankLong') parts.push({ type: 'blank', size: 'long' });
    else if (key === 'blank') parts.push({ type: 'blank', size: 'normal' });
    else {
      const value = context[key as keyof MouContext];
      parts.push(value ? { type: 'value', value } : { type: 'blank', size: 'normal' });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts;
}

const c = (no: string, text: string, level: 1 | 2 | 3 = 2): MouItem => ({ no, text, kind: 'clause', level });
const h = (no: string, text: string, level: 1 | 2 | 3 = 1): MouItem => ({ no, text, kind: 'heading', level });

export const MOU_RECITALS: MouRecital[] = [
  {
    letter: 'A',
    text: 'RSLDC, on behalf of the Government of Rajasthan, implements skill training programmes for unemployed and marginalised youth in the State of Rajasthan by providing financial assistance from grants-in-aid received from the State Government.'
  },
  {
    letter: 'B',
    text: 'The {scheme}, implemented by RSLDC, is governed by Order No. {blank} dated {blank}.'
  },
  {
    letter: 'C',
    text: 'Funds under the {scheme} are to be released in accordance with the applicable Scheme Guidelines, as amended from time to time.'
  },
  {
    letter: 'D',
    text: 'RSLDC invited proposals for providing skill training to unemployed and marginalised youth, including school dropouts, and for facilitating placement, including 70% wage employment, and career progression in accordance with the applicable guidelines.'
  },
  { letter: 'E', text: 'This MoU is being executed for implementation of the {scheme}.' }
];

export const MOU_ARTICLES: MouArticle[] = [
  {
    title: 'ARTICLE 1 - PURPOSE OF THE MoU',
    items: [
      c('1.1', 'This MoU establishes the framework for implementation of the project by the Parties under the {scheme} Scheme Guidelines, as amended from time to time, and sets out their respective roles and responsibilities for achieving the objectives of the Scheme.', 1),
      c('1.2', 'This MoU is executed with reference to Final Empanelment Order No. {blank} dated {blank}; Sanction Order No. {sanctionRef} dated {sanctionDate}; and EoI Ref. No. {eoiRef} dated {eoiDate}. Any Annual Plan or revision thereof approved by RSLDC, and the terms and conditions of the aforesaid Sanction Order, shall form an integral part of this MoU.', 1),
      c('1.3', 'The Parties affirm that they shall implement the project in letter and spirit.', 1)
    ]
  },
  {
    title: 'ARTICLE 2 - RESPONSIBILITIES OF THE PARTIES',
    items: [
      h('2.1', 'Responsibilities of the PIA'),
      c('2.1.1', 'Be fully and directly responsible for achieving the physical targets specified in the applicable Annual Sanction Orders and for complying with this MoU, the {scheme} Scheme Guidelines effective from {blank}, as amended from time to time, and all applicable Standard Operating Procedures, notifications, circulars, orders and instructions issued by RSLDC or the Government of Rajasthan. This responsibility includes the quality of training, assessment and certification, placement and post-placement follow-up.'),
      c('2.1.2', 'Proactively endeavour to improve quality across the entire project value chain.'),
      c('2.1.3', 'Inform RSLDC in writing, within seven days, of any change affecting its legal status, constitution, ownership, stakeholders, authorised signatory or objectives. If the name of the organisation changes, a fresh MoU shall be executed subject to submission of a valid registration certificate in the new name and verification of legal documents of the new organization.'),
      c('2.1.4', "Submit to RSLDC all information and reports required from time to time, including batch-wise Utilisation Certificates and course-wise reports, and upload the prescribed information on RSLDC's ISMS portal and furnish the same to the concerned district office."),
      c('2.1.5', 'Permit and facilitate RSLDC or its authorised representatives to inspect the programme site, financial statements, books, records, audit reports and documents relating to the grant and its utilisation, and provide all information required for verification.'),
      c('2.1.6', 'Maintain separate books of account and complete records for the project in accordance with generally accepted accounting practices. The PIA shall remain responsible for all obligations under this MoU, and no default under any other agreement shall excuse its obligations or liability hereunder.'),
      c('2.1.7', 'Open and maintain a separate dedicated bank account for implementation of the Programme.'),
      c('2.1.8', 'Ensure that all personnel engaged for performance of its obligations are suitably qualified and trained for their respective functions.'),
      c('2.1.9', 'Maintain close coordination with RSLDC Headquarters and the concerned district office and make available all information, data and records required from time to time.'),
      c('2.1.10', 'Ensure assessment and certification of eligible trainees in accordance with the applicable Scheme Guidelines and RSLDC instructions.'),
      c('2.1.11', 'Ensure placement or gainful livelihood for trained youth in accordance with the applicable guidelines, including the prescribed minimum 70% placement target. Jobs shall provide wages not less than the applicable minimum wages. The PIA shall submit placement records in the prescribed format to RSLDC Headquarters at Jaipur for payment and incentive claims and track trainees for at least one year after completion of training.'),
      c('2.1.12', "Maintain a permanent record of trainees, including their names, parent(s)' names, addresses, contact numbers, course details, assessment certificates, applicable BPL/SC/ST/OBC certificates, photographs, video testimonials and employment details, and provide a soft copy to RSLDC in the prescribed format."),
      c('2.1.13', 'Ensure that no conflict of interest arises in execution of the work and immediately report any such situation to RSLDC.'),
      c('2.1.14', 'Seek extension of a batch start date only within the batch-freezing period. During the batch duration, the PIA may request such change only once.'),
      c('2.1.15', 'Furnish and maintain the Performance Security Deposit in accordance with Clause 11.4.'),
      c('2.1.16', "Install an Aadhaar Enabled, GPRS-enabled Biometric Attendance System (AEBAS) and use the prescribed AEBAS process for recording daily attendance at each Skill Development Centre (SDC) and hostel, where applicable, on RSLDC's ISMS portal, in accordance with Ref. No. RSLDC/MIS/AEBAS/2024-25/18796-001 dated 3 December 2024 and subsequent orders."),
      c('2.1.17', "Install an IP-camera-based face-recognition monitoring system at each SDC, in accordance with Order No. DSEE/RSLDC/MD/2024-25/153 dated 21 October 2024 and UO Note No. RSLDC/MIS/UO NOTE/2024-25/19237-43 dated 18 December 2024. The PIA may select the vendor, but shall ensure integration with Kaushal Darpan and RSLDC's website for live streaming, provide camera credentials to RSLDC's MIS team, and retain complete classroom/laboratory footage for each batch until settlement of the related Utilisation Certificate/payment claim. No In-Principle Approval (IPA) shall be issued unless the system is installed and the prescribed undertaking is submitted with the inspection file/IPA request."),
      h('2.2', 'Responsibilities of RSLDC'),
      c('2.2.1', 'Act as the programme sanctioning, supervising and monitoring agency.'),
      c('2.2.2', 'Discharge its responsibilities through facilitation, timely support and periodic review of project progress.'),
      c('2.2.3', 'Release funds to the PIA in accordance with the prescribed service standards and operational norms of the Scheme Guidelines.'),
      c('2.2.4', 'Review and accord sanction to Annual Plans submitted by the PIA in accordance with the applicable Scheme Guidelines.'),
      c('2.2.5', 'Regularly monitor performance and outputs.'),
      c('2.2.6', 'Review quality performance through field visits, quality-assurance checks and inspections.'),
      c('2.2.7', 'Facilitate exchange of information, dissemination, trend analysis, management feedback and monitoring of the Scheme.'),
      c('2.2.8', 'Exercise its stewardship role in accordance with the applicable Scheme Guidelines and procedures, and undertake regular and concurrent monitoring through field visits and ISMS/MIS review.')
    ]
  },
  {
    title: 'ARTICLE 3 - DISCLAIMER',
    items: [
      c('3.1', "The PIA acknowledges that, before execution of this MoU, it independently and carefully examined the scope of the Programme, specifications and standards, local and ground conditions, and all information contained in RSLDC's guidelines, and assessed the difficulties, risks and hazards likely to arise in performing its obligations. The PIA shall have no claim against RSLDC on this account.", 1),
      c('3.2', 'The PIA accepts the risk of inadequacy, mistake or error relating to any matter set out in this MoU and agrees that RSLDC shall not be liable to the PIA for the same.', 1),
      c('3.3', 'Any mistake or error relating to a matter referred to in Clause 3.1 shall not invalidate this MoU.', 1),
      c('3.4', 'A Party becoming aware of any such mistake or error shall immediately notify the other Party and specify its nature.', 1),
      c('3.5', 'Except as otherwise provided in this MoU, all Programme-related risks shall be borne by the PIA. RSLDC shall not be liable for such risks or their consequences, except where liability arises due to fraud, wilful misconduct or gross negligence of RSLDC, its aggregate liability under this MoU shall not exceed the value of work under the applicable Sanction Order.', 1)
    ]
  },
  {
    title: 'ARTICLE 4 - DETAILS OF THE PROGRAMME',
    items: [
      h('4.1', 'Programme Scope'),
      c('4.1.1', 'The Programme envisages implementation of the {scheme} in accordance with the applicable Scheme Guidelines.'),
      c('4.1.2', 'The PIA shall arrange dedicated skill-training infrastructure, select courses from the approved list having employment potential, identify eligible beneficiaries, engage trainers and facilitators, and monitor implementation of the Programme.'),
      c('4.1.3', 'The PIA shall conduct training in accordance with course outlines prescribed by RSLDC, submit accounts in accordance with the Scheme Guidelines, and ensure placement, gainful livelihood and retention, wherever applicable.'),
      h('4.2', 'Key Activities of the PIA'),
      c('4.2.1', 'Establish fully equipped, dedicated Skill Development Centres with the infrastructure required for training and comply with the AEBAS and IP-camera requirements specified in Clauses 2.1.16 and 2.1.17, including at hostels where residential training is provided.'),
      c('4.2.2', 'Conduct market-assessment studies from time to time to identify changing trends and courses having employment potential.'),
      c('4.2.3', 'Identify and engage qualified trainers/instructors for each course in accordance with the qualifications prescribed in the Scheme Guidelines.'),
      c('4.2.4', 'Conduct orientation and training of trainers at regular intervals.'),
      c('4.2.5', 'Identify, mobilise and counsel potential beneficiaries in accordance with the Scheme Guidelines.'),
      c('4.2.6', 'Distribute the study material, instructional material and handouts prescribed by RSLDC, NSDC or any other competent body to trainees on or before batch freezing.'),
      c('4.2.7', 'Organise training leading to the prescribed competencies.'),
      c('4.2.8', 'Organise soft-skills and entrepreneurship-development training.'),
      c('4.2.9', 'Liaise with RSLDC Headquarters and the concerned district office for the purposes specified in this MoU.'),
      c('4.2.10', 'Establish and strengthen placement cells, self-employment monitoring cells and alumni associations.'),
      c('4.2.11', 'Arrange assessment of all eligible trainees and issuance of training certificates to successful candidates in accordance with the applicable guidelines.'),
      c('4.2.12', 'Maintain and submit records required for responding to Vidhan Sabha questions, Right to Information applications and other official requirements, as and when called for by RSLDC.')
    ]
  },
  {
    title: 'ARTICLE 5 - FINANCIAL OUTLAY',
    items: [
      c('5.1', 'Training costs shall be released in accordance with the {scheme} Scheme Guidelines. The PIA shall be responsible for all applicable taxes and levies.', 1),
      h('5.2', 'The cost structure includes the following inputs:'),
      c('5.2.1', 'Market analysis and need-identification studies for delivering appropriate training and placement assistance.'),
      c('5.2.2', 'Labour-market identification studies, roadshows for youth mobilisation, and identification and selection of eligible beneficiaries for appropriate skill development.'),
      c('5.2.3', 'Participation in capacity-building programmes for faculty, programme staff and industry mentors.'),
      c('5.2.4', 'Engagement of human resources for conducting and managing training.'),
      c('5.2.5', 'Rental of suitable premises with the infrastructure required under the course outline prescribed by RSLDC.'),
      c('5.2.6', 'Provision of raw material in the quantity required for each course.'),
      c('5.2.7', 'Provision of instructional material to each trainee and arrangements for exposure visits or hands-on training.'),
      c('5.2.8', 'Training and placement of trained youth in accordance with the Scheme Guidelines.'),
      c('5.2.9', 'Monitoring industry-institute interface, placement-cell activities and tracking of beneficiaries.'),
      c('5.2.10', 'Administrative and operational expenditure of the training programmes.'),
      c('5.2.11', 'Assessment and certification in accordance with the applicable Scheme Guidelines and RSLDC orders.'),
      c('5.2.12', "Participation in RSLDC's MIS for exchange of information among the Parties and maintenance of the project website and related information, wherever applicable."),
      c('5.2.13', 'Preparation and sharing of records, certificates and information required by RSLDC.'),
      c('5.3', 'The PIA shall ensure that no recovery is outstanding under any RSLDC scheme. Any recovery arising during implementation shall be promptly paid or settled. Claims shall be processed only after verification of outstanding recoveries, and RSLDC may adjust any outstanding amount against payments due to the PIA, including the final payment.', 1),
      c('5.4', 'Failure by the PIA to perform any obligation under this MoU may attract action under Articles 8 and 11 after the PIA has been given a reasonable opportunity of being heard.', 1)
    ]
  },
  {
    title: 'ARTICLE 6 - DISBURSEMENT AND RECOVERY PROCEDURES',
    items: [
      c('6.1', "RSLDC shall disburse training costs to the PIA's separate dedicated bank account maintained for the Programme. Any interest accrued shall be used only for Programme purposes.", 1),
      h('6.2', 'RSLDC may suspend or stop disbursement, or recover training costs, in either of the following circumstances:'),
      c('6.2.1', 'Breach by the PIA of this MoU, including non-utilisation of funds for the sanctioned purpose or diversion of funds to any other purpose or project contrary to Article 5.'),
      c('6.2.2', 'Extraordinary circumstances which, in the opinion of the Government of Rajasthan or RSLDC, are likely to preclude or seriously jeopardise implementation, operation or achievement of the Programme. RSLDC\'s decision shall be final.'),
      h('6.3', "If a circumstance specified in Clause 6.2 occurs and is not remedied to RSLDC's satisfaction, RSLDC may take one or more of the following actions:"),
      c('6.3.1', 'For a breach under Clause 6.2.1, demand immediate repayment of disbursed funds to the extent of non-fulfilment or non-achievement of the obligations under this MoU.'),
      c('6.3.2', 'For a circumstance under Clause 6.2.2, demand immediate repayment of any amount that the PIA is unable to establish as having been used for skill training.'),
      c('6.3.3', 'Impose a penalty, in case of irregularity by the PIA, up to 10% of the total amount disbursed under the applicable Annual Sanction Order.'),
      c('6.3.4', 'If the PIA fails to train the sanctioned number of youth after receiving training cost for a batch, recover the proportionate training cost together with interest at 10%, in accordance with law.'),
      c('6.3.5', 'In case of gross misconduct, irregularity or non-performance, blacklist the PIA from future training programmes.'),
      c('6.3.6', 'Upon termination, blacklisting or debarment of the PIA, cancel all running SDCs and batches, and make no payment for such SDCs or batches, subject to the applicable Scheme Guidelines and orders.'),
      c('6.4', 'The PIA shall collect registration fees from trainees on behalf of RSLDC in accordance with the applicable Scheme Guidelines, remit the batch-wise amount to RSLDC as prescribed, and comply with any revision of the fee notified by RSLDC.', 1),
      c('6.5', "The PIA's eligibility has been determined on the basis of documents and declarations submitted by it. If any material misinformation or concealment is detected, RSLDC may initiate penal action and cancel this MoU unilaterally after providing the PIA a reasonable opportunity of being heard, except where immediate action is warranted under applicable law.", 1)
    ]
  },
  {
    title: 'ARTICLE 7 - SEVERABILITY AND AMENDMENTS',
    items: [
      c('7.1', 'If any provision of this MoU is held invalid or unenforceable, the remaining provisions shall remain unaffected. Any resulting gap shall be addressed through a provision consistent with the purpose of this MoU and settled through mutual consultation.', 1),
      c('7.2', 'Any provision of this MoU may be amended by mutual written consent through an exchange of letters or a written addendum, and each such amendment shall form an integral part of this MoU.', 1)
    ]
  },
  {
    title: 'ARTICLE 8 - SPECIAL CONDITIONS',
    items: [
      c('8.1', "As the {scheme} is a State-sponsored Scheme, all applicable Guidelines, Standard Operating Procedures, notifications, rules, circulars and orders issued from time to time shall apply. RSLDC may amend the applicable norms and guidelines during implementation, and in case of any issue of interpretation or conflict, RSLDC's decision shall be final and binding on the PIA.", 1),
      h('8.2', 'If the PIA fails to achieve the project objectives or comply with the applicable instruments referred to in Clause 8.1, RSLDC may take penal action, including one or more of the following:'),
      c('8.2.1', 'Forfeiture of the PSD of Rs. 2,00,000 (Rupees Two Lakhs Only) per SDC.'),
      c('8.2.2', 'Retraining of candidates without any additional payment to the PIA.'),
      c('8.2.3', 'Closure of one or more training centres.'),
      c('8.2.4', 'Closure of the project.'),
      c('8.2.5', 'Blacklisting of the PIA in the State for a minimum period of three years.'),
      c('8.3', 'If any irregularity is found in the documents, information or figures contained in the proposal or presentation submitted by the PIA under EoI Ref. No. {eoiRef} dated {eoiDate}, RSLDC may take penal action, including termination, blacklisting, forfeiture of PSD and the penalties specified in Clause 8.2.', 1),
      c('8.4', 'RSLDC may initiate appropriate legal or criminal proceedings against the PIA in case of default in project implementation or non-payment of any recovery amount due to RSLDC.', 1),
      c('8.5', 'If a PIA is penalized, debarred, terminated or blacklisted, it may appeal to the competent or appellate authority within 30 days from the date of the order. If the appeal is allowed, the ongoing batches, if any may be resumed from the effective date of decision and in accordance with the appeal order.', 1)
    ]
  },
  {
    title: 'ARTICLE 9 - COMMUNICATION',
    items: [
      h('9.1', 'All notices and communications under this MoU shall be addressed as follows:'),
      c('9.1.1', 'Managing Director, RSLDC, J-8-A, Kaushal Bhawan, EMI Campus, Jhalana Institutional Area, Jhalana Doongari, Jaipur-302004 (Rajasthan); email: md.rsldc-rj@nic.in.'),
      c('9.1.2', 'The PIA at its registered office/head-office address and email address specified in this MoU or subsequently notified in writing.'),
      c('9.2', 'Formal communication may be made by email. The PIA shall keep the details of its authorised representative updated with RSLDC. Any error in the email address or correspondence address supplied by the PIA shall be its sole responsibility.', 1),
      c('9.3', 'Any disclosure of communications or information relating to this MoU, the Scheme Guidelines or related orders and procedures shall require prior written approval of the competent authority, subject to Article 10.', 1)
    ]
  },
  {
    title: 'ARTICLE 10 - CONFIDENTIALITY',
    items: [
      c('10.1', 'The Parties shall keep confidential all non-public information exchanged or generated under this MoU and shall not disclose such information to any third party.', 1),
      c('10.2', "The PIA shall obtain RSLDC's prior written approval before sharing project data with any other agency.", 1),
      h('10.3', 'The obligations in Clauses 10.1 and 10.2 shall not apply to information that:'),
      c('10.3.1', 'was in the public domain at the time of disclosure or subsequently enters the public domain without breach of this MoU; or'),
      c('10.3.2', 'is required to be disclosed under applicable law or by a competent authority.')
    ]
  },
  {
    title: 'ARTICLE 11 - TERMINATION',
    items: [
      h('11.1', 'Termination by RSLDC'),
      {
        text: "RSLDC may terminate this MoU by giving the PIA not less than 15 days' written notice by email and/or post upon the occurrence of any event specified in Clauses 11.1.1 to 11.1.9.",
        kind: 'heading',
        level: 1
      },
      c('11.1.1', 'The PIA fails to remedy a breach of its obligations within 15 days after notice, or within any further period allowed by RSLDC in writing.'),
      c('11.1.2', 'The PIA becomes insolvent or bankrupt, is convicted on criminal or civil charges under applicable law, or any document submitted by it is found to be false or forged.'),
      c('11.1.3', 'Attendance records of trainees or trainers are found to be false or forged.'),
      c('11.1.4', "RSLDC no longer requires the PIA's services, for reasons determined by RSLDC at its sole discretion."),
      c('11.1.5', 'The PIA breaches this MoU or the applicable Scheme Guidelines.'),
      c('11.1.6', 'The PIA is terminated or blacklisted under any other RSLDC scheme for fraudulent practice or any other reason.'),
      c('11.1.7', 'The PIA sublets or franchises any training centre to another agency or individual.'),
      c('11.1.8', 'A major default or deviation from the Scheme Guidelines is detected, in which case empanelment may be cancelled and the PIA may be debarred from applying under any RSLDC EoI for three years.'),
      c('11.1.9', 'The PIA fails to commence training after execution of this MoU, in which case it may be debarred from participation in RSLDC programmes for three years.'),
      h('11.2', 'Termination by the PIA'),
      {
        text: "The PIA may terminate this MoU by giving RSLDC not less than 30 days' written notice upon the occurrence of either event specified in Clauses 11.2.1 and 11.2.2.",
        kind: 'heading',
        level: 1
      },
      c('11.2.1', 'Unforeseen circumstances prevent the PIA from continuing its operations.'),
      c('11.2.2', 'Unforeseen circumstances prevent the PIA from performing a material portion of the services.'),
      h('11.3', 'Payment upon Termination'),
      c('11.3.1', 'Upon termination under Clause 11.1, action shall be taken in accordance with the Scheme Guidelines. Subject to adjustment of any recovery, RSLDC shall pay for batches satisfactorily completed before the effective date of termination or blacklisting.'),
      c('11.3.2', 'Upon termination under Clause 11.2, RSLDC shall pay the PIA, in accordance with Article 6, for services satisfactorily performed before the effective date of termination.'),
      c('11.3.3', 'Where the PIA has failed to deliver or comply with the applicable guidelines, any advance shall be recovered and no final payment shall be made.'),
      h('11.4', 'Performance Security Deposit'),
      c('11.4.1', 'The PIA shall furnish a Performance Security Deposit (PSD) of Rs. 2,00,000 (Rupees Two Lakh only) for each SDC in favour of RSLDC at the time of establishment of the SDC. The PSD shall remain with RSLDC until closure of the SDC.'),
      c('11.4.2', 'The PSD may be refunded only after all allotted batches at the concerned SDC have been completed and fully settled, verified placement is at least 70% of the total trainees, and all outstanding liabilities or recoveries have been discharged.'),
      h('11.4.3', 'The PSD may be forfeited for any of the following reasons:', 2),
      c('11.4.3.1', 'Failure to deliver or comply with the Scheme Guidelines, as amended from time to time.', 3),
      c('11.4.3.2', 'Failure to commence training after issuance of In-Principle Approval (IPA).', 3),
      c('11.4.3.3', 'Discontinuation or non-completion of training without an approved or justifiable reason.', 3),
      c('11.4.3.4', 'Verified placement below 70% of the total number of trained candidates at the concerned SDC.', 3),
      c('11.4.3.5', 'Failure to complete training for at least 60% of the sanctioned target.', 3)
    ]
  },
  {
    title: 'ARTICLE 12 - FORCE MAJEURE',
    items: [
      c('12.1', 'Neither Party shall be treated as being in breach or default to the extent that performance is prevented by an event beyond its reasonable control, including an act of God, civil or military authority, act of public enemy, war, riot, explosion, earthquake, flood, storm or lightning. The affected Party shall promptly notify the other Party. If performance remains prevented for more than six months, the other Party may terminate this MoU.', 1)
    ]
  },
  {
    title: 'ARTICLE 13 - REMOVAL OF DIFFICULTIES',
    items: [
      c('13.1', 'Any matter not specifically covered by this MoU shall be resolved through mutual discussion and, where necessary, recorded through a written addendum.', 1)
    ]
  },
  {
    title: 'ARTICLE 14 - VALIDITY OF THE MoU',
    items: [
      c('14.1', "This MoU shall come into force on the date of execution and remain valid for one year. In exceptional circumstances, it may be extended for a further period of up to one year, subject to the PIA's satisfactory performance and RSLDC's written approval.", 1),
      c('14.2', 'The legal relationship established by this MoU shall terminate on expiry of the validity period or on the completion date of the Programme declared by RSLDC or the Government of Rajasthan, unless extended or earlier terminated in accordance with this MoU.', 1)
    ]
  },
  {
    title: 'ARTICLE 15 - DISPUTE RESOLUTION AND APPLICABLE LAW',
    items: [
      c('15.1', 'Any difference or dispute arising between the Parties shall, in the first instance, be resolved amicably through mutual consultation.', 1),
      c('15.2', 'In the event of an alleged breach by the PIA, the matter shall be discussed between the Parties. If the breach is established, RSLDC may take appropriate action in accordance with this MoU, the EOI, the Scheme Guidelines and applicable law.', 1),
      c('15.3', "If the dispute is not resolved amicably, it shall be referred to the Chairman, RSLDC or his/her nominee for administrative resolution and, if it remains unresolved, may be placed before the Board of Directors of RSLDC for consideration. This administrative process shall not constitute arbitration or an arbitral proceeding under the Arbitration and Conciliation Act, 1996.", 1),
      c('15.4', 'If the dispute remains unresolved after the process under Clause 15.3, either Party may seek appropriate legal remedies before the competent courts at Jaipur, Rajasthan. This MoU shall be governed by the laws of India and the applicable policies of the Government of Rajasthan.', 1),
      c('15.5', 'The courts at Jaipur, Rajasthan shall have exclusive jurisdiction over disputes arising out of or in connection with this MoU.', 1)
    ]
  }
];
