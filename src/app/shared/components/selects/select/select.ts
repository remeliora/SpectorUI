import {Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss'
})
export class Select<T = any> {
  @ViewChild('selectWrapper', {static: true}) selectWrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('selectMenu', {static: false}) selectMenuRef?: ElementRef<HTMLDivElement>;
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

  // Для обработки клика по опции
  @Input() onOptionClick?: (option: T, event: Event) => boolean | void;

  // Событие выбора (возвращает весь объект или значение)
  @Output() selected = new EventEmitter<T>();

  // Событие выбора только значения
  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private renderer: Renderer2) {
  }

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

  // Получаем значение опции
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
    if (this.isOpen) {
      setTimeout(() => {
        this.positionDropdown();
        if (this.selectMenuRef) {
          this.renderer.addClass(this.selectMenuRef.nativeElement, 'visible'); // Показываем
        }
      }, 0);
    } else {
      if (this.selectMenuRef) {
        this.renderer.removeClass(this.selectMenuRef.nativeElement, 'visible'); // Скрываем
      }
    }
  }

  selectOption(option: T, event: Event) {
    if (this.onOptionClick) {
      // Если предоставлен обработчик, вызываем его
      const result = this.onOptionClick(option, event);
      // Проверяем результат: если он false, то не продолжаем стандартный выбор
      if (result === false) {
        // Не обновляем selectedValue, не эмитим события, не закрываем
        console.log('Selection cancelled by onOptionClick handler.');
        return;
      }
    }

    // Стандартное поведение (или если onOptionClick не предоставлен или не вернул false)
    const value = this.getOptionValue(option);
    this.selectedValue = value;
    this.selected.emit(option);
    this.valueChange.emit(value);
    this.isOpen = false;

    console.log('Selected option:', option);
    console.log('Selected value:', value);
  }

  // Метод для позиционирования выпадающего списка
  private positionDropdown() {
    if (!this.selectMenuRef || !this.selectWrapperRef) return;
  }

  closeDropdown() {
    this.isOpen = false;
    if (this.selectMenuRef) {
      this.renderer.removeClass(this.selectMenuRef.nativeElement, 'visible');
    }
  }
}
