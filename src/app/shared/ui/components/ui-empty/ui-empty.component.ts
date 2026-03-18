import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-empty',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ui-empty.component.html',
  styleUrls: ['./ui-empty.component.scss'],
})
export class UiEmptyComponent {
  @Input() title = 'No data found';
  @Input() subtitle: string | null = 'Try changing filters or search.';
  @Input() icon = 'inbox';
}
