import { Component } from '@angular/core';

@Component({
  selector: 'app-receipts',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-primary mb-4">Digital Receipts</h1>
      <p class="text-textMuted">This section will list all your payment and submission receipts.</p>
    </div>
  `
})
export class ReceiptsComponent {}
