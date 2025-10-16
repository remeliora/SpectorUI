import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-empty-layout',
  imports: [],
  templateUrl: './empty-layout.html',
  styleUrl: './empty-layout.scss'
})
export class EmptyLayout {
  @Input() errorMessage!: string;
}
