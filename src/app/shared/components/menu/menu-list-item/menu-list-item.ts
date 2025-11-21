import {Component, DestroyRef, inject, signal} from '@angular/core';
import {MenuBackButton} from '../menu-back-button/menu-back-button';
import {Router} from '@angular/router';
import {MultiListSelect} from '../../selects/multi-list-select/multi-list-select';
import {GraphService} from '../../../../data/services/graph-service';
import {DeviceWithActiveParameters} from '../../../../data/services/interfaces/graph/device-with-active-parameters';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menu-list-item',
  imports: [
    MenuBackButton,
    MultiListSelect
  ],
  templateUrl: './menu-list-item.html',
  styleUrl: './menu-list-item.scss'
})
export class MenuListItem {
  private readonly router = inject(Router);
  private readonly graphService = inject(GraphService);
  private readonly destroyRef = inject(DestroyRef);

  devices = signal<DeviceWithActiveParameters[]>([]);

  constructor() {
    this.graphService.getDevicesWithActiveParameters()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.devices.set(data);
          console.log('Загруженные устройства:', data);
        },
        error: (error) => {
          console.error('Ошибка при загрузке устройств:', error);
        }
      });
  }

  navigateBack() {
    this.router.navigateByUrl('/devices');
  }
}
