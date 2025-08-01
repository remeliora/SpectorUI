import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {DeviceService} from '../../../data/services/device-service';
import {MenuButton} from '../menu-button/menu-button';
import {MenuFilter} from '../menu-filter/menu-filter';

@Component({
  selector: 'app-navbar',
  imports: [
    MenuButton,
    MenuFilter,
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private router = inject(Router);
  deviceTypeService = inject(DeviceTypeService)
  deviceService = inject(DeviceService)

  menuItems = [
    {label: 'Оборудование', link: 'devices'},
    {label: 'Тип устройства', link: 'device-types'},
    {label: 'Словари статусов', link: 'enumerations'}
  ]

  deviceTypeFilters: string[] = [];
  deviceFilters: string[] = [];

  constructor() {
    this.loadDeviceTypeFilters();
    this.loadDeviceFilters();
  }

  loadDeviceTypeFilters() {
    this.deviceTypeService.getUniqueClassNames().subscribe({
      next: (classNames) => {
        this.deviceTypeFilters = classNames;
      },
      error: (err) => {
        console.error('Ошибка при загрузке фильтров:', err);
      }
    });
  }

  loadDeviceFilters() {
    this.deviceService.getUniqueLocations().subscribe({
      next: (locationNames) => {
        this.deviceFilters = locationNames;
      },
      error: (err) => {
        console.error('Ошибка при загрузке фильтров:', err);
      }
    });
  }

  // Определяем текущий маршрут
  get currentRoute(): string {
    return this.router.url;
  }

  // Обработчик выбора фильтра
  onFilterSelected(filter: string | null) {
    console.log('Выбран фильтр:', filter);
    // Здесь можно добавить логику обработки выбора фильтра
  }
}
