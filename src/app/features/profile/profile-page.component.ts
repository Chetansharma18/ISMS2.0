import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent, LoaderComponent, ProgressRingComponent } from '../../shared';
import { AspirantProfileFormComponent } from '../aspirant/components/aspirant-profile-form.component';
import { AspirantPortalService } from '../aspirant/services/aspirant-portal.service';
import { OtrFormDef, OtrRecords } from '../registration/models/otr-api.model';
import { formSteps } from '../registration/otr-form.util';
import { OtrRegistrationService } from '../registration/services/otr-registration.service';
import { ProfileAccountCardComponent } from './parts/profile-account-card.component';
import { ProfileOtrCardComponent } from './parts/profile-otr-card.component';
import { SecurityPinCardComponent } from './parts/security-pin-card.component';
import { ProfileMode, accountFields, hasFilledOtr, isDefaultRole, profileMode, sessionRoleName } from './profile-view.util';

/** Backend table of the One Time Registration (its records need this permission). */
const OTR_TABLE = 'OtrRegistrations';

/**
 * Profile. Aspirants have their own profile form. For everyone else:
 * - a user who has saved a One Time Registration (any role) sees it as filled, built from the backend form
 *   definition and their records (fixed and FormManager fields);
 * - a user signed in with the default role (`User`, every new RajSSO user) who has not filled it sees its steps
 *   to start from;
 * - any other user sees the account details of GET /auth/me.
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    IconComponent,
    AspirantProfileFormComponent,
    LoaderComponent,
    ProgressRingComponent,
    ProfileAccountCardComponent,
    ProfileOtrCardComponent,
    SecurityPinCardComponent
  ],
  template: `
    <!-- KYC status shown on every profile. No KYC check is connected yet, so it reads "Pending". -->
    <ng-template #kycBadge>
      <span
        class="relative z-10 inline-flex items-center gap-1.5 self-start md:self-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs select-none"
        role="status"
        title="Your KYC verification is pending"
      >
        <app-icon name="alert-triangle" size="sm" [stroke]="2.2" />
        <span>KYC Pending</span>
      </span>
    </ng-template>

    <div class="w-full min-h-full font-sans p-4 sm:p-5 space-y-5" style="background-color: #FFFFFF;">

      @if (isAspirant()) {
        <!-- ASPIRANT PROFILE VIEW -->
        <div class="relative w-full rounded-[10px] overflow-hidden border border-[#EADCE2] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-3.5 sm:px-7 sm:py-4 bg-[#FCF0F2]">
          <div
            class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
            style="background-image: url('/hero-bg.png'); background-position: right 20%; opacity: 0.95;"
          ></div>
          <div
            class="absolute inset-0 pointer-events-none"
            style="background: linear-gradient(90deg, #FCF0F2 0%, #FCF0F2 28%, rgba(252, 240, 242, 0.90) 52%, rgba(252, 240, 242, 0.30) 72%, transparent 100%);"
          ></div>
          <div class="relative z-10 flex items-center gap-3">
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-[#7C0E44] m-0">
                Aspirant Profile Summary
              </h1>
              <p class="text-xs sm:text-[13px] text-[#625663] mt-1 m-0 font-normal">
                Complete your candidate registration steps to become eligible to express interest in training programs under RSLDC.
              </p>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="kycBadge" />
        </div>

        <div class="w-full bg-white border border-[#EADCE2] rounded-[10px] p-4 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start md:items-center text-center sm:text-left gap-4 sm:gap-6 flex-1 min-w-0">
            <app-progress-ring
              [value]="aspirantCompletionPercentage()"
              [complete]="isAspirantComplete()"
              class="w-20 h-20 sm:w-24 sm:h-24"
            />
            <div class="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <h2 class="text-base sm:text-[17px] font-bold text-[#25212A] m-0">Aspirant Registration</h2>
              <p class="text-xs sm:text-[13px] text-[#625663] leading-relaxed m-0 max-w-3xl">
                Complete all mandatory candidate registration steps to become eligible for skill training admissions. Once complete, you can express interest for all open training programs.
              </p>
            </div>
          </div>
        </div>

        <app-aspirant-profile-form (profileSaved)="onAspirantProfileSaved()"></app-aspirant-profile-form>
      } @else {
        <!-- HERO BANNER -->
        <div class="relative w-full rounded-[10px] overflow-hidden border border-[#EADCE2] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-3.5 sm:px-7 sm:py-4 bg-[#FCF0F2]">
          <div
            class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none"
            style="background-image: url('/hero-bg.png'); background-position: right 20%; opacity: 0.95;"
          ></div>
          <div
            class="absolute inset-0 pointer-events-none"
            style="background: linear-gradient(90deg, #FCF0F2 0%, #FCF0F2 28%, rgba(252, 240, 242, 0.90) 52%, rgba(252, 240, 242, 0.30) 72%, transparent 100%);"
          ></div>
          <div class="relative z-10 flex items-center gap-3">
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-[#7C0E44] m-0">Profile Summary</h1>
              <p class="text-xs sm:text-[13px] text-[#625663] mt-1 m-0 font-normal">
                @if (mode() === 'account') {
                  Your account details as registered with the portal.
                } @else {
                  Complete your registration steps to become eligible for scheme proposals under RSLDC.
                }
              </p>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="kycBadge" />
        </div>

        @if (otrLoading()) {
          <app-loader text="Loading your profile..." />
        } @else {
          @switch (mode()) {
            @case ('account') {
              <app-profile-account-card [fields]="account()" [roleLabel]="roleLabel()" [loading]="profileLoading()" />
            }
            @default {
              <app-profile-otr-card
                [form]="otrForm()"
                [records]="otrRecords()"
                (openStep)="openRegistration($event)"
                (viewDocument)="viewDocument($event)"
              />
            }
          }
        }
      }

      <!-- Security PIN for PIN sign-in: only with real (RajSSO) sign-in, the backend owns the PIN -->
      @if (showSecurityPin) {
        <app-security-pin-card />
      }
    </div>
  `
})
export class ProfilePageComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly permissions = inject(PermissionService);
  private readonly tableAccess = inject(TableAccessService);
  private readonly otr = inject(OtrRegistrationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly aspirantPortal = inject(AspirantPortalService);

  protected readonly showSecurityPin = !this.authService.isMockAuth() && !!this.authService.currentUser();

  readonly currentUser = this.authService.currentUser;
  readonly isAspirant = computed(() => this.currentUser()?.role === 'aspirant' || this.permissions.hasRole('aspirant'));
  readonly isAspirantComplete = this.aspirantPortal.isProfileComplete;
  readonly aspirantCompletionPercentage = computed(() => (this.isAspirantComplete() ? 100 : 0));

  readonly otrLoading = signal(false);
  readonly otrForm = signal<OtrFormDef | null>(null);
  readonly otrRecords = signal<OtrRecords>({});

  readonly profileLoading = computed(() => this.authService.profileLoading());
  readonly account = computed(() => accountFields(this.authService.profile()));

  /** The backend role the session is signed in with (/auth/me, else the sign-in role list). */
  private readonly roleName = computed(() => {
    const fromMe = sessionRoleName(this.authService.profile());
    if (fromMe) return fromMe;
    const { roles, activeRoleId } = this.authService.sessionRoles();
    return roles.find(r => r.id === activeRoleId)?.name ?? (roles.length === 1 ? roles[0].name : null);
  });
  readonly roleLabel = computed(() => this.currentUser()?.subLabel ?? this.roleName() ?? '');

  /** Signed in with the default role of new users (mock sign-in: the "new user" persona). */
  readonly defaultRole = computed(() =>
    this.authService.isMockAuth() ? this.currentUser()?.role === 'new_user' : isDefaultRole(this.roleName())
  );

  readonly mode = computed<ProfileMode>(() => profileMode(hasFilledOtr(this.otrForm(), this.otrRecords()), this.defaultRole()));

  constructor() {
    // The full profile (/auth/me) is fetched only here; sign-in itself uses the short user details.
    this.authService.loadProfile?.();
    if (!this.isAspirant()) this.loadOtr();
  }

  openRegistration(step: number): void {
    void this.router.navigate(['/registration'], { queryParams: { step } });
  }

  /** Opens an uploaded OTR document in a new tab. */
  viewDocument(fieldKey: string): void {
    const form = this.otrForm();
    const field = form ? formSteps(form).flatMap(s => s.sections.flatMap(x => x.fields)).find(f => f.key === fieldKey) : undefined;
    if (!field?.documentType) return;
    this.otr
      .documentBlob(field.documentType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      });
  }

  onAspirantProfileSaved(): void {
    this.authService.markProfileCompleted();
  }

  /**
   * The OTR form and the user's records. Only read when the role may use the OTR (OtrRegistrations permission):
   * without it the user has no registration and sees the account details. A failure counts as "not filled".
   */
  private loadOtr(): void {
    if (!this.tableAccess.can(OTR_TABLE, 'GET')) return;
    this.otrLoading.set(true);
    this.otr
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ form, records }) => {
          this.otrForm.set(form);
          this.otrRecords.set(records);
          this.otrLoading.set(false);
        },
        error: () => this.otrLoading.set(false)
      });
  }
}
