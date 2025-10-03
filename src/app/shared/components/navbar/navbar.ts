import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {DeviceService} from '../../../data/services/device-service';
import {MenuButton} from '../menu/menu-button/menu-button';
import {MenuFilter} from '../menu/menu-filter/menu-filter';
import {NavbarConfig, NavbarService} from '../../../data/services/navbar-service';
import {MenuBackButton} from '../menu/menu-back-button/menu-back-button';
import {FilterService} from '../../../data/services/filter-service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    MenuButton,
    MenuFilter,
    RouterLink,
    MenuBackButton
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private router = inject(Router);
  private navbarService = inject(NavbarService);
  private filterService = inject(FilterService);
  deviceTypeService = inject(DeviceTypeService);
  deviceService = inject(DeviceService);
  private destroy$ = new Subject<void>();

  config: NavbarConfig = {};

  mainMenuItems = [
    { label: 'Оборудование', link: 'devices' },
    { label: 'Тип устройства', link: 'device-types' },
    { label: 'Словари статусов', link: 'enumerations' }
  ]

  deviceTypeFilters: string[] = [];
  deviceFilters: string[] = [];

  constructor() {
    this.loadDeviceTypeFilters();
    this.loadDeviceFilters();
    this.navbarService.config$.subscribe(config => {
      this.config = config;
    });

    this.deviceTypeService.refreshFilters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDeviceTypeFilters();
      });
  }

  navigateBack() {
    if (this.config.backRoute) {
      this.router.navigateByUrl(this.config.backRoute);
    } else {
      // Fallback: переход на один уровень выше
      const segments = this.router.url.split('/');
      segments.pop();
      this.router.navigateByUrl(segments.join('/'));
    }
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
    if (this.currentRoute.includes('/device-types')) {
      this.filterService.setDeviceTypeFilter(filter);
    } else if (this.currentRoute.includes('/devices')) {
      this.filterService.setDeviceFilter(filter);
    }
  }
}
