import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-menu-button',
  imports: [],
  templateUrl: './menu-button.html',
  styleUrl: './menu-button.scss'
})
export class MenuButton {
  @Input() label!: string;
}
