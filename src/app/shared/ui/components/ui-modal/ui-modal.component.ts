import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type UiModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule, NgClass, MatButtonModule, MatIconModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.scss']
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() useOverlay = false;
  @Input() closeOnBackdropClick = false;
  @Input() closeOnEsc = true;

  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() primaryText = 'Save';
  @Input() secondaryText = 'Cancel';
  @Input() primaryDisabled = false;
  @Input() showClose = true;
  @Input() showFooter = true;
  @Input() hideSecondary = false;
  @Input() size: UiModalSize = 'xl';

  @Output() primaryClick = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
  @Output() closeClick = new EventEmitter<void>();

  onPrimary(): void {
    this.primaryClick.emit();
  }

  onSecondary(): void {
    this.secondaryClick.emit();
  }

  onClose(): void {
    this.closeClick.emit();
  }

  onBackdropClick(): void {
    if (!this.useOverlay) {
      return;
    }

    if (!this.closeOnBackdropClick || this.primaryDisabled) {
      return;
    }

    this.onClose();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.useOverlay || !this.isOpen || !this.closeOnEsc || this.primaryDisabled) {
      return;
    }

    this.onClose();
  }

  get modalClass(): string[] {
    return ['ui-modal', `ui-modal--${this.size}`];
  }
}