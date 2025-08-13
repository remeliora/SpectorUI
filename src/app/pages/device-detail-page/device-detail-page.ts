import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {ActivatedRoute} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-device-detail-page',
  imports: [],
  templateUrl: './device-detail-page.html',
  styleUrl: './device-detail-page.scss'
})
export class DeviceDetailPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  deviceId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private navbarService: NavbarService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.deviceId = params.get('deviceId');
      this.updateNavbar();
    });
  }

  private updateNavbar(): void {
    if (!this.deviceId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/devices`,
      showSubsectionButton: true,
      subsectionButton: {
        label: 'Пороговые значения',
        route: `/devices/${this.deviceId}/thresholds`
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
