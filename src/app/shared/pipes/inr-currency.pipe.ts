import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrCurrency',
  standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    compact: boolean = false,
    symbol: boolean = true
  ): string {
    if (value === null || value === undefined || value === '') return '-';

    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return String(value);

    const prefix = symbol ? '₹ ' : '';

    if (compact) {
      if (Math.abs(num) >= 10000000) {
        return `${prefix}${(num / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(num) >= 100000) {
        return `${prefix}${(num / 100000).toFixed(2)} Lakh`;
      }
    }

    // Standard Indian number format (e.g. 1,00,000)
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(num);

    return `${prefix}${formatted}`;
  }
}
