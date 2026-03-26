import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.scss']
})
export class UiModalComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() primaryText = 'Save';
  @Input() secondaryText = 'Cancel';
  @Input() primaryDisabled = false;
  @Input() showClose = true;
  @Input() showFooter = true;
  @Input() hideSecondary = false;
  @Input() closeOnBackdropClick = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

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

  get modalClass(): string {
    return `ui-modal ui-modal--${this.size}`;
  }
}