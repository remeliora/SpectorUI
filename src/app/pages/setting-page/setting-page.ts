import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-setting-page',
  imports: [],
  templateUrl: './setting-page.html',
  styleUrl: './setting-page.scss'
})
export class SettingPage implements OnInit, OnDestroy {
  constructor(
    private navbarService: NavbarService) {
  }

  ngOnInit(): void {
    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: ``
    });
  }

  ngOnDestroy(): void {
    this.navbarService.resetConfig();
  }
}
