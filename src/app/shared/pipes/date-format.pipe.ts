import { Pipe, PipeTransform } from '@angular/core';
import { formatDate, formatDateMedium, formatDateTime } from '../utils/date.util';

/** Template wrapper around shared/utils/date.util so pipes and TS code format dates identically. */
@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: 'short' | 'medium' | 'full' = 'short'): string {
    switch (format) {
      case 'medium':
        return formatDateMedium(value);
      case 'full':
        return formatDateTime(value);
      case 'short':
      default:
        return formatDate(value);
    }
  }
}
