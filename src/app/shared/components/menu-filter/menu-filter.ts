import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-menu-filter',
  imports: [],
  templateUrl: './menu-filter.html',
  styleUrl: './menu-filter.scss'
})
export class MenuFilter {
  // Принимаем массив строк
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Без фильтра';
  // Событие выбора
  @Output() selected = new EventEmitter<string | null>();
  selectedOption: string | null = null;

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: string | null) {
    this.selectedOption = option;
    this.selected.emit(option);
    this.isOpen = false;
    console.log('Selected option:', option);
  }
}
