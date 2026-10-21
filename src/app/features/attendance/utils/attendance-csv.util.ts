function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).trim().replace(/"/g, '""')}"`;
}

/** The CSV text of a table (with a byte-order mark so Excel opens it with the right encoding). */
export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\r\n');
}

/** Downloads a table as a CSV file. */
export function downloadCsv(fileName: string, headers: readonly string[], rows: readonly (readonly unknown[])[]): void {
  const blob = new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
