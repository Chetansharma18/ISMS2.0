import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ElementRef,
  inject,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.scss'
})
export class SearchableDropdownComponent {
  private readonly elRef = inject(ElementRef);

  @Input() items: string[] = [];
  @Input() value: string | undefined | null = '';
  @Input() placeholder: string = '-- Select --';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() emptyText: string = 'No items found';
  @Input() dropdownId: string = 'searchable-dropdown';
  @Input() isInvalid: boolean = false;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<string>();

  readonly isOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items;
    return this.items.filter(item => item.toLowerCase().includes(q));
  });

  toggle(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.disabled) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.searchQuery.set('');
      setTimeout(() => {
        const input = document.getElementById(`${this.dropdownId}-search-input`);
        if (input) input.focus();
      }, 50);
    }
  }

  selectItem(item: string) {
    this.value = item;
    this.valueChange.emit(item);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  clear(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.value = '';
    this.valueChange.emit('');
    this.searchQuery.set('');
  }

  close() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}
