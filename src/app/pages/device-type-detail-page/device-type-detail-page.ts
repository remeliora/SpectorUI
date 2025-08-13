import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {ActivatedRoute} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-device-type-detail-page',
  imports: [],
  templateUrl: './device-type-detail-page.html',
  styleUrl: './device-type-detail-page.scss'
})
export class DeviceTypeDetailPage implements OnInit, OnDestroy {
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
      backRoute: `/device-types`,
      showSubsectionButton: true,
      subsectionButton: {
        label: 'Параметры',
        route: `/device-types/${this.deviceTypeId}/parameters`
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
