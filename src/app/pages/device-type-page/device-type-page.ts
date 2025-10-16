import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {PageLayout} from '../../shared/components/layouts/page-layout/page-layout';
import {ButtonGraph} from '../../shared/components/buttons/button-graph/button-graph';
import {ButtonAdd} from '../../shared/components/buttons/button-add/button-add';
import {PageLabelDirective} from '../../data/services/page-label-directive';
import {PageBodyDirective} from '../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../data/services/page-buttons-directive';
import {Card} from '../../shared/components/card/card';
import {ListOfCardsLayout} from '../../shared/components/layouts/list-of-cards-layout/list-of-cards-layout';
import {DeviceTypeService} from '../../data/services/device-type-service';
import {DeviceTypeCard} from '../../data/services/interfaces/device-type/device-type-card';
import {FilterService} from '../../data/services/filter-service';
import {Subject, switchMap, takeUntil} from 'rxjs';
import {EmptyLayout} from '../../shared/components/layouts/empty-layout/empty-layout';

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
    EmptyLayout
  ],
  templateUrl: './device-type-page.html',
  styleUrl: './device-type-page.scss'
})
export class DeviceTypePage implements OnInit, OnDestroy {
  // === SERVICES ===
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly navbarService = inject(NavbarService);
  private readonly filterService = inject(FilterService);
  private readonly destroy$ = new Subject<void>();

  // === STATES ===
  deviceTypeCards: DeviceTypeCard[] = [];

  ngOnInit(): void {
    this.navbarService.setConfig({
      showMainLinks: true,
      showFilter: true,
    });
    this.filterService.deviceTypeFilter$
      .pipe(
        takeUntil(this.destroy$),
        switchMap(filterValue => this.deviceTypeService.getDeviceTypes(filterValue))
      )
      .subscribe({
        next: (value) => {
          this.deviceTypeCards = value;
        },
        error: (error) => {
          console.error('Error loading device types:', error);
          this.deviceTypeCards = [];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
