import {Component, inject} from '@angular/core';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {MenuButton} from '../menu-button/menu-button';

@Component({
  selector: 'app-sidebar',
  imports: [
    MenuButton
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  deviceTypeService = inject(DeviceTypeService)
  deviceTypes: string[] = []

  constructor() {
    this.deviceTypeService.getUniqueClassNames().subscribe({
      next: (classNames) => {
        this.deviceTypes = classNames;
      },
      error: (err) => {
        console.error('Ошибка при загрузке фильтров:', err);
      },
    })
  }

}
