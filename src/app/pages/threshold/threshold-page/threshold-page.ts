import {Component, DestroyRef, inject, signal} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {NavbarService} from '../../../data/services/navbar-service';
import {ButtonAdd} from "../../../shared/components/buttons/button-add/button-add";
import {EmptyLayout} from "../../../shared/components/layouts/empty-layout/empty-layout";
import {ListOfTablesLayout} from "../../../shared/components/layouts/list-of-tables-layout/list-of-tables-layout";
import {PageBodyDirective} from "../../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../../data/services/page-label-directive";
import {PageLayout} from "../../../shared/components/layouts/page-layout/page-layout";
import {SwitchForForm} from '../../../shared/components/switches/switch-for-form/switch-for-form';
import {DeviceDetail} from '../../../data/services/interfaces/device/device-detail';
import {ThresholdCard} from '../../../data/services/interfaces/threshold/threshold-card';

@Component({
  selector: 'app-threshold-page',
  imports: [
    ButtonAdd,
    EmptyLayout,
    ListOfTablesLayout,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    SwitchForForm
  ],
  templateUrl: './threshold-page.html',
  styleUrl: './threshold-page.scss'
})
export class ThresholdPage {
  // === SERVICES ===
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navbarService = inject(NavbarService);
  private readonly destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();

  // === STATES ===
  deviceId: number | null = null;
  device = signal<DeviceDetail | null>(null);
  thresholds = signal<ThresholdCard[]>([]);


  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent() {
    const data = this.route.snapshot.data['thresholdCards'];

    const idParam = this.route.snapshot.paramMap.get('deviceId');
    if (idParam) {
      this.deviceId = Number(idParam);
      if (isNaN(this.deviceId)) {
        console.error('Invalid deviceId:', idParam);
        return;
      }
    } else {
      console.error('Missing deviceId in route params');
      return;
    }

    this.device.set(data.device);
    this.thresholds.set(data.thresholds);

    this.updateNavbar();
  }

  private updateNavbar(): void {
    if (!this.deviceId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/devices/${this.deviceId}`,
    });
  }

  onThresholdDblClick(thresholdId: number): void {
    this.router.navigate(['/devices', this.deviceId, 'thresholds', thresholdId]);
  }
}
