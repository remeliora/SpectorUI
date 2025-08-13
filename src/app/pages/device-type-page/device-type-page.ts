import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-device-type-page',
  imports: [],
  templateUrl: './device-type-page.html',
  styleUrl: './device-type-page.scss'
})
export class DeviceTypePage implements OnInit, OnDestroy {
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
