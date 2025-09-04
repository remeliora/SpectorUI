import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SvgIcon} from '../svg-icon/svg-icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-button-add',
  imports: [
    SvgIcon,
    RouterLink
  ],
  templateUrl: './button-add.html',
  styleUrl: './button-add.scss'
})
export class ButtonAdd {
  @Input() routerLink?: any[] | string;
  @Output() onClick = new EventEmitter<Event>();
}
