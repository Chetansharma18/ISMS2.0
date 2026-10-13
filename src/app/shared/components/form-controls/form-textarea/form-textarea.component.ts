import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full flex flex-col font-sans">
      <!-- Label Row -->
      @if (label) {
        <div class="flex items-center justify-between gap-2 mb-1">
          <label [for]="id" class="text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#1F2933] select-none">
            {{ label }}
            @if (required) {
              <span class="text-rose-600 font-bold ml-0.5">*</span>
            }
          </label>

          @if (showCharCount && maxLength) {
            <span class="text-[10.5px] font-mono text-[#7A8792]">
              {{ (value || '').length }}/{{ maxLength }}
            </span>
          }
        </div>
      }

      <!-- Textarea Box matching FormInputComponent initial size and styling -->
      <textarea
        #textareaRef
        [id]="id"
        [value]="value || ''"
        (input)="onInput($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.maxlength]="maxLength || null"
        class="w-full min-h-[35px] h-[35px] px-2.5 py-[6px] text-xs sm:text-[13px] leading-[20px] text-primary placeholder:text-muted rounded-[4px] border transition-all duration-150 focus:outline-none bg-white resize-none overflow-hidden box-border font-sans"
        [class.border-theme]="!error"
        [class.border-rose-600]="!!error"
        [class.ring-1]="!!error"
        [class.ring-rose-600]="!!error"
        [class.bg-surface-muted]="disabled"
        [class.cursor-not-allowed]="disabled"
        [class.text-muted]="disabled"
        [class.focus:border-primary]="!error && !disabled"
        [class.focus:ring-2]="!error && !disabled"
        [class.focus:ring-primary-light]="!error && !disabled"
      ></textarea>

      <!-- Error Message -->
      @if (error) {
        <div class="form-error-text text-rose-600 font-medium mt-0.5 flex items-center gap-1 leading-tight animate-fade-in" style="font-size: 11px !important; line-height: 14px !important;">
          <svg class="shrink-0" style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span style="font-size: 11px !important; line-height: 14px !important;">{{ error }}</span>
        </div>
      }

      <!-- Helper Hint -->
      @if (!error && hint) {
        <div class="form-hint-text text-[#7A8792] mt-0.5 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
          {{ hint }}
        </div>
      }
    </div>
  `,
  styles: [`
    .form-error-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
    .form-hint-text {
      font-size: 11px !important;
      line-height: 14px !important;
    }
  `]
})
export class FormTextareaComponent implements AfterViewInit, OnChanges {
  private static nextId = 0;
  readonly id = `form-textarea-${++FormTextareaComponent.nextId}`;

  @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;

  @Input() label: string = '';
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 1;
  @Input() maxLength?: number = 500;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() showCharCount: boolean = false;
  @Input() autoGrow: boolean = true;
  @Input() minHeight: number = 35;
  @Input() maxHeight: number = 160;

  @Output() valueChange = new EventEmitter<string>();

  ngAfterViewInit(): void {
    this.adjustHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      setTimeout(() => this.adjustHeight(), 0);
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.valueChange.emit(textarea.value);
    this.adjustHeight();
  }

  adjustHeight(): void {
    if (!this.autoGrow || !this.textareaRef) return;
    const el = this.textareaRef.nativeElement;
    // Set to minHeight first so scrollHeight accurately measures shrink
    el.style.height = `${this.minHeight}px`;
    if (el.scrollHeight > this.minHeight) {
      const newHeight = Math.min(el.scrollHeight + 2, this.maxHeight);
      el.style.height = `${newHeight}px`;
      el.style.overflowY = (el.scrollHeight + 2) > this.maxHeight ? 'auto' : 'hidden';
    } else {
      el.style.height = `${this.minHeight}px`;
      el.style.overflowY = 'hidden';
    }
  }
}
