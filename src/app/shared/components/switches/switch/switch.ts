import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrl: './switch.scss'
})
export class Switch {
  @Input() value: boolean = false;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!this.disabled) {
      this.value = target.checked;
      this.valueChange.emit(this.value);
    }
  }
}
