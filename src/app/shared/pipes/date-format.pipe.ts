import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'short' | 'medium' | 'full' = 'short'): string {
    if (!value) return '-';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return String(value);

    const day = String(date.getDate()).padStart(2, '0');
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthsShort[date.getMonth()];
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'medium':
        return `${day} ${month} ${year}`;
      case 'full':
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year}, ${hours}:${minutes}`;
      case 'short':
      default:
        return `${day}/${monthNum}/${year}`;
    }
  }
}
