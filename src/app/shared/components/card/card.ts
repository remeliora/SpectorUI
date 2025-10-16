import {Component, Input} from '@angular/core';
import {Switch} from '../switch/switch';
import {SvgIcon} from '../svg-icon/svg-icon';
import {RouterLink} from '@angular/router';

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
  // @Input() isSwitchOn: boolean = false;

  @Input() showIndicator: boolean = false;
  // @Input() indicatorStatus: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';

  @Input() editRoute?: any[] | string;
}
