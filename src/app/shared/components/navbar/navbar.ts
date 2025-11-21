import {Component, DestroyRef, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {DeviceService} from '../../../data/services/device-service';
import {MenuButton} from '../menu/menu-button/menu-button';
import {MenuFilter} from '../menu/menu-filter/menu-filter';
import {NavbarConfig, NavbarService} from '../../../data/services/navbar-service';
import {MenuBackButton} from '../menu/menu-back-button/menu-back-button';
import {FilterService} from '../../../data/services/filter-service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  // === SERVICES ===
  private readonly router = inject(Router);
  private readonly navbarService = inject(NavbarService);
  private readonly filterService = inject(FilterService);
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly deviceService = inject(DeviceService);
  private destroyRef = inject(DestroyRef);

  config: NavbarConfig = {};

  mainMenuItems = [
    {label: 'Оборудование', link: 'devices'},
    {label: 'Тип устройства', link: 'device-types'},
    {label: 'Словари статусов', link: 'status-dictionaries'}
  ]

  // === STATES ===
  deviceTypeFilters: string[] = [];
  deviceFilters: string[] = [];
  currentRoute = signal<string>(this.router.url);

  constructor() {
    // Подписываемся на изменения маршрута и обновляем сигнал
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentRoute.set(this.router.url);
      });

    this.loadDeviceTypeFilters();
    this.loadDeviceFilters();

    this.navbarService.config$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(config => {
        this.config = config;
      });

    this.deviceTypeService.refreshFilters$
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    this.deviceTypeService.getUniqueClassNames()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (classNames) => {
          this.deviceTypeFilters = classNames;
        },
        error: (err) => {
          console.error('Ошибка при загрузке фильтров:', err);
        }
      });
  }

  loadDeviceFilters() {
    this.deviceService.getUniqueLocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (locationNames) => {
          this.deviceFilters = locationNames;
        },
        error: (err) => {
          console.error('Ошибка при загрузке фильтров:', err);
        }
      });
  }

  // === МЕТОДЫ ===
  // Определяем текущий маршрут
  isActiveRoute(link: string): boolean {
    return this.currentRoute().includes(link);
  }

  // Обработчик выбора фильтра
  onFilterSelected(filter: string | null) {
    if (this.currentRoute().includes('/device-types')) {
      this.filterService.setDeviceTypeFilter(filter);
    } else if (this.currentRoute().includes('/devices')) {
      this.filterService.setDeviceFilter(filter);
    }
  }
}
