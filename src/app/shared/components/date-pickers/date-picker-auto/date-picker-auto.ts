import {Component, effect, inject, Input} from '@angular/core';
import {handleNumberInputKeyDown} from '../../../helpers/events/on-key-down-event';
import {GraphStateService} from '../../../../data/services/graph-state-service';

export interface TimeRangeUnit {
  value: string;
  label: string;
}

@Component({
  selector: 'app-date-picker-auto',
  imports: [],
  templateUrl: './date-picker-auto.html',
  styleUrl: './date-picker-auto.scss'
})
export class DatePickerAuto {
  private readonly graphStateService = inject(GraphStateService);

  @Input() placeholder: string = '1';
  @Input() min: number = 1;
  @Input() max: number = 1000;
  // @Input() timePlaceholder: string = 'Единица времени'

  // Используем signals для локального состояния
  selectedValue: number = 1;
  selectedUnit: string = 'hour';
  selectedDisplayText: string = 'Час';
  isOpen = false;

  timeUnits: TimeRangeUnit[] = [
    {value: 'hour', label: 'Час'},
    {value: 'day', label: 'Сутки'},
    {value: 'month', label: 'Месяц'},
    {value: 'year', label: 'Год'}
  ];

  constructor() {
    // Подписываемся на изменения состояния из сервиса
    effect(() => {
      const autoRange = this.graphStateService.autoTimeRange();
      this.selectedValue = autoRange.value;
      this.selectedUnit = autoRange.unit;
      this.selectedDisplayText = this.timeUnits.find(u => u.value === autoRange.unit)?.label || 'Час';
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    handleNumberInputKeyDown(event);
  }

  onValueChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= this.min && numValue <= this.max) {
      this.selectedValue = numValue;
      this.updateState();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectUnit(unit: TimeRangeUnit): void {
    this.selectedUnit = unit.value;
    this.selectedDisplayText = unit.label;
    this.isOpen = false;
    this.updateState();
  }

  private updateState(): void {
    this.graphStateService.updateAutoTimeRange(
      this.selectedValue,
      this.selectedUnit as 'hour' | 'day' | 'month' | 'year'
    );
  }

  getSelectedUnitLabel(): string {
    return this.timeUnits.find(u => u.value === this.selectedUnit)?.label || 'Час';
  }
}
