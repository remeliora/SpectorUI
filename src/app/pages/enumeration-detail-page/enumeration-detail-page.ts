import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-enumeration-detail-page',
  imports: [],
  templateUrl: './enumeration-detail-page.html',
  styleUrl: './enumeration-detail-page.scss'
})
export class EnumerationDetailPage implements OnInit, OnDestroy {
  constructor(
    private navbarService: NavbarService) {
  }

  ngOnInit(): void {
    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/enumerations`
    });
  }

  ngOnDestroy(): void {
    this.navbarService.resetConfig();
  }
}
