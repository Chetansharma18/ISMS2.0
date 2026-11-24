import type JSZip from 'jszip';

export interface EvaluationExcelRow {
  sNo: number;
  refNo: string;
  companyName: string;
  status?: string;
  grade?: string;
  reason?: string;
}

export interface EvaluationExcelOptions {
  fileName: string;
  schemeTitle: string;
  eoiRefNo: string;
  rows: EvaluationExcelRow[];
  gradeOptions: string[];
  statusOptions?: string[];
}

function escapeXml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds a genuine OpenXML Microsoft Excel (.xlsx) workbook containing:
 * - Pre-styled header and data rows
 * - Data validation dropdown for Status ("Approved,Reject")
 * - Data validation dropdown for Grading (from Super Admin Grading Master)
 * - Reason / Remarks column for offline evaluation
 */
export async function generateEvaluationExcel(options: EvaluationExcelOptions): Promise<Blob> {
  const { default: JSZipModule } = await import('jszip');
  const zip = new JSZipModule();

  const statuses = options.statusOptions?.length ? options.statusOptions : ['Approved', 'Reject'];
  const grades = options.gradeOptions?.length ? options.gradeOptions : ['A+', 'A', 'B', 'C', 'D'];

  const totalRows = Math.max(options.rows.length + 1, 100);

  // 1. [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  // 2. _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // 3. xl/_rels/workbook.xml.rels
  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`;

  // 4. xl/workbook.xml
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/>
  </bookViews>
  <sheets>
    <sheet name="Applicant Evaluation" sheetId="1" r:id="rId1"/>
    <sheet name="ValidationData" sheetId="2" r:id="rId3" state="hidden"/>
  </sheets>
</workbook>`;

  // 5. xl/styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10.5"/><name val="Segoe UI"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Segoe UI"/></font>
    <font><b/><sz val="10.5"/><color rgb="FF0B3558"/><name val="Segoe UI"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0B3558"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <!-- Header Style (Navy background, White Bold text) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- Normal Left-aligned Data Cell with border -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
    <!-- Center-aligned Data Cell with border -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  // 6. xl/worksheets/sheet1.xml
  let sheetDataXml = `    <row r="1" ht="28" customHeight="1">
      <c r="A1" s="1" t="inlineStr"><is><t>S. No.</t></is></c>
      <c r="B1" s="1" t="inlineStr"><is><t>Ref No / Application ID</t></is></c>
      <c r="C1" s="1" t="inlineStr"><is><t>Company / Agency Name</t></is></c>
      <c r="D1" s="1" t="inlineStr"><is><t>Status (Approved / Reject)</t></is></c>
      <c r="E1" s="1" t="inlineStr"><is><t>Grading</t></is></c>
      <c r="F1" s="1" t="inlineStr"><is><t>Reason / Remarks</t></is></c>
    </row>\n`;

  options.rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const sNo = row.sNo || idx + 1;
    const refNo = escapeXml(row.refNo);
    const companyName = escapeXml(row.companyName);
    const statusVal = escapeXml(row.status || '');
    const gradeVal = escapeXml(row.grade || '');
    const reasonVal = escapeXml(row.reason || '');

    sheetDataXml += `    <row r="${rowNum}" ht="22" customHeight="1">
      <c r="A${rowNum}" s="3"><v>${sNo}</v></c>
      <c r="B${rowNum}" s="3" t="inlineStr"><is><t>${refNo}</t></is></c>
      <c r="C${rowNum}" s="2" t="inlineStr"><is><t>${companyName}</t></is></c>
      <c r="D${rowNum}" s="3" t="inlineStr"><is><t>${statusVal}</t></is></c>
      <c r="E${rowNum}" s="3" t="inlineStr"><is><t>${gradeVal}</t></is></c>
      <c r="F${rowNum}" s="2" t="inlineStr"><is><t>${reasonVal}</t></is></c>
    </row>\n`;
  });

  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>
    <col min="1" max="1" width="10" customWidth="1"/>
    <col min="2" max="2" width="28" customWidth="1"/>
    <col min="3" max="3" width="38" customWidth="1"/>
    <col min="4" max="4" width="24" customWidth="1"/>
    <col min="5" max="5" width="20" customWidth="1"/>
    <col min="6" max="6" width="45" customWidth="1"/>
  </cols>
  <sheetData>
