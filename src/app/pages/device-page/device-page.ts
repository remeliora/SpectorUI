import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-device-page',
  imports: [],
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
