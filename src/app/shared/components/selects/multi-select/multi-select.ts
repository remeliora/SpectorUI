import {Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, SimpleChanges} from '@angular/core';
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
  selectedItems: Set<number> = new Set(); // Сделал публичным для отладки

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.initializeSelectedItems();
      this.filteredItems = [...this.items];
    }
  }

  private initializeSelectedItems() {
    this.selectedItems.clear();
    this.items.forEach(item => {
      if (item.selected) {
        this.selectedItems.add(item.id);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownVisible = false;
    }
  }

  getPlaceholder(): string {
    const selectedCount = this.selectedItems.size;
    if (selectedCount === 0) return 'Выбрать...';
    return `Выбрано: ${selectedCount}`;
  }

  getSelectedItems(): MultiSelectOption[] {
    return this.items.filter(item => this.selectedItems.has(item.id));
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
    event.preventDefault(); // Добавил preventDefault

    if (this.selectedItems.has(item.id)) {
      this.selectedItems.delete(item.id);
    } else {
      this.selectedItems.add(item.id);
    }

    this.emitSelection();
  }

  removeItem(item: MultiSelectOption, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedItems.delete(item.id);
    this.emitSelection();
  }

  toggleSelectAll(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const allFilteredSelected = this.areAllFilteredSelected();

    if (allFilteredSelected) {
      // Снимаем выделение со всех отфильтрованных элементов
      this.filteredItems.forEach(item => {
        this.selectedItems.delete(item.id);
      });
    } else {
      // Выделяем все отфильтрованные элементы
      this.filteredItems.forEach(item => {
        this.selectedItems.add(item.id);
      });
    }

    this.emitSelection();
  }

  areAllFilteredSelected(): boolean {
    if (this.filteredItems.length === 0) return false;
    return this.filteredItems.every(item => this.selectedItems.has(item.id));
  }

  isItemSelected(item: MultiSelectOption): boolean {
    return this.selectedItems.has(item.id);
  }

  private emitSelection() {
    const selected = this.items.filter(item => this.selectedItems.has(item.id));

    // Обновляем свойство selected в исходных items
    this.items.forEach(item => {
      item.selected = this.selectedItems.has(item.id);
    });

    this.selectionChange.emit(selected);
  }

  showDropdown() {
    this.isDropdownVisible = true;
  }
}
