import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { UI_IMPORTS } from '../../ui-imports';

@Component({
  selector: 'ui-file-upload',
  standalone: true,
  imports: [...UI_IMPORTS],
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

  openPicker() {
    if (this.disabled) return;
    this.fileInput?.nativeElement?.click();
  }

  onChange(list: FileList | null) {
    if (!list || list.length === 0) return;
    this.filesSelected.emit(list);
  }
}
