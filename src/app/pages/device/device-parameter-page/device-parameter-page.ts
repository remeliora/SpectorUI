import {Component, DestroyRef, inject, signal} from '@angular/core';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {ListOfTablesLayout} from '../../../shared/components/layouts/list-of-tables-layout/list-of-tables-layout';
import {NavbarService} from '../../../data/services/navbar-service';
import {ButtonReturn} from '../../../shared/components/buttons/button-return/button-return';
import {Bar} from '../../../shared/components/bar/bar';
import {ActivatedRoute} from '@angular/router';
import {DeviceService} from '../../../data/services/device-service';
import {ParameterData} from '../../../data/services/interfaces/parameter/parameter-data';
import {WebSocketService} from '../../../data/services/web-socket-service';
import {ParameterDataStatus} from '../../../data/services/interfaces/parameter/parameter-data-status';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Loader} from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-device-parameter-page',
  imports: [
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ListOfTablesLayout,
    ButtonReturn,
    Bar,
    Loader
  ],
  templateUrl: './device-parameter-page.html',
  styleUrl: './device-parameter-page.scss'
})
export class DeviceParameterPage {
  // === SERVICES ===
  private readonly navbarService = inject(NavbarService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly deviceService = inject(DeviceService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  deviceParameters = signal<ParameterData[]>([]);
  isLoading = signal<boolean>(true);
  deviceName = signal<string>('');
  deviceId = signal<number | null>(null);

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => {
      this.navbarService.resetConfig();
      // Отписываемся от обновлений параметров для текущего устройства при уничтожении компонента
      const id = this.deviceId();
      if (id !== null) {
        this.webSocketService.releaseDeviceParameterUpdates(id);
      }
    });
  }

  private initializeComponent() {
    const idParam = this.route.snapshot.paramMap.get('deviceId');
    if (idParam) {
      const deviceId = Number(idParam);
      if (isNaN(deviceId)) {
        console.error('Invalid deviceId:', idParam);
        this.isLoading.set(false);
        return;
      }
      this.deviceId.set(deviceId);

      // Загружаем начальные данные
      this.deviceService.getDeviceDataDetail(deviceId).subscribe({
        next: (deviceData) => {
          // console.log('DEBUG: Loaded initial device data:', deviceData);
          this.deviceParameters.set(deviceData.parameters || []);
          this.deviceName.set(deviceData.deviceName);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading device data:', error);
          this.deviceParameters.set([]);
          this.isLoading.set(false);
        }
      });

      // Запрашиваем обновления параметров для конкретного устройства
      this.webSocketService.requestDeviceParameterUpdates(deviceId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (paramStatus) => {
          // console.log('DEBUG: Received WebSocket param update for device:', paramStatus);
          this.updateDeviceParameters(paramStatus);
        },
        error: (error) => {
          console.error('WebSocket subscription error for device parameters:', error);
        }
      });

    } else {
      console.error('Device ID not found in route params');
      this.isLoading.set(false);
    }

    this.updateNavbar();
  }

  private updateNavbar() {
    this.navbarService.setConfig({
      showMainLinks: true
    });
  }

  // === МЕТОДЫ ===
  public mapStatusToIndicator(status: string): 'success' | 'error' | 'neutral' {
    switch (status) {
      case 'OK':
        return 'success';
      case 'ERROR':
        return 'error';
      case 'INACTIVE':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  private updateDeviceParameters(paramStatus: ParameterDataStatus): void {
    // Используем deviceId для проверки, нужно ли обновлять
    if (this.deviceId() === paramStatus.deviceId) {
      this.deviceParameters.update(params =>
        params.map(param => {
          const updatedParam = paramStatus.parameters.find(p => p.id === param.id);
          if (updatedParam) {
            return {
              ...param,
              value: updatedParam.value,
              status: updatedParam.status
              // Обновляем только то, что пришло из WebSocket
            };
          }
          return param;
        })
      );
    }
  }
}
