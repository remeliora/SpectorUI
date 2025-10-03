import {Component, ElementRef, EventEmitter, HostListener, inject, Input, Output} from '@angular/core';
import {MultiSelectOption} from '../../../../data/services/interfaces/select/multi-select-option';

@Component({
  selector: 'app-multi-select',
  imports: [],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss'
})

export class MultiSelect {
  @Input() items: MultiSelectOption[] = [];
  @Output() selectionChange = new EventEmitter<MultiSelectOption[]>();

  private elementRef = inject(ElementRef);
  isDropdownVisible = false;
  filteredItems: MultiSelectOption[] = [];

  ngOnInit() {
    this.filteredItems = [...this.items];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownVisible = false;
    }
  }

  getPlaceholder(): string {
    const selectedCount = this.items.filter(i => i.selected).length;
    if (selectedCount === 0) return 'Выбрать...';
    return `${selectedCount} selected`;
  }

  filterItems(event: Event) {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim().toLowerCase();

    if (!term) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        item.mainInfo.toLowerCase().includes(term) ||
        (item.secondInfo && item.secondInfo.toLowerCase().includes(term))
      );
    }
  }

  toggleItem(item: MultiSelectOption, event: MouseEvent) {
    event.stopPropagation();
    item.selected = !item.selected;
    this.emitSelection();
  }

  removeItem(item: MultiSelectOption, event: MouseEvent) {
    event.stopPropagation();
    item.selected = false;
    this.emitSelection();
  }

  toggleSelectAll(event: MouseEvent) {
    event.stopPropagation();
    const allSelected = this.areAllSelected();
    const newSelectedState = !allSelected;

    // Применяем только к отфильтрованным элементам? Или ко всем?
    // Обычно — ко всем видимым (filteredItems), но можно и ко всем.
    // Здесь — ко всем **отображаемым** (filteredItems), чтобы не выбирать скрытые
    this.filteredItems.forEach(item => item.selected = newSelectedState);

    // Но важно: обновить оригинальный массив `items` тоже!
    // Так как filteredItems — это ссылки на те же объекты
    this.emitSelection();
  }

  areAllSelected(): boolean {
    const visibleSelected = this.filteredItems.filter(item => item.selected).length;
    return visibleSelected > 0 && visibleSelected === this.filteredItems.length;
  }

  private emitSelection() {
    const selected = this.items.filter(i => i.selected);
    this.selectionChange.emit(selected);
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }
}
