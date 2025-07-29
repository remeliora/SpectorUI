import {Component, signal, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {DeviceTypeService} from './data/services/device-type-service';
import {Filter} from './data/services/interfaces/filter';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SpectorUI');
}
