import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SvgIcon} from "../../svg-icon/svg-icon";
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-button-graph',
  imports: [
    SvgIcon,
    RouterLink
  ],
  templateUrl: './button-graph.html',
  styleUrl: './button-graph.scss'
})
export class ButtonGraph {
  @Input() routerLink?: any[] | string;
  @Output() onClick = new EventEmitter<Event>();
}
