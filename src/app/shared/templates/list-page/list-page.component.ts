import { ChangeDetectionStrategy, Component, TemplateRef, input, model, output } from '@angular/core';
import { BreadcrumbItem, PageHeaderComponent } from '../../components/page-header/page-header.component';
import { TableComponent } from '../../components/table/table.component';
import { TableColumn } from '../../components/table/table.types';
import { PageShellComponent } from '../page-shell/page-shell.component';

/**
 * A complete list screen: page header with search, a table with pagination, and an empty message.
 * A new list page is only its columns, its rows and the templates of its custom cells:
 *
 *   <app-list-page
 *     title="Sanction Order"
 *     searchPlaceholder="Search Scheme, Ref No..."
 *     [columns]="columns"
 *     [data]="rows()"
 *     [customTemplates]="{ action: actionTemplate }"
 *     [(searchQuery)]="searchQuery"
 *   />
 *   <ng-template #actionTemplate let-row><button appButton size="sm">View</button></ng-template>
 *
 * Content projected into the page (`beforeTable`, `afterTable`, `headerActions`) lands in the
 * matching place, so the usual extras do not need their own layout.
 */
@Component({
  selector: 'app-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent, PageHeaderComponent, TableComponent],
  template: `
    <app-page-shell>
      <app-page-header
        [title]="title()"
        [breadcrumbs]="breadcrumbs()"
        [searchable]="searchable()"
        [searchPlaceholder]="searchPlaceholder()"
        [(searchQuery)]="searchQuery"
      >
        <ng-content select="[headerActions]" />
      </app-page-header>

      <ng-content select="[beforeTable]" />

      <app-table
        [columns]="columns()"
        [data]="data()"
        [pagination]="pagination()"
        [pageSize]="pageSize()"
        [itemUnit]="itemUnit()"
        [emptyMessage]="emptyMessage()"
        [rowClass]="rowClass()"
        [customTemplates]="customTemplates()"
        (rowClick)="rowClick($event)"
      />

      <ng-content select="[afterTable]" />
      <ng-content />
    </app-page-shell>
  `
})
export class ListPageComponent {
  readonly title = input.required<string>();
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
  readonly searchable = input(true);
  readonly searchPlaceholder = input('Search...');
  readonly searchQuery = model('');

  // The row type is the caller's own, like on app-table, so it is left open here.
  readonly columns = input.required<TableColumn<any>[]>();
  readonly data = input.required<unknown[]>();
  readonly pagination = input(true);
  readonly pageSize = input(10);
  readonly itemUnit = input('entries');
  readonly emptyMessage = input('No records found');
  readonly rowClass = input<((row: any, index: number) => string) | undefined>(undefined);
  readonly customTemplates = input<Record<string, TemplateRef<any>>>({});

  readonly rowClicked = output<unknown>();

  protected rowClick(row: unknown): void {
    this.rowClicked.emit(row);
  }
}
