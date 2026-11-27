import { describe, expect, it } from 'vitest';
import {
  OrderDto,
  OrderEditorDto,
  OrderSignerDto,
  OrdersOverviewDto,
  SignerOptionDto,
  applySigner,
  eSignActionFor,
  eSignActions,
  signerOptionLabel,
  signingAuthorityText,
  toContentRequest,
  toDraftForm,
  generateBlockers,
  initialOrderStep,
  isOrderComplete,
  isOrderFinal,
  orderSlots,
  orderStatusBadge,
  rowResultBadge,
  secondsUntil
} from './result-orders.util';

const order = (type: string, status: string, extra: Partial<OrderDto> = {}): OrderDto => ({
  id: type === 'Empanelment' ? 1 : 2,
  type,
  round: 1,
  version: 1,
  orderNo: `${type}-1`,
  status,
  applicationCount: 1,
  isStale: false,
  isLatest: true,
  generatedBy: 'X',
  generatedAt: '2026-11-25T05:00:00',
  fileNo: null,
  issuedDate: null,
  signedFileName: null,
  signedUploadedAt: null,
  signedOffAt: null,
  publishedAt: null,
  signoffs: [],
  signoffVerified: 0,
  signoffTotal: 0,
  ...extra
});

const overview = (orders: OrderDto[], counts: Partial<OrdersOverviewDto> = {}): OrdersOverviewDto => ({
  eoiId: 1,
  refNo: 'EOI/1',
  round: 1,
  decisionsLocked: false,
  resultsPublishedAt: null,
  approved: 2,
  rejected: 1,
  undecided: 0,
  orders,
  ...counts
});

