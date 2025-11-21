import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SvgIcon} from "../../svg-icon/svg-icon";
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-button-return',
  imports: [
    SvgIcon,
    RouterLink
  ],
  templateUrl: './button-return.html',
  styleUrl: './button-return.scss'
})
export class ButtonReturn {
  @Input() routerLink?: any[] | string;
  @Output() onClick = new EventEmitter<Event>();
}
