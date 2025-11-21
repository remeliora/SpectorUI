import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-bar',
  imports: [],
  templateUrl: './bar.html',
  styleUrl: './bar.scss'
})
export class Bar {
  @Input() name!: string;
  @Input() value?: any;
  @Input() metric?: string;
  @Input() description!: string;

  @Input() indicatorStatus: 'success' | 'error' | 'neutral' = 'neutral';
}