describe('result-orders.util', () => {
  it('needs an order per result that has applications', () => {
    expect(orderSlots(null)).toEqual([]);
    expect(orderSlots(overview([], { rejected: 0 })).map(s => s.type)).toEqual(['Empanelment']);
    const slots = orderSlots(overview([order('Rejection', 'Draft'), order('Empanelment', 'Superseded', { isLatest: false })]));
    expect(slots.map(s => [s.type, s.applications, s.order?.status ?? null])).toEqual([
      ['Empanelment', 2, null],
      ['Rejection', 1, 'Draft']
    ]);
  });

  it('opens the dialog at the step the orders have reached', () => {
    expect(initialOrderStep(overview([]))).toBe(1);
    expect(initialOrderStep(overview([order('Empanelment', 'Draft')]))).toBe(2);
    expect(initialOrderStep(overview([order('Empanelment', 'Draft'), order('Rejection', 'Draft', { isStale: true })]))).toBe(2);
    expect(initialOrderStep(overview([order('Empanelment', 'Final'), order('Rejection', 'Draft')]))).toBe(3);
    expect(initialOrderStep(overview([order('Empanelment', 'Signed'), order('Rejection', 'Published')]))).toBe(4);
  });

  it('tells why the orders cannot be generated yet', () => {
    expect(generateBlockers(overview([]))).toEqual([]);
    expect(generateBlockers(overview([], { approved: 0, rejected: 0, undecided: 1 }))).toHaveLength(2);
    expect(generateBlockers(overview([], { undecided: 2 }))[0]).toContain('2 applications are still undecided');
  });

  it('knows final and complete orders', () => {
    expect(isOrderFinal(order('Empanelment', 'Draft'))).toBe(false);
    expect(isOrderFinal(order('Empanelment', 'Final'))).toBe(true);
    expect(isOrderComplete(order('Empanelment', 'Final'))).toBe(false);
    expect(isOrderComplete(order('Empanelment', 'Signed'))).toBe(true);
    expect(isOrderComplete(null)).toBe(false);
  });

  it('turns the editor text into the save request and back', () => {
    const dto: OrderEditorDto = {
      order: order('Empanelment', 'Draft'),
      refNo: 'EOI/1',
      schemeName: 'Scheme 1',
      canEdit: true,
      content: {
        fileNo: 'F () RSLDC/EOI/2026-27/',
        dated: null,
        title: 'Final Empanelment Order',
        subject: 'Empanelment order',
        paragraphs: ['First.', 'Second.'],
        rows: null,
        signatoryName: '',
        signatoryDesignation: 'Managing Director',
        copyTo: ['Guard file'],
        headerTitle: 'Rajasthan Skill & Livelihood Development Corporation',
        headerAddress: 'EMI Campus',
        closingText: null,
        dispatchFileNo: '',
        dispatchDated: null
      },
      rows: [{ applicationId: 7, applicationNo: 'APP-1', agencyName: 'Company 1', grade: 'A', remarks: null, earlierResult: null, category: '', fileStatus: 'Eligible' }]
    };
    const form = toDraftForm(dto);
    expect(form.dated).toBe('');
    expect(form.paragraphs.map(p => p.text)).toEqual(['First.', 'Second.']);

    form.paragraphs.push({ text: '   ' });
    form.copyTo.push({ text: ' PS to MD ' });
    form.rows[0].category = ' A1(skilling) ';
    form.title = ' ';
    expect(toContentRequest(form)).toEqual({
      fileNo: 'F () RSLDC/EOI/2026-27/',
      dated: '',
      title: null,
      subject: 'Empanelment order',
      paragraphs: ['First.', 'Second.'],
      rows: [{ applicationId: 7, category: 'A1(skilling)', fileStatus: 'Eligible' }],
      signatoryName: '',
      signatoryDesignation: 'Managing Director',
      copyTo: ['Guard file', 'PS to MD'],
      headerTitle: 'Rajasthan Skill & Livelihood Development Corporation',
      headerAddress: 'EMI Campus',
      closingText: '',
      dispatchFileNo: '',
      dispatchDated: '',
      // No signing authority on the order or in the content: unchanged on save.
      signerSsoId: null
    });
    // The form is a copy: editing it does not change the loaded rows.
    expect(dto.rows[0].category).toBe('');
  });

  it('offers one e-sign action per order, each for its own signing authority', () => {
    const md: OrderSignerDto = { ssoId: 'RJ.MD', name: 'Committee Member 1', authorityName: '', authorityDesignation: 'Managing Director', isMe: true, canESign: true };
    const oic: OrderSignerDto = { ssoId: 'RJ.OIC', name: 'Committee Member 2', authorityName: 'Scheme OIC', authorityDesignation: 'Scheme 1', isMe: false, canESign: false };
    const both = eSignActions(orderSlots(overview([order('Empanelment', 'Draft', { signer: md }), order('Rejection', 'Draft', { signer: oic })])));
    expect(both.map(a => [a.label, a.canSign])).toEqual([
      ['E-Sign Empanelment Order', true],
      ['E-Sign Rejection Order', false]
    ]);
    expect(both[0].note).toBe('');
    expect(both[1].note).toBe('Only Committee Member 2 can e-sign this order.');

    // Only the order types the EOI has: no rejected application, no Rejection Order button.
    const one = eSignActions(orderSlots(overview([order('Empanelment', 'Draft', { signer: md })], { rejected: 0 })));
    expect(one.map(a => a.label)).toEqual(['E-Sign Empanelment Order']);

    // Each is signed independently: a signed order shows as done, the other one stays to be signed.
    const half = eSignActions(
      orderSlots(overview([order('Empanelment', 'Signed', { signer: { ...md, canESign: false } }), order('Rejection', 'Draft', { signer: { ...oic, isMe: true, canESign: true } })]))
    );
    expect(half.map(a => [a.type, a.done, a.canSign])).toEqual([
      ['Empanelment', true, false],
      ['Rejection', false, true]
    ]);
    expect(half.map(a => a.signedText)).toEqual(['Signed by Committee Member 1', '']);

    // The editor's single-order action; "Signed by" uses who actually signed (signedBy) over the signer's name.
    const signed = eSignActionFor(order('Rejection', 'Published', { signer: { ...oic, signed: true, signedBy: 'Committee Member 3' } }));
    expect([signed.label, signed.done, signed.canSign, signed.signedText]).toEqual(['E-Sign Rejection Order', true, false, 'Signed by Committee Member 3']);
    expect(eSignActionFor(order('Empanelment', 'Draft', { signer: md })).label).toBe('E-Sign Empanelment Order');

    const stale = eSignActions(orderSlots(overview([order('Empanelment', 'Draft', { isStale: true, signer: { ...md, canESign: false } })], { rejected: 0 })));
    expect(stale[0].note).toContain('Generate a new draft');
    const none = eSignActions(orderSlots(overview([order('Empanelment', 'Draft', { signer: null })], { rejected: 0 })));
    expect(none[0].note).toContain('No signing authority');
  });

  it('describes and changes the signing authority', () => {
    expect(signingAuthorityText({ ssoId: 'RJ.OIC', name: 'Committee Member 2', authorityName: 'Scheme OIC', authorityDesignation: 'Scheme 1', isMe: false, canESign: false })).toBe('Scheme OIC, Scheme 1');
    expect(signingAuthorityText({ ssoId: 'RJ.MD', name: 'Committee Member 1', authorityName: '', authorityDesignation: 'Managing Director', isMe: false, canESign: false })).toBe('Committee Member 1, Managing Director');
    expect(signingAuthorityText(null)).toBe('-');

    const approver: SignerOptionDto = { ssoId: 'RJ.A', name: 'Committee Member 1', role: 'Approver', designation: 'Director' };
    const member: SignerOptionDto = { ssoId: 'RJ.B', name: 'Committee Member 2', role: 'Member', designation: null };
    expect(signerOptionLabel(approver)).toBe('Committee Member 1 (Approver, Director)');
    expect(signerOptionLabel(member)).toBe('Committee Member 2 (Member)');

    const dto: OrderEditorDto = {
      order: order('Rejection', 'Draft'),
      refNo: 'EOI/1',
      schemeName: 'Scheme 1',
      canEdit: true,
      content: {
        fileNo: '', dated: '', title: null, subject: '', paragraphs: [], rows: null, signatoryName: '', signatoryDesignation: '',
        copyTo: [], headerTitle: null, headerAddress: '', closingText: '', dispatchFileNo: '', dispatchDated: '', signerSsoId: 'RJ.A'
      },
      rows: [],
      signerOptions: [approver, member]
    };
    const form = toDraftForm(dto);
    expect(form.signerSsoId).toBe('RJ.A');

    // Empty name and designation take the chosen person's details.
    const chosen = applySigner(form, approver, null);
    expect([chosen.signerSsoId, chosen.signatoryName, chosen.signatoryDesignation]).toEqual(['RJ.A', 'Committee Member 1', 'Director']);
    // Switching replaces the previous signer's details; a designation typed by hand is kept.
    const typed = { ...chosen, signatoryDesignation: 'Scheme OIC' };
    const switched = applySigner(typed, member, approver);
    expect([switched.signerSsoId, switched.signatoryName, switched.signatoryDesignation]).toEqual(['RJ.B', 'Committee Member 2', 'Scheme OIC']);
    expect(toContentRequest(switched).signerSsoId).toBe('RJ.B');
    expect(applySigner(form, null, approver).signerSsoId).toBe('');
  });

  it('labels row results, order statuses and OTP answers', () => {
    expect(rowResultBadge('Change')).toEqual({ label: 'Will change', variant: 'info' });
    expect(rowResultBadge('Error').variant).toBe('danger');
    expect(orderStatusBadge('Published').label).toBe('E-signed & released');
  });

  it('counts down to the next OTP', () => {
    const now = Date.parse('2026-11-25T05:00:00Z');
    expect(secondsUntil(null, now)).toBe(0);
    expect(secondsUntil('2026-11-25T05:00:30', now)).toBe(30);
    expect(secondsUntil('2026-11-25T04:59:00Z', now)).toBe(0);
  });
});