${sheetDataXml}  </sheetData>
  <dataValidations count="2">
    <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" errorTitle="Invalid Status" error="Please select either Approved or Reject from the dropdown." promptTitle="Status Decision" prompt="Select Approved or Reject" sqref="D2:D${totalRows}">
      <formula1>ValidationData!$A$1:$A$${statuses.length}</formula1>
    </dataValidation>
    <dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" errorTitle="Invalid Grade" error="Please select a valid Grade from the dropdown list." promptTitle="Empanelment Grade" prompt="Select Grade as per evaluation" sqref="E2:E${totalRows}">
      <formula1>ValidationData!$B$1:$B$${grades.length}</formula1>
    </dataValidation>
  </dataValidations>
</worksheet>`;

  // 7. xl/worksheets/sheet2.xml (Validation sheet for reliable dropdowns)
  const maxValidationRows = Math.max(statuses.length, grades.length);
  let sheet2RowsXml = '';
  for (let r = 0; r < maxValidationRows; r++) {
    const rNum = r + 1;
    let cells = '';
    if (r < statuses.length) {
      cells += `<c r="A${rNum}" t="inlineStr"><is><t>${escapeXml(statuses[r])}</t></is></c>`;
    }
    if (r < grades.length) {
      cells += `<c r="B${rNum}" t="inlineStr"><is><t>${escapeXml(grades[r])}</t></is></c>`;
    }
    sheet2RowsXml += `    <row r="${rNum}">${cells}</row>\n`;
  }
  const sheet2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
${sheet2RowsXml}  </sheetData>
</worksheet>`;

  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', rootRelsXml);
  zip.file('xl/_rels/workbook.xml.rels', workbookRelsXml);
  zip.file('xl/workbook.xml', workbookXml);
  zip.file('xl/styles.xml', stylesXml);
  zip.file('xl/worksheets/sheet1.xml', sheet1Xml);
  zip.file('xl/worksheets/sheet2.xml', sheet2Xml);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Triggers a download of the generated evaluation spreadsheet in the browser.
 */
