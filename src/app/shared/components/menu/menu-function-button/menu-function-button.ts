import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-menu-function-button',
  imports: [],
  templateUrl: './menu-function-button.html',
  styleUrl: './menu-function-button.scss'
})
export class MenuFunctionButton {
  @Input() showDelete: boolean = false;
  @Input() showReset: boolean = false;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();
}
