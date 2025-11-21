import {Component, DestroyRef, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavbarService} from '../../../data/services/navbar-service';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PageBodyDirective} from "../../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../../data/services/page-label-directive";
import {PageLayout} from "../../../shared/components/layouts/page-layout/page-layout";
import {ButtonAdd} from '../../../shared/components/buttons/button-add/button-add';
import {ListOfTablesLayout} from '../../../shared/components/layouts/list-of-tables-layout/list-of-tables-layout';
import {DeviceTypeDetail} from '../../../data/services/interfaces/device-type/device-type-detail';
import {ParameterCard} from '../../../data/services/interfaces/parameter/parameter-card';
import {EmptyLayout} from '../../../shared/components/layouts/empty-layout/empty-layout';

@Component({
  selector: 'app-parameter-page',
  imports: [
    FormsModule,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    ButtonAdd,
    ListOfTablesLayout,
    RouterLink,
    EmptyLayout
  ],
  templateUrl: './parameter-page.html',
  styleUrl: './parameter-page.scss'
})
export class ParameterPage {
  // === SERVICES ===
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navbarService = inject(NavbarService);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  deviceTypeId: number | null = null;
  deviceType = signal<DeviceTypeDetail | null>(null);
  parameters = signal<ParameterCard[]>([]);

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent(): void {
    const data = this.route.snapshot.data['parameterCards'];

    const idParam = this.route.snapshot.paramMap.get('deviceTypeId');
    if (idParam) {
      this.deviceTypeId = Number(idParam);
      if (isNaN(this.deviceTypeId)) {
        console.error('Invalid deviceTypeId:', idParam);
        return;
      }
    } else {
      console.error('Missing deviceTypeId in route params');
      return;
    }

    this.deviceType.set(data.deviceType);
    this.parameters.set(data.parameters);

    this.updateNavbar();
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}`,
    });
  }

  onParameterDblClick(parameterId: number): void {
    this.router.navigate(['/device-types', this.deviceTypeId, 'parameters', parameterId]);
  }
}
