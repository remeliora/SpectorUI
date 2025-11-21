import {Component, DestroyRef, inject, signal} from '@angular/core';
import {NavbarService} from '../../../data/services/navbar-service';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {ButtonGraph} from '../../../shared/components/buttons/button-graph/button-graph';
import {ButtonAdd} from '../../../shared/components/buttons/button-add/button-add';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {Card} from '../../../shared/components/card/card';
import {ListOfCardsLayout} from '../../../shared/components/layouts/list-of-cards-layout/list-of-cards-layout';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {DeviceTypeCard} from '../../../data/services/interfaces/device-type/device-type-card';
import {FilterService} from '../../../data/services/filter-service';
import {switchMap} from 'rxjs';
import {EmptyLayout} from '../../../shared/components/layouts/empty-layout/empty-layout';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Loader} from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-device-type-page',
  imports: [
    PageLayout,
    ButtonGraph,
    ButtonAdd,
    PageLabelDirective,
    PageBodyDirective,
    PageButtonsDirective,
    Card,
    ListOfCardsLayout,
    EmptyLayout,
    Loader
  ],
  templateUrl: './device-type-page.html',
  styleUrl: './device-type-page.scss'
})
export class DeviceTypePage {
  // === SERVICES ===
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly navbarService = inject(NavbarService);
  private readonly filterService = inject(FilterService);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  deviceTypeCards = signal<DeviceTypeCard[]>([]);
  isLoading = signal<boolean>(true);

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.navbarService.setConfig({
      showMainLinks: true,
      showFilter: true,
    });

    // Подписываемся на фильтр и загружаем данные
    this.filterService.deviceTypeFilter$.pipe(
      takeUntilDestroyed(),
      switchMap(filterValue => {
        this.isLoading.set(true);
        return this.deviceTypeService.getDeviceTypes(filterValue);
      })
    ).subscribe({
      next: (value) => {
        this.deviceTypeCards.set(value);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading device types:', error);
        this.deviceTypeCards.set([]);
        this.isLoading.set(false);
      }
    });

    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }
}
