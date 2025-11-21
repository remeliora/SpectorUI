import {Component, effect, inject} from '@angular/core';
import {GraphStateService} from '../../../../data/services/graph-state-service';

@Component({
  selector: 'app-date-picker-manual',
  imports: [],
  templateUrl: './date-picker-manual.html',
  styleUrl: './date-picker-manual.scss'
})
export class DatePickerManual {
  private readonly graphStateService = inject(GraphStateService);

  // Используем signals для локального состояния
  from: string = '';
  to: string = '';

  constructor() {
    // Подписываемся на изменения состояния из сервиса
    effect(() => {
      const timeRange = this.graphStateService.manualTimeRange();
      if (timeRange.from) {
        this.from = this.formatDateTime(timeRange.from);
      }
      if (timeRange.to) {
        this.to = this.formatDateTime(timeRange.to);
      }
    });
  }

  onFromDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    const currentTo = this.graphStateService.manualTimeRange().to;
    this.graphStateService.updateManualTimeRange(date, currentTo);
  }

  onToDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    const currentFrom = this.graphStateService.manualTimeRange().from;
    this.graphStateService.updateManualTimeRange(currentFrom, date);
  }

  private formatDateTime(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
