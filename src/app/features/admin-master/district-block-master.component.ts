import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { FilterTabsComponent, MasterCrudConfig, MasterCrudPageComponent } from '../../shared';
import { DistrictBlockMasterItem, DistrictMasterItem } from '../../core/models/admin-masters.model';
import { withDistrictNames } from '../../core/models/master-adapters';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { DataEngineService } from '../../core/services/data-engine.service';
import {
  BLOCK_TABLE,
  DISTRICT_BLOCK_TABS,
  DISTRICT_TABLE,
  DistrictBlockTab,
  blockConfig,
  districtConfig,
  tabFromQuery,
  toDistrictItem,
  withBlockCounts
} from './district-block-master.util';

export type { DistrictBlockMasterItem, DistrictMasterItem };

type BlockRow = DistrictBlockMasterItem & { districtId?: number };

/**
 * District & Block Master (/admin/master/district-block): a District tab and a Block tab, each a master table with
 * its own Add / Edit / Active switch, following the DistrictMasters and BlockMasters permissions. `?tab=block` opens
 * the Block tab.
 */
@Component({
  selector: 'app-district-block-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasterCrudPageComponent, FilterTabsComponent],
  template: `
    @if (tab() === 'district') {
      <app-master-crud-page [config]="districtConfig">
        <app-filter-tabs masterCrudTabs ariaLabel="Master" [options]="tabs()" [value]="tab()" (valueChange)="selectTab($event)" />
      </app-master-crud-page>
    } @else {
      <app-master-crud-page [config]="blockConfig">
        <app-filter-tabs masterCrudTabs ariaLabel="Master" [options]="tabs()" [value]="tab()" (valueChange)="selectTab($event)" />
      </app-master-crud-page>
    }
  `
})
export class DistrictBlockMasterComponent {
  private readonly dataEngine = inject(DataEngineService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Districts as last read: the Block tab's District dropdown and filter. */
  readonly districts = signal<DistrictMasterItem[]>([]);

  /** The tabs the user may read (both when neither table is known, e.g. mock sign-in). */
  private readonly allowedTabs = computed<DistrictBlockTab[]>(() => {
    const allowed: DistrictBlockTab[] = [];
    if (this.tableAccess.can(DISTRICT_TABLE, 'GET')) allowed.push('district');
    if (this.tableAccess.can(BLOCK_TABLE, 'GET')) allowed.push('block');
    return allowed.length > 0 ? allowed : ['district', 'block'];
  });
  readonly tabs = computed(() => DISTRICT_BLOCK_TABS.filter(t => this.allowedTabs().includes(t.id)));

  private readonly queryTab = toSignal(this.route.queryParamMap.pipe(map(p => p.get('tab'))), { initialValue: null });
  readonly tab = computed<DistrictBlockTab>(() => tabFromQuery(this.queryTab(), this.allowedTabs()));

  readonly districtConfig: MasterCrudConfig<DistrictMasterItem> = districtConfig(rows =>
    this.blocks().pipe(map(blocks => (blocks ? withBlockCounts(rows, blocks) : rows)), tap(list => this.districts.set(list)))
  );

  readonly blockConfig: MasterCrudConfig<DistrictBlockMasterItem> = blockConfig(
    () => this.districts(),
    // A block record carries only its districtId; the district name comes from the District list.
    rows => this.loadDistricts().pipe(map(raw => withDistrictNames(rows, raw)))
  );

  selectTab(tab: DistrictBlockTab): void {
    if (tab === this.tab()) return;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  /** Every district (raw records), also kept for the Block tab. Empty when they cannot be read. */
  private loadDistricts(): Observable<unknown[]> {
    if (!this.tableAccess.can(DISTRICT_TABLE, 'GET')) return of([]);
    return this.dataEngine
      .for<unknown>('DISTRICT_MASTERS')
      .getAll()
      .pipe(
        tap(raw => this.districts.set(raw.map((d, i) => toDistrictItem(d, i)))),
        catchError(() => of([] as unknown[]))
      );
  }

  /** Every block, to count them per district; null when the blocks cannot be read (no BlockMasters access). */
  private blocks(): Observable<BlockRow[] | null> {
    if (!this.tableAccess.can(BLOCK_TABLE, 'GET')) return of(null);
    return this.dataEngine
      .for<BlockRow>('DISTRICTS')
      .getAll()
      .pipe(catchError(() => of(null)));
  }
}
