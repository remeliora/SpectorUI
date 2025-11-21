import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-switch-for-form',
  imports: [],
  templateUrl: './switch-for-form.html',
  styleUrl: './switch-for-form.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchForForm),
      multi: true
    }
  ]
})
export class SwitchForForm implements ControlValueAccessor {
  private _disabledInputSet = false;

  @Input() set disabled(value: boolean) {
    // Запоминаем, что disabled был установлен через @Input
    this._disabledInputSet = true;
    this._innerDisabled = !!value;
  }

  get disabled(): boolean {
    return this._innerDisabled;
  }

  private _innerDisabled = false;

  @Input() set checked(value: boolean) {
    this.innerValue = !!value;
  }

  get checked(): boolean {
    return this.innerValue;
  }

  innerValue = false;

  private onChange = (value: boolean) => {
  };
  private onTouched = () => {
  };

  writeValue(value: boolean): void {
    this.innerValue = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (!this._disabledInputSet) {
      this._innerDisabled = isDisabled;
    }
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!this.disabled && target) {
      this.innerValue = target.checked;
      this.onChange(this.innerValue);
      this.onTouched();
    }
  }
}
