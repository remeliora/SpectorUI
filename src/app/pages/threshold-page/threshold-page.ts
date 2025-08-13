import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {NavbarService} from '../../data/services/navbar-service';

@Component({
  selector: 'app-threshold-page',
  imports: [],
  templateUrl: './threshold-page.html',
  styleUrl: './threshold-page.scss'
})
export class ThresholdPage implements OnInit, OnDestroy {
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
      backRoute: `/devices/${this.deviceId}`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
