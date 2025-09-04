import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {ButtonAdd} from "../../shared/components/button-add/button-add";
import {ButtonGraph} from "../../shared/components/button-graph/button-graph";
import {PageBodyDirective} from "../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../data/services/page-label-directive";
import {PageLayout} from "../../shared/components/page-layout/page-layout";
import {Card} from '../../shared/components/card/card';
import {ListOfCardsLayout} from '../../shared/components/list-of-cards-layout/list-of-cards-layout';

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
    ListOfCardsLayout
  ],
  templateUrl: './device-page.html',
  styleUrl: './device-page.scss'
})
export class DevicePage implements OnInit, OnDestroy{
  constructor(
    private navbarService: NavbarService) {
  }

  ngOnInit(): void {
    this.navbarService.setConfig({
      showMainLinks: true,
      showFilter: true,
    });
  }

  ngOnDestroy(): void {
    this.navbarService.resetConfig();
  }
}
