import type JSZip from 'jszip';

export interface EvaluationExcelRow {
  sNo: number;
  refNo: string;
  companyName: string;
  status?: string;
  grade?: string;
  reason?: string;
}

export interface EvaluationExcelGradeOption {
  grade: string;
  range?: string;
  minimum?: number;
  maximum?: number;
}

export interface EvaluationExcelOptions {
  fileName: string;
  schemeTitle: string;
  eoiRefNo: string;
  rows: EvaluationExcelRow[];
  gradeOptions: (string | EvaluationExcelGradeOption)[];
  statusOptions?: string[];
  columns?: ExcelColumnDefinition<EvaluationExcelRow>[];
}

export type ExcelFieldType = 'text' | 'number' | 'dropdown' | 'date';

export interface ExcelColumnValidationRules {
  allowBlank?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  promptTitle?: string;
  promptMessage?: string;
}

export interface ExcelColumnDefinition<T = any> {
  key: keyof T | string;
  label: string;
  width?: number;
  type: ExcelFieldType;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  required?: boolean;
  options?: string[];
  validationRules?: ExcelColumnValidationRules;
}

/**
 * Automatically appends the downward triangle symbol '▼' to a column label
 * if the column type is 'dropdown' and the label doesn't already contain it.
 */
export function getColumnDisplayHeader(col: ExcelColumnDefinition): string {
  if (col.type === 'dropdown') {
    return col.label.includes('▼') ? col.label : `${col.label} ▼`;
  }
  return col.label;
}

/**
 * Converts 0-based column index to Excel column letter (0 -> A, 1 -> B, 25 -> Z, 26 -> AA, etc.)
 */
export function getExcelColumnLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export const DEFAULT_GRADE_RANGES: Record<string, string> = {
  'A+': '85 - 100',
  'A': '70 - 84',
  'B': '55 - 69',
  'C': '40 - 54',
  'D': '0 - 39'
};

/**
 * Standard default column configuration for EOI Applicant Evaluation.
 * Notice: 'status' and 'grade' columns have type 'dropdown' and will automatically
 * receive the '▼' indicator in their display header.
 */
export const EVALUATION_EXCEL_COLUMNS: ExcelColumnDefinition<EvaluationExcelRow>[] = [
  {
    key: 'sNo',
    label: 'S. No.',
    width: 10,
    type: 'number',
    align: 'center',
    editable: false,
    required: true
  },
  {
    key: 'refNo',
    label: 'Ref No / Application ID',
    width: 28,
    type: 'text',
    align: 'left',
    editable: false,
    required: true
  },
  {
    key: 'companyName',
    label: 'Company / Agency Name',
    width: 38,
    type: 'text',
    align: 'left',
    editable: false,
    required: true
  },
  {
    key: 'status',
    label: 'Status',
    width: 24,
    type: 'dropdown',
    align: 'center',
    editable: true,
    required: true,
    options: ['Approved', 'Reject'],
    validationRules: {
      allowBlank: true,
      errorTitle: 'Invalid Status',
      errorMessage: 'Please select either Approved or Reject from the dropdown list.',
      promptTitle: 'Status Decision',
      promptMessage: 'Select Approved or Reject'
    }
  },
  {
    key: 'grade',
    label: 'Grading',
    width: 26,
    type: 'dropdown',
    align: 'center',
    editable: true,
    required: false,
    validationRules: {
      allowBlank: true,
      errorTitle: 'Invalid Grade',
      errorMessage: 'Please select a valid Grade from the dropdown list.',
      promptTitle: 'Empanelment Grade',
      promptMessage: 'Select Grade & Range from dropdown'
    }
  },
  {
    key: 'reason',
    label: 'Reason / Remarks',
    width: 45,
    type: 'text',
    align: 'left',
    editable: true,
    required: false
  }
];

/**
 * Formats a grade and its score range with grade left-aligned and range right-aligned.
 */
export function formatGradeWithRange(grade: string, range?: string, totalWidth = 24): string {
  const g = grade.trim();
  const r = (range || DEFAULT_GRADE_RANGES[g] || '').trim();
  if (!r) return g;
  const spaces = Math.max(2, totalWidth - g.length - r.length);
  return `${g}${' '.repeat(spaces)}${r}`;
}

