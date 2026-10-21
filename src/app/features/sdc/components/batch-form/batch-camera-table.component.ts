import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CAMERA_VENDORS, CameraItem } from './batch-form.util';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../shared';

// Default change detection: the parent pushes/splices cameraList in place and rewrites cameraErrors.
// app-table is OnPush and only refreshes on a new array, so the grid is fed a shallow copy (`rows`) that is
// rebuilt after every add/remove. The row objects stay the parent's own, so ngModel still edits them in place.
@Component({
  selector: 'app-batch-camera-table',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-2.5">
      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
        <div class="flex items-center gap-2" style="font-size: 13.5px !important; color: #0B3558 !important;">
          <span class="w-1.5 h-3.5 bg-navy rounded-xs inline-block"></span>
          <h3 class="font-bold m-0" style="font-size: 13.5px !important; color: #0B3558 !important;">Camera Configuration</h3>
          <span class="text-[11px] font-normal text-slate-500">({{ cameraList().length }} camera{{ cameraList().length === 1 ? '' : 's' }} added)</span>
        </div>

        <button appButton size="sm" type="button" (click)="onAdd()" title="Add a camera">
          <app-icon name="plus" size="sm" />
          <span>Add Camera</span>
        </button>
      </div>

      <p class="text-[11px] text-slate-500 m-0">
        At least one camera is required. Enter its vendor, login and the live feed link.
      </p>

      <app-table
        [columns]="columns"
        [data]="rows()"
        [customTemplates]="{
          vendor: vendorTpl,
          ipAddress: ipTpl,
          username: userTpl,
          password: passwordTpl,
          liveFeedUrl: feedTpl,
          action: actionTpl
        }"
      />

      <ng-template #vendorTpl let-camera let-i="index">
        <select appInput size="sm" [(ngModel)]="camera.vendor" [name]="'camera_vendor_' + i" class="w-full" [invalid]="!!cameraErrors()[i]">
          <option value="">Select vendor</option>
          @for (vendor of vendors; track vendor) {
            <option [value]="vendor">{{ vendor }}</option>
          }
        </select>
      </ng-template>

      <ng-template #ipTpl let-camera let-i="index">
        <input appInput size="sm" type="text" autocomplete="off" [(ngModel)]="camera.ipAddress" [name]="'camera_ip_' + i" placeholder="e.g. 192.168.1.20:554" class="w-full" />
      </ng-template>

      <ng-template #userTpl let-camera let-i="index">
        <input appInput size="sm" type="text" autocomplete="off" [(ngModel)]="camera.username" [name]="'camera_user_' + i" placeholder="User name" class="w-full" [invalid]="!!cameraErrors()[i]" />
      </ng-template>

      <ng-template #passwordTpl let-camera let-i="index">
        <input appInput size="sm" type="password" autocomplete="new-password" [(ngModel)]="camera.password" [name]="'camera_pass_' + i" placeholder="Password" class="w-full" [invalid]="!!cameraErrors()[i]" />
      </ng-template>

      <ng-template #feedTpl let-camera let-i="index">
        <input appInput size="sm" type="text" autocomplete="off" [(ngModel)]="camera.liveFeedUrl" [name]="'camera_feed_' + i" placeholder="rtsp://… or https://…" class="w-full" [invalid]="!!cameraErrors()[i]" />
        @if (cameraErrors()[i]) {
          <span class="text-[10.5px] text-red-600 font-medium block mt-0.5">{{ cameraErrors()[i] }}</span>
        }
      </ng-template>

      <ng-template #actionTpl let-camera let-i="index">
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="onRemove(i)"
          [disabled]="cameraList().length === 1"
          title="Remove camera"
          aria-label="Remove camera"
        >
          <app-icon name="trash" />
        </button>
      </ng-template>
    </div>
  `
})
export class BatchCameraTableComponent {
  /** Parent-owned rows; edited in place through ngModel. */
  readonly cameraList = input.required<CameraItem[]>();
  /** One message per row ('' when fine), set by the parent when the form is submitted. */
  readonly cameraErrors = input<string[]>([]);

  readonly addCamera = output<void>();
  readonly removeCamera = output<number>();

  protected readonly vendors = CAMERA_VENDORS;

  /** Bumped after each add/remove so `rows` becomes a new array even though the parent mutates its own. */
  private readonly version = signal(0);

  protected readonly rows = computed(() => {
    this.version();
    return [...this.cameraList()];
  });

  protected readonly columns: TableColumn<CameraItem>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'vendor', label: 'Vendor *', width: 'min-w-[150px]' },
    { key: 'ipAddress', label: 'IP Address : Port', width: 'min-w-[170px]' },
    { key: 'username', label: 'User Name *', width: 'min-w-[140px]' },
    { key: 'password', label: 'Password *', width: 'min-w-[140px]' },
    { key: 'liveFeedUrl', label: 'Live Feed Link *', width: 'min-w-[260px]' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-16' }
  ];

  protected onAdd(): void {
    this.addCamera.emit();
    this.version.update(v => v + 1);
  }

  protected onRemove(index: number): void {
    this.removeCamera.emit(index);
    this.version.update(v => v + 1);
  }
}
