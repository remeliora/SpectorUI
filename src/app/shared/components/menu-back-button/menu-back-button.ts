import {Component, EventEmitter, Output} from '@angular/core';
import {SvgIcon} from '../svg-icon/svg-icon';

@Component({
  selector: 'app-menu-back-button',
  imports: [
    SvgIcon
  ],
  templateUrl: './menu-back-button.html',
  styleUrl: './menu-back-button.scss'
})
export class MenuBackButton {
  @Output() backClicked = new EventEmitter<void>();

  onClick() {
    this.backClicked.emit();
  }
}
