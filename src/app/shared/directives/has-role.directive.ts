import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect
} from '@angular/core';
import { AuthService, UserRole } from '../../core/auth/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private requiredRoles: UserRole[] = [];
  private hasView = false;

  @Input('appHasRole')
  set roles(value: UserRole | UserRole[]) {
    this.requiredRoles = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluate when active user persona changes
      const user = this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    const user = this.authService.currentUser();
    const currentRole = user?.role;

    const isAuthorized =
      !this.requiredRoles.length ||
      (currentRole && this.requiredRoles.includes(currentRole)) ||
      currentRole === 'super_admin'; // super_admin has master access

    if (isAuthorized && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isAuthorized && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