export const GRADE_DROPDOWN_PROMPT = 'Select Grade';

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
 * - Professional design with Calibri 11pt, Maroon (#800D46) header with bold white text
 * - Data rows with 22pt height, thin light grey (#CBD5E1) borders
 * - Subtle light yellow (#FFF9E8) highlight on dropdown cells to clearly indicate interactive fields
 * - Automatic '▼' indicator in dropdown headers (Status ▼, Grading ▼)
 * - Dynamic data validation ranges calculated from actual exported rows
 * - Stop-style validation with native in-cell dropdown arrows enabled (showDropDown omitted)
 * - Empty cells allowed for progressive unevaluated entry without hardcoded defaults
 * - Dedicated hidden 'ValidationData' worksheet for reliable cross-platform list options
 */
export async function generateEvaluationExcel(options: EvaluationExcelOptions): Promise<Blob> {
  const { default: JSZipModule } = await import('jszip');
  const zip = new JSZipModule();

  const columns = options.columns || EVALUATION_EXCEL_COLUMNS;
  const statuses = options.statusOptions?.length ? options.statusOptions : ['Approved', 'Reject'];

  const rawGrades = options.gradeOptions?.length
    ? options.gradeOptions
    : [
        { grade: 'A+', range: '85 - 100' },
        { grade: 'A', range: '70 - 84' },
        { grade: 'B', range: '55 - 69' },
        { grade: 'C', range: '40 - 54' },
        { grade: 'D', range: '0 - 39' }
      ];

  const gradeItems: { grade: string; range: string; formatted: string }[] = rawGrades.map(opt => {
    if (typeof opt === 'string') {
      const g = opt.trim();
      const r = DEFAULT_GRADE_RANGES[g] || '';
      return { grade: g, range: r, formatted: formatGradeWithRange(g, r) };
    }
    const g = opt.grade.trim();
    const r = (opt.range || (opt.minimum !== undefined && opt.maximum !== undefined ? `${opt.minimum} - ${opt.maximum}` : '') || DEFAULT_GRADE_RANGES[g] || '').trim();
    return { grade: g, range: r, formatted: formatGradeWithRange(g, r) };
  });

  const validationGrades = gradeItems.map(g => g.formatted);

  // Dynamic range calculation: header is row 1, data starts at row 2
  const startRow = 2;
  const rowCount = options.rows.length;
  const endRow = Math.max(startRow, startRow + rowCount - 1);

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

  // 5. xl/styles.xml: Calibri 11pt, Maroon (#800D46) header, Light Yellow (#FFF9E8) dropdown highlight, thin borders
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <!-- 0: Regular Calibri 11pt -->
    <font><sz val="11"/><name val="Calibri"/></font>
    <!-- 1: Bold White Calibri 11pt for Header -->
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <!-- 2: Regular Slate text Calibri 11pt -->
    <font><sz val="11"/><color rgb="FF334155"/><name val="Calibri"/></font>
  </fonts>
  <fills count="4">
    <!-- 0: None -->
    <fill><patternFill patternType="none"/></fill>
    <!-- 1: Gray125 -->
    <fill><patternFill patternType="gray125"/></fill>
    <!-- 2: Application Maroon Header (#800D46) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FF800D46"/><bgColor indexed="64"/></patternFill></fill>
    <!-- 3: Light Yellow for Dropdown cells (#FFF9E8) -->
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF9E8"/><bgColor indexed="64"/></patternFill></fill>
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
  <cellXfs count="6">
    <!-- 0: Default Cell -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <!-- 1: Header (Maroon #800D46, Bold White, Center, Middle, WrapText) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- 2: Data Cell Left-aligned, Middle, White background -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <!-- 3: Data Cell Center-aligned, Middle, White background -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 4: Dropdown Data Cell Center-aligned, Middle, Light Yellow (#FFF9E8) background -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 5: Dropdown Data Cell Left-aligned, Middle, Light Yellow (#FFF9E8) background -->
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

  // 6. xl/worksheets/sheet1.xml
  // Build columns specification
  let colsXml = '  <cols>\n';
  columns.forEach((col, idx) => {
    const colNum = idx + 1;
    const width = col.width || 20;
    colsXml += `    <col min="${colNum}" max="${colNum}" width="${width}" customWidth="1"/>\n`;
  });
  colsXml += '  </cols>\n';

  // Build header row with height 30pt and automatic dropdown indicator (▼)
  let sheetDataXml = `    <row r="1" ht="30" customHeight="1">\n`;
  columns.forEach((col, idx) => {
    const colLetter = getExcelColumnLetter(idx);
    const displayHeader = getColumnDisplayHeader(col);
    sheetDataXml += `      <c r="${colLetter}1" s="1" t="inlineStr"><is><t>${escapeXml(displayHeader)}</t></is></c>\n`;
  });
  sheetDataXml += `    </row>\n`;

  // Build data rows with height 22pt
  options.rows.forEach((row, idx) => {
    const rowNum = idx + startRow;
    const sNo = row.sNo || idx + 1;
    const refNo = escapeXml(row.refNo);
    const companyName = escapeXml(row.companyName);
    const statusVal = row.status ? escapeXml(row.status) : '';
    const reasonVal = row.reason ? escapeXml(row.reason) : '';

    let gradeVal = '';
    if (row.grade) {
      const match = gradeItems.find(g => g.grade.toLowerCase() === row.grade!.trim().toLowerCase());
      gradeVal = match ? match.formatted : row.grade;
    }

    sheetDataXml += `    <row r="${rowNum}" ht="22" customHeight="1">
      <c r="A${rowNum}" s="3"><v>${sNo}</v></c>
      <c r="B${rowNum}" s="2" t="inlineStr"><is><t>${refNo}</t></is></c>
      <c r="C${rowNum}" s="2" t="inlineStr"><is><t>${companyName}</t></is></c>
      <c r="D${rowNum}" s="4" t="inlineStr"><is><t>${statusVal}</t></is></c>
      <c r="E${rowNum}" s="4" t="inlineStr"><is><t>${escapeXml(gradeVal)}</t></is></c>
      <c r="F${rowNum}" s="2" t="inlineStr"><is><t>${reasonVal}</t></is></c>
    </row>\n`;
  });

  // Calculate dynamic validation ranges based on actual column positions and exported rows
  const statusColLetter = getExcelColumnLetter(columns.findIndex(c => c.key === 'status') !== -1 ? columns.findIndex(c => c.key === 'status') : 3);
  const gradeColLetter = getExcelColumnLetter(columns.findIndex(c => c.key === 'grade') !== -1 ? columns.findIndex(c => c.key === 'grade') : 4);
  const statusSqref = `${statusColLetter}${startRow}:${statusColLetter}${endRow}`;
  const gradeSqref = `${gradeColLetter}${startRow}:${gradeColLetter}${endRow}`;

  // OOXML list validation: showDropDown is omitted to enable Excel's native in-cell dropdown arrow
  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
${colsXml}  <sheetData>
${sheetDataXml}  </sheetData>
  <dataValidations count="2">
    <dataValidation type="list" allowBlank="1" errorStyle="stop" showInputMessage="1" showErrorMessage="1" errorTitle="Invalid Status" error="Please select either Approved or Reject from the dropdown." promptTitle="Status Decision" prompt="Select Approved or Reject" sqref="${statusSqref}">
      <formula1>ValidationData!$A$1:$A$${statuses.length}</formula1>
    </dataValidation>
    <dataValidation type="list" allowBlank="1" errorStyle="stop" showInputMessage="1" showErrorMessage="1" errorTitle="Invalid Grade" error="Please select a valid Grade from the dropdown list." promptTitle="Empanelment Grade" prompt="Select Grade &amp; Range from dropdown" sqref="${gradeSqref}">
      <formula1>ValidationData!$B$1:$B$${validationGrades.length}</formula1>
    </dataValidation>
  </dataValidations>
</worksheet>`;

  // 7. xl/worksheets/sheet2.xml (Validation lookup sheet for clean dropdown lists)
  const maxValidationRows = Math.max(statuses.length, validationGrades.length);
  let sheet2RowsXml = '';
  for (let r = 0; r < maxValidationRows; r++) {
    const rNum = r + 1;
    let cells = '';
    if (r < statuses.length) {
      cells += `<c r="A${rNum}" t="inlineStr"><is><t>${escapeXml(statuses[r])}</t></is></c>`;
    }
    if (r < validationGrades.length) {
      cells += `<c r="B${rNum}" t="inlineStr"><is><t>${escapeXml(validationGrades[r])}</t></is></c>`;
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
  errors: string[];
  isValid: boolean;
}

export type EvaluationFieldKey = 'sNo' | 'refNo' | 'companyName' | 'status' | 'grade' | 'reason';

/**
 * Matches an Excel / CSV header string to an internal field key in a case-insensitive manner,
 * ignoring trailing symbols (such as ▼, ▲), punctuation, and extra whitespace.
 */
export function matchHeaderToField(header: string): EvaluationFieldKey | null {
  const norm = header
    .replace(/[▼▲\r\n\t\(\)\[\]\/\\:_\.\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (norm.includes('status')) return 'status';
  if (norm.includes('grad')) return 'grade';
  if (norm.includes('reason') || norm.includes('remark')) return 'reason';
  if (norm.includes('ref') || norm.includes('application') || norm.includes('app id')) return 'refNo';
  if (norm.includes('company') || norm.includes('agency') || norm.includes('applicant')) return 'companyName';
  if (norm.includes('s no') || norm.includes('sno') || norm === 'sn' || norm === 'sl no') return 'sNo';

  return null;
}

/**
 * Parses an uploaded evaluation spreadsheet (.xlsx or .csv) and returns
 * the structured accepted and rejected agencies, along with row-level validation errors.
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

  // Detect column mapping from header row
  const colToField: Record<string, EvaluationFieldKey> = {};
  if (rows.length > 0) {
    const headerRow = rows[0];
    const headerCells = headerRow.getElementsByTagName('c');
    for (let j = 0; j < headerCells.length; j++) {
      const cell = headerCells[j];
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
      const matched = matchHeaderToField(val);
      if (matched) {
        colToField[col] = matched;
      }
    }
  }

  // Fallback positional mapping if header parsing didn't match standard columns
  if (!colToField['B']) colToField['B'] = 'refNo';
  if (!colToField['C']) colToField['C'] = 'companyName';
  if (!colToField['D']) colToField['D'] = 'status';
  if (!colToField['E']) colToField['E'] = 'grade';
  if (!colToField['F']) colToField['F'] = 'reason';
  if (!colToField['A']) colToField['A'] = 'sNo';

  const parsedRows: ParsedEvaluationRow[] = [];
  const errors: string[] = [];
  const seenRefNos = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = parseInt(row.getAttribute('r') || `${i + 1}`, 10);
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

      const field = colToField[col];
      if (field === 'sNo') sNo = parseInt(val, 10) || sNo;
      else if (field === 'refNo') refNo = val;
      else if (field === 'companyName') companyName = val;
      else if (field === 'status') status = val;
      else if (field === 'grade') grade = val;
      else if (field === 'reason') reason = val;
    }

    // Skip entirely empty row
    if (!refNo && !companyName && !status && !grade && !reason) {
      continue;
    }

    // Row-level validations
    if (!refNo) {
      errors.push(`Row ${rowNum}: Application ID / Reference Number is missing.`);
    } else if (seenRefNos.has(refNo.toLowerCase())) {
      errors.push(`Row ${rowNum}: Duplicate Application ID "${refNo}".`);
    } else {
      seenRefNos.add(refNo.toLowerCase());
    }

    const isApproved =
      status.toLowerCase().includes('approv') ||
      status.toLowerCase().includes('eligib') ||
      status.toLowerCase() === 'yes';

    const isReject =
      status.toLowerCase().includes('reject') ||
      status.toLowerCase().includes('not eligib') ||
      status.toLowerCase() === 'no';

    if (!status) {
      errors.push(`Row ${rowNum} (${refNo || 'Applicant'}): Evaluation Status is missing. Please select Approved or Reject.`);
    } else if (isReject && (!reason || !reason.trim())) {
      errors.push(`Row ${rowNum} (${refNo || 'Applicant'}): Reason / Remarks is mandatory for rejected applicants.`);
    }

    let cleanGrade = '';
    if (grade && !grade.toLowerCase().includes('select') && !grade.startsWith('--')) {
      cleanGrade = grade.split(/\s{2,}|[\(\[]/)[0].trim();
    }

    parsedRows.push({
      sNo,
      refNo: refNo || `APP-2026-${String(sNo).padStart(3, '0')}`,
      companyName: companyName || `Agency ${sNo}`,
      status: isApproved ? 'Approved' : 'Reject',
      grade: cleanGrade || (isApproved ? 'A' : '-'),
      reason: reason || (isApproved ? 'Qualified as per technical norms' : ''),
      isApproved
    });
  }

  const accepted = parsedRows.filter(r => r.isApproved);
  const rejected = parsedRows.filter(r => !r.isApproved);

  return {
    accepted,
    rejected,
    all: parsedRows,
    fileName: file.name,
    errors,
    isValid: errors.length === 0
  };
}

function parseCsvText(text: string, fileName: string): ParsedEvaluationResult {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const parsedRows: ParsedEvaluationRow[] = [];
  const errors: string[] = [];
  const seenRefNos = new Set<string>();

  if (lines.length === 0) {
    return { accepted: [], rejected: [], all: [], fileName, errors: ['File is empty.'], isValid: false };
  }

  // Parse header row
  const headerMatches = lines[0].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[0].split(',');
  const headers = headerMatches.map(m => m.replace(/^"|"$/g, '').trim());
  const indexToField: Record<number, EvaluationFieldKey> = {};
  headers.forEach((h, idx) => {
    const matched = matchHeaderToField(h);
    if (matched) indexToField[idx] = matched;
  });

  // Fallback positional mapping
  if (indexToField[1] === undefined) indexToField[1] = 'refNo';
  if (indexToField[2] === undefined) indexToField[2] = 'companyName';
  if (indexToField[3] === undefined) indexToField[3] = 'status';
  if (indexToField[4] === undefined) indexToField[4] = 'grade';
  if (indexToField[5] === undefined) indexToField[5] = 'reason';
  if (indexToField[0] === undefined) indexToField[0] = 'sNo';

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').trim());

    let sNo = parsedRows.length + 1;
    let refNo = '';
    let companyName = '';
    let status = '';
    let grade = '';
    let reason = '';

    cleanMatches.forEach((val, idx) => {
      const field = indexToField[idx];
      if (field === 'sNo') sNo = parseInt(val, 10) || sNo;
      else if (field === 'refNo') refNo = val;
      else if (field === 'companyName') companyName = val;
      else if (field === 'status') status = val;
      else if (field === 'grade') grade = val;
      else if (field === 'reason') reason = val;
    });

    if (!refNo && !companyName && !status && !grade && !reason) {
      continue;
    }

    if (!refNo) {
      errors.push(`Row ${rowNum}: Application ID / Reference Number is missing.`);
    } else if (seenRefNos.has(refNo.toLowerCase())) {
      errors.push(`Row ${rowNum}: Duplicate Application ID "${refNo}".`);
    } else {
      seenRefNos.add(refNo.toLowerCase());
    }

    const isApproved =
      status.toLowerCase().includes('approv') ||
      status.toLowerCase().includes('eligib') ||
      status.toLowerCase() === 'yes';

    const isReject =
      status.toLowerCase().includes('reject') ||
      status.toLowerCase().includes('not eligib') ||
      status.toLowerCase() === 'no';

    if (!status) {
      errors.push(`Row ${rowNum} (${refNo || 'Applicant'}): Evaluation Status is missing. Please select Approved or Reject.`);
    } else if (isReject && (!reason || !reason.trim())) {
      errors.push(`Row ${rowNum} (${refNo || 'Applicant'}): Reason / Remarks is mandatory for rejected applicants.`);
    }

    let cleanGrade = '';
    if (grade && !grade.toLowerCase().includes('select') && !grade.startsWith('--')) {
      cleanGrade = grade.split(/\s{2,}|[\(\[]/)[0].trim();
    }

    parsedRows.push({
      sNo,
      refNo: refNo || `APP-2026-${String(sNo).padStart(3, '0')}`,
      companyName: companyName || `Agency ${sNo}`,
      status: isApproved ? 'Approved' : 'Reject',
      grade: cleanGrade || (isApproved ? 'A' : '-'),
      reason: reason || (isApproved ? 'Qualified as per criteria' : ''),
      isApproved
    });
  }

  const accepted = parsedRows.filter(r => r.isApproved);
  const rejected = parsedRows.filter(r => !r.isApproved);

  return {
    accepted,
    rejected,
    all: parsedRows,
    fileName,
    errors,
    isValid: errors.length === 0
  };
}
