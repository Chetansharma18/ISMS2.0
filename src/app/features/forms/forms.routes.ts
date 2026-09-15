import { Routes } from '@angular/router';
import { TpPiaRegistrationComponent } from './components/tp-pia-registration.component';

export const FORMS_ROUTES: Routes = [
  {
    path: '',
    component: TpPiaRegistrationComponent,
  },
  {
    path: 'tp-pia-registration',
    component: TpPiaRegistrationComponent,
  }
];