export async function downloadEvaluationExcelFile(options: EvaluationExcelOptions): Promise<void> {
  const blob = await generateEvaluationExcel(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = options.fileName.endsWith('.xlsx') ? options.fileName : `${options.fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export interface ParsedEvaluationRow {
  sNo: number;
  refNo: string;
  companyName: string;
  status: string;
  grade: string;
  reason: string;
  isApproved: boolean;
}

export interface ParsedEvaluationResult {
  accepted: ParsedEvaluationRow[];
  rejected: ParsedEvaluationRow[];
  all: ParsedEvaluationRow[];
  fileName: string;
}

/**
 * Parses an uploaded evaluation spreadsheet (.xlsx or .csv) and returns
 * the structured accepted and rejected agencies.
 */
export async function parseEvaluationSpreadsheet(file: File): Promise<ParsedEvaluationResult> {
  const isCsv = file.name.endsWith('.csv');

  if (isCsv) {
    const text = await file.text();
    return parseCsvText(text, file.name);
  }

  // Parse XLSX via JSZip
  const { default: JSZipModule } = await import('jszip');
  const zip = await JSZipModule.loadAsync(file);

  // 1. Shared Strings Table (if present)
  let sharedStrings: string[] = [];
  const sharedStringsFile = zip.file('xl/sharedStrings.xml');
  if (sharedStringsFile) {
    const ssXml = await sharedStringsFile.async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(ssXml, 'application/xml');
    const siNodes = doc.getElementsByTagName('si');
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName('t');
      let text = '';
      for (let j = 0; j < tNodes.length; j++) {
        text += tNodes[j].textContent || '';
      }
      sharedStrings.push(text);
    }
  }

  // 2. Sheet1.xml
  const sheetFile = zip.file('xl/worksheets/sheet1.xml');
  if (!sheetFile) {
    throw new Error('Invalid spreadsheet: sheet1.xml not found');
  }

  const sheetXml = await sheetFile.async('text');
  const parser = new DOMParser();
  const doc = parser.parseFromString(sheetXml, 'application/xml');
  const rows = doc.getElementsByTagName('row');

  const parsedRows: ParsedEvaluationRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = parseInt(row.getAttribute('r') || '0', 10);
    if (rowNum <= 1) continue; // Skip header row

    const cells = row.getElementsByTagName('c');
    let sNo = parsedRows.length + 1;
    let refNo = '';
    let companyName = '';
    let status = '';
    let grade = '';
    let reason = '';

    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      const r = cell.getAttribute('r') || '';
      const col = r.replace(/[0-9]/g, '');
      const t = cell.getAttribute('t');

      let val = '';
      if (t === 'inlineStr') {
        val = cell.getElementsByTagName('t')[0]?.textContent || '';
      } else if (t === 's') {
        const idx = parseInt(cell.getElementsByTagName('v')[0]?.textContent || '-1', 10);
        val = idx >= 0 && idx < sharedStrings.length ? sharedStrings[idx] : '';
      } else {
        val = cell.getElementsByTagName('v')[0]?.textContent || cell.textContent || '';
      }
      val = val.trim();

      if (col === 'A') sNo = parseInt(val, 10) || sNo;
      else if (col === 'B') refNo = val;
      else if (col === 'C') companyName = val;
      else if (col === 'D') status = val;
      else if (col === 'E') grade = val;
      else if (col === 'F') reason = val;
    }

    if (refNo || companyName) {
      const isApproved =
        status.toLowerCase().includes('approv') ||
        status.toLowerCase().includes('eligib') ||
        status.toLowerCase() === 'yes';

      parsedRows.push({
        sNo,
        refNo: refNo || `APP-2026-${String(sNo).padStart(3, '0')}`,
        companyName: companyName || `Agency ${sNo}`,
        status: isApproved ? 'Approved' : 'Reject',
        grade: grade || (isApproved ? 'A' : '-'),
        reason: reason || (isApproved ? 'Qualified as per technical norms' : 'Criteria not fulfilled'),
        isApproved
      });
    }
  }

  const accepted = parsedRows.filter(r => r.isApproved);
  const rejected = parsedRows.filter(r => !r.isApproved);

  return { accepted, rejected, all: parsedRows, fileName: file.name };
}

function parseCsvText(text: string, fileName: string): ParsedEvaluationResult {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const parsedRows: ParsedEvaluationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex for CSV with quoted fields
    const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').trim());

    const sNo = parseInt(cleanMatches[0], 10) || i;
    const refNo = cleanMatches[1] || '';
    const companyName = cleanMatches[2] || '';
    const status = cleanMatches[3] || '';
    const grade = cleanMatches[4] || '';
    const reason = cleanMatches[5] || '';

    if (refNo || companyName) {
      const isApproved =
        status.toLowerCase().includes('approv') ||
        status.toLowerCase().includes('eligib') ||
        status.toLowerCase() === 'yes';

      parsedRows.push({
        sNo,
        refNo: refNo || `APP-2026-${String(sNo).padStart(3, '0')}`,
        companyName: companyName || `Agency ${sNo}`,
        status: isApproved ? 'Approved' : 'Reject',
        grade: grade || (isApproved ? 'A' : '-'),
        reason: reason || (isApproved ? 'Qualified as per criteria' : 'Criteria not fulfilled'),
        isApproved
      });
    }
  }

  const accepted = parsedRows.filter(r => r.isApproved);
  const rejected = parsedRows.filter(r => !r.isApproved);

  return { accepted, rejected, all: parsedRows, fileName };
}

