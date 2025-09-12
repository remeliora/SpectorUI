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
import {DeviceTypeCard} from '../../data/services/interfaces/device-type-card';
import {FilterService} from '../../data/services/filter-service';
import {Subscription, switchMap} from 'rxjs';

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
    ListOfCardsLayout
  ],
  templateUrl: './device-type-page.html',
  styleUrl: './device-type-page.scss'
})
export class DeviceTypePage implements OnInit, OnDestroy {
  deviceTypeService = inject(DeviceTypeService);
  deviceTypeCards: DeviceTypeCard[] = []

  private filterService = inject(FilterService);
  private subscription!: Subscription;


  constructor(
    private navbarService: NavbarService) {
    this.deviceTypeService.getDeviceTypes()
      .subscribe(
        value => {this.deviceTypeCards = value}
      )
  }

  ngOnInit(): void {
    this.navbarService.setConfig({
      showMainLinks: true,
      showFilter: true,
    });
    this.subscription = this.filterService.deviceTypeFilter$
      .pipe(
        switchMap(filterValue =>
          this.deviceTypeService.getDeviceTypes(filterValue)
        )
      )
      .subscribe(value => {
        this.deviceTypeCards = value;
      });
  }

  ngOnDestroy(): void {
    this.navbarService.resetConfig();
    this.subscription.unsubscribe();
  }
}
