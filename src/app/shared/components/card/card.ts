import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Switch} from '../switches/switch/switch';
import {SvgIcon} from '../svg-icon/svg-icon';
import {Router, RouterLink} from '@angular/router';

export type CardDoubleClickHandler = (deviceId: number) => void;

@Component({
  selector: 'app-card',
  imports: [
    Switch,
    SvgIcon,
    RouterLink
  ],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  @Input() mainInfo!: string;
  @Input() secondInfo!: string | number;
  @Input() showSwitch: boolean = false;
  @Input() isSwitchOn: boolean = false;

  @Input() isDeviceEnabled: boolean = false;
  @Input() deviceId: number | null = null;

  @Input() showIndicator: boolean = false;
  @Input() indicatorStatus: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';

  @Input() editRoute?: any[] | string;

  @Input() onCardDoubleClick?: CardDoubleClickHandler;

  @Output() onSwitchChange = new EventEmitter<boolean>();

  // === МЕТОДЫ ===
  onSwitchToggled(value: boolean): void {
    this.onSwitchChange.emit(value);
  }

  onCardDblClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Проверяем, включено ли устройство, перед выполнением действия
    if (this.isDeviceEnabled && this.onCardDoubleClick && this.deviceId !== null) {
      this.onCardDoubleClick(this.deviceId);
    } else if (!this.isDeviceEnabled) {
      console.log('Device is disabled. Double-click action is ignored.');
    }
  }
}
