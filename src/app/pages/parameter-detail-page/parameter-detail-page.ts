import { Component } from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-parameter-detail-page',
  imports: [],
  templateUrl: './parameter-detail-page.html',
  styleUrl: './parameter-detail-page.scss'
})
export class ParameterDetailPage {

  private destroy$ = new Subject<void>()
  deviceTypeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private navbarService: NavbarService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.deviceTypeId = params.get('deviceTypeId');
      this.updateNavbar();
    });
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}/parameters`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
