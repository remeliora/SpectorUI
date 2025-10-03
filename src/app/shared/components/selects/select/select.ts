import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss'
})
export class Select<T = any> {
  // Массив опций любого типа
  @Input() options: T[] = [];

  // Имя свойства для отображения (например, 'displayName', 'description', 'name')
  @Input() displayField: string = 'displayName';

  // Имя свойства для значения (например, 'name', 'id')
  @Input() valueField: string = 'name';

  // Плейсхолдер
  @Input() placeholder: string = 'Выберите опцию';

  // Текущее выбранное значение
  @Input() selectedValue: any = null;

  // Событие выбора (возвращает весь объект или значение)
  @Output() selected = new EventEmitter<T>();

  // Событие выбора только значения
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;

  // Получаем отображаемый текст для опции
  getDisplayText(option: T): string {
    if (typeof option === 'string') {
      return option;
    }

    // Приводим option к типу any для доступа к свойствам по строке
    const optionAny = option as any;
    if (optionAny && this.displayField && optionAny[this.displayField]) {
      return optionAny[this.displayField];
    }

    // Если не нашли поле для отображения, пытаемся вывести строку
    return String(option);
  }

  // Получаем значение опции (новый метод)
  getOptionValue(option: T): any {
    if (typeof option === 'string') {
      return option;
    }

    // Приводим option к типу any для доступа к свойствам по строке
    const optionAny = option as any;
    if (optionAny && this.valueField && optionAny[this.valueField] !== undefined) {
      return optionAny[this.valueField];
    }

    return option;
  }

  // Получаем текст для выбранной опции
  get selectedDisplayText(): string {
    if (this.selectedValue === null || this.selectedValue === undefined) {
      return this.placeholder;
    }

    if (typeof this.selectedValue === 'string') {
      // Для строковых значений ищем соответствующую опцию
      const selectedOption = this.options.find(opt =>
        this.getOptionValue(opt) === this.selectedValue
      );
      return selectedOption ? this.getDisplayText(selectedOption) : this.selectedValue;
    }

    // Для объектов ищем выбранную опцию в массиве
    const selectedOption = this.options.find(opt =>
      this.getOptionValue(opt) === this.selectedValue
    );

    return selectedOption ? this.getDisplayText(selectedOption) : this.placeholder;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Исправленная функция selectOption
  selectOption(option: T) {
    const value = this.getOptionValue(option);
    this.selectedValue = value;

    // Эмитим события
    this.selected.emit(option);
    this.valueChange.emit(value);

    this.isOpen = false;
    console.log('Selected option:', option);
    console.log('Selected value:', value);
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
