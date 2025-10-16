import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Subject, takeUntil} from 'rxjs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavbarService} from '../../data/services/navbar-service';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PageBodyDirective} from "../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../data/services/page-label-directive";
import {PageLayout} from "../../shared/components/layouts/page-layout/page-layout";
import {ButtonAdd} from '../../shared/components/buttons/button-add/button-add';
import {ListOfTablesLayout} from '../../shared/components/layouts/list-of-tables-layout/list-of-tables-layout';
import {DeviceTypeService} from '../../data/services/device-type-service';
import {ParameterService} from '../../data/services/parameter-service';
import {DeviceTypeDetail} from '../../data/services/interfaces/device-type/device-type-detail';
import {ParameterCard} from '../../data/services/interfaces/parameter/parameter-card';
import {EmptyLayout} from '../../shared/components/layouts/empty-layout/empty-layout';

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
export class ParameterPage implements OnInit, OnDestroy {
  // === SERVICES ===
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navbarService = inject(NavbarService);
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly parameterService = inject(ParameterService);

  // === STATES ===
  deviceTypeId: number | null = null;
  deviceType: DeviceTypeDetail | null = null;
  parameters: ParameterCard[] = [];

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idParam = params.get('deviceTypeId');
      if (idParam) {
        this.deviceTypeId = Number(idParam);
        if (!isNaN(this.deviceTypeId)) {
          this.loadData();
          this.updateNavbar();
        } else {
          console.error('Invalid deviceTypeId:', idParam);
          // Можно перенаправить на 404 или показать ошибку
        }
      }
    });
  }

  private loadData(): void {
    if (this.deviceTypeId == null) return;

    // Загружаем оба списка параллельно
    forkJoin({
      deviceType: this.deviceTypeService.getDeviceTypeById(this.deviceTypeId),
      parameters: this.parameterService.getParameters(this.deviceTypeId)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.deviceType = result.deviceType;
        this.parameters = result.parameters;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.deviceType = null;
        this.parameters = [];
      }
    });
  }

  onParameterDblClick(parameterId: number): void {
    this.router.navigate(['/device-types', this.deviceTypeId, 'parameters', parameterId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}`,
    });
  }
}
