import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'ui-file-upload',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  templateUrl: './ui-file-upload.component.html',
  styleUrls: ['./ui-file-upload.component.scss'],
})
export class UiFileUploadComponent {
  @Input() label = 'Upload file';
  @Input() accept: string | null = null;
  @Input() multiple = false;
  @Input() disabled = false;

  @Output() filesSelected = new EventEmitter<FileList>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  openPicker(): void {
    if (this.disabled) return;
    this.fileInput?.nativeElement?.click();
  }

  onChange(list: FileList | null): void {
    if (!list || list.length === 0) return;
    this.filesSelected.emit(list);
  }
}
