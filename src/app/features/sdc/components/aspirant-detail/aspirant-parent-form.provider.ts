import { inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

/**
 * Lets ngModel controls inside a child component register with the NgForm that
 * wraps the child in the parent template (use via `viewProviders`).
 */
export const PARENT_FORM_VIEW_PROVIDER = {
  provide: ControlContainer,
  useFactory: () => inject(ControlContainer, { skipSelf: true })
};
