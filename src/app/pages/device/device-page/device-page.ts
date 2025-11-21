import {Component, DestroyRef, inject, signal} from '@angular/core';
import {NavbarService} from '../../../data/services/navbar-service';
import {ButtonAdd} from "../../../shared/components/buttons/button-add/button-add";
import {ButtonGraph} from "../../../shared/components/buttons/button-graph/button-graph";
import {PageBodyDirective} from "../../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../../data/services/page-label-directive";
import {PageLayout} from "../../../shared/components/layouts/page-layout/page-layout";
import {Card} from '../../../shared/components/card/card';
import {ListOfCardsLayout} from '../../../shared/components/layouts/list-of-cards-layout/list-of-cards-layout';
import {DeviceService} from '../../../data/services/device-service';
import {FilterService} from '../../../data/services/filter-service';
import {DeviceCard} from '../../../data/services/interfaces/device/device-card';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {EmptyLayout} from '../../../shared/components/layouts/empty-layout/empty-layout';
import {Loader} from '../../../shared/components/loader/loader';
import {WebSocketService} from '../../../data/services/web-socket-service';
import {DeviceDataStatus} from '../../../data/services/interfaces/device/device-data-status';
import {Router} from '@angular/router';

@Component({
  selector: 'app-device-page',
  imports: [
    ButtonAdd,
    ButtonGraph,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    Card,
    ListOfCardsLayout,
    EmptyLayout,
    Loader
  ],
  templateUrl: './device-page.html',
  styleUrl: './device-page.scss'
})
export class DevicePage {
  // === SERVICES ===
  private readonly router = inject(Router);
  private readonly deviceService = inject(DeviceService);
  private readonly navbarService = inject(NavbarService);
  private readonly filterService = inject(FilterService);
  private readonly webSocketService = inject(WebSocketService);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  deviceCards = signal<DeviceCard[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {
    this.navbarService.setConfig({
      showMainLinks: true,
      showFilter: true,
    });

    // Запрашиваем обновления статусов устройств
    this.webSocketService.requestDeviceStatusUpdates().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (deviceStatus) => {
        this.updateDeviceCard(deviceStatus);
      }
    });

    // Подписываемся на фильтр и загружаем данные
    this.filterService.deviceFilter$.pipe(
      takeUntilDestroyed(),
      switchMap(filterValue => {
        this.isLoading.set(true); // Показываем загрузку
        return this.deviceService.getDevices(filterValue);
      })
    ).subscribe({
      next: (value) => {
        const mappedCards = value.map(device => ({
          ...device,
          indicatorStatus: this.mapStatusToIndicator(device.status)
        }));
        this.deviceCards.set(mappedCards);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading devices:', error);
        this.deviceCards.set([]);
        this.isLoading.set(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.navbarService.resetConfig();
      this.webSocketService.releaseDeviceStatusUpdates();
    });
  }

  // === МЕТОДЫ ===
  public mapStatusToIndicator(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'OK':
        return 'success';
      case 'NOT_TRACKED':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'DISABLED':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  private updateDeviceCard(deviceStatus: DeviceDataStatus): void {
    this.deviceCards.update(cards =>
      cards.map(card => {
        if (card.deviceId === deviceStatus.deviceId) {
          return {
            ...card,
            isEnable: deviceStatus.isEnable,
            status: deviceStatus.status,
            indicatorStatus: this.mapStatusToIndicator(deviceStatus.status)
          };
        }
        return card;
      })
    );
  }

  onDeviceSwitchChange(deviceId: number, newValue: boolean): void {
    const request$ = newValue
      ? this.deviceService.enableDevice(deviceId)
      : this.deviceService.disableDevice(deviceId);

    request$.subscribe({
      next: () => {
        // console.log(`Device ${deviceId} ${newValue ? 'enabled' : 'disabled'} successfully`);
      },
      error: (error) => {
        console.error('Error toggling device:', error);
        // Можно откатить переключатель обратно
      }
    });
  }

  onCardDoubleClick = (deviceId: number): void => {
    this.router.navigate(['/devices', deviceId, 'parameters']);
  };
}
