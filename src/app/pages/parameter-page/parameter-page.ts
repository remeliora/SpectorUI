import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
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
    RouterLink
  ],
  templateUrl: './parameter-page.html',
  styleUrl: './parameter-page.scss'
})
export class ParameterPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navbarService = inject(NavbarService);
  private deviceTypeService = inject(DeviceTypeService);
  private parameterService = inject(ParameterService);

  deviceTypeId!: number;
  deviceType!: DeviceTypeDetail;
  parameters: ParameterCard[] = [];

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.deviceTypeId = Number(params.get('deviceTypeId'));
      this.loadDeviceType();
      this.loadParameters();
      this.updateNavbar();
    });
  }

  private loadDeviceType(): void {
    this.deviceTypeService.getDeviceTypeById(this.deviceTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(deviceType => {
        this.deviceType = deviceType;
      });
  }

  private loadParameters(): void {
    this.parameterService.getParameters(this.deviceTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(parameters => {
        this.parameters = parameters;
      });
  }

  onParameterDblClick(parameterId: number): void {
    this.router.navigate(['/device-types', this.deviceTypeId, 'parameters', parameterId]);
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
