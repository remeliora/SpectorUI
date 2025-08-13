import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-threshold-detail-page',
  imports: [],
  templateUrl: './threshold-detail-page.html',
  styleUrl: './threshold-detail-page.scss'
})
export class ThresholdDetailPage implements OnInit, OnDestroy {
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
      backRoute: `/devices/${this.deviceId}/thresholds`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
