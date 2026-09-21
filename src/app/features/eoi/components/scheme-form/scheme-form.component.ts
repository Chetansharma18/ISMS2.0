import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationShellComponent } from '../../../registration/registration-shell.component';

@Component({
  selector: 'app-scheme-form',
  standalone: true,
  imports: [CommonModule, RegistrationShellComponent],
  template: `
    <app-registration-shell></app-registration-shell>
  `
})
export class SchemeFormComponent {}
