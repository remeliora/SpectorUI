import {Component, inject, signal} from '@angular/core';
import {catchError, of, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {NavbarService} from '../../data/services/navbar-service';
import {DetailInfoLayout} from "../../shared/components/layouts/detail-info-layout/detail-info-layout";
import {MenuFunctionButton} from "../../shared/components/menu/menu-function-button/menu-function-button";
import {PageBodyDirective} from "../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../data/services/page-label-directive";
import {PageLayout} from "../../shared/components/layouts/page-layout/page-layout";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ParameterService} from '../../data/services/parameter-service';
import {Select} from '../../shared/components/selects/select/select';
import {DeviceTypeService} from '../../data/services/device-type-service';
import {DeviceTypeDetail} from '../../data/services/interfaces/device-type/device-type-detail';
import {ParameterDetail} from '../../data/services/interfaces/parameter/parameter-detail';
import {EnumService} from '../../data/services/enum-service';
import {EnumOption} from '../../data/services/interfaces/enum/enum-option';
import {MultiSelect} from '../../shared/components/selects/multi-select/multi-select';
import {MultiSelectOption} from '../../data/services/interfaces/select/multi-select-option';
import {DeviceByDeviceType} from '../../data/services/interfaces/device/device-by-device-type';

@Component({
  selector: 'app-parameter-detail-page',
  imports: [
    DetailInfoLayout,
    MenuFunctionButton,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    Select,
    MultiSelect
  ],
  templateUrl: './parameter-detail-page.html',
  styleUrl: './parameter-detail-page.scss'
})
export class ParameterDetailPage {
  private parameterService = inject(ParameterService);
  private deviceTypeService = inject(DeviceTypeService);
  private enumService = inject(EnumService);
  private navbarService = inject(NavbarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();


  deviceTypeId!: number;
  parameterId: string | null = null;
  deviceType = signal<DeviceTypeDetail | null>(null);
  parameter = signal<ParameterDetail | null>(null);
  dataTypes = signal<EnumOption[]>([]);
  devices = signal<MultiSelectOption[]>([]);

  isEditMode = false;
  isLoading = false;
  isNotFound = false;

  parameterFormBuilder = inject(FormBuilder);
  form = this.parameterFormBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    metric: [''],
    additive: [0],
    coefficient: [1],
    description: [''],
    dataType: ['', Validators.required],
    activeDevicesId: [[] as number[]]
  })

  ngOnInit(): void {
    this.loadDataTypes();
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      tap(params => {
        this.deviceTypeId = Number(params.get('deviceTypeId'));
        this.parameterId = params.get('parameterId');
        this.isEditMode = this.parameterId !== 'new' && this.parameterId !== null;
        this.isNotFound = false;
        this.updateNavbar();
        this.loadDeviceType();
        this.loadDevices();
      }),
      switchMap(params => {
        const parameterId = params.get('parameterId');
        if (parameterId === 'new' || parameterId === null) {
          return of(null);
        }

        const numericParameterId = Number(parameterId);
        if (isNaN(numericParameterId)) {
          this.router.navigate(['/device-types', this.deviceTypeId, 'parameters', 'new']);
          return of(null);
        }

        return this.parameterService.getParameterById(this.deviceTypeId, numericParameterId).pipe(
          catchError(error => {
            if (error.status === 404) {
              this.isNotFound = true;
              this.router.navigate(['/device-types', this.deviceTypeId, 'parameters', 'new']);
            }
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (parameter) => {
        this.parameter.set(parameter);
        if (parameter) {
          this.form.patchValue(parameter);
          this.setSelectedDevices(parameter.activeDevicesId || []);
        } else if (this.parameterId !== 'new') {
          this.isNotFound = true;
        }
      },
      error: (error) => {
        console.error('Error loading parameter:', error);
        this.isNotFound = true;
      }
    });
  }

  private loadDeviceType(): void {
    this.deviceTypeService.getDeviceTypeById(this.deviceTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(deviceType => {
        this.deviceType.set(deviceType);
      });
  }

  private loadDevices(): void {
    this.deviceTypeService.getDevicesByType(this.deviceTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (devices: DeviceByDeviceType[]) => {
          const multiSelectOptions: MultiSelectOption[] = devices.map(device => ({
            id: device.id,
            mainInfo: device.name,
            secondInfo: device.ipAddress,
            selected: false // По умолчанию не выбрано
          }));
          this.devices.set(multiSelectOptions);
        },
        error: (error) => {
          console.error('Error loading devices:', error);
        }
      });
  }

  private setSelectedDevices(activeDevicesId: number[]): void {
    if (activeDevicesId.length === 0) return;

    this.devices.update(devices =>
      devices.map(device => ({
        ...device,
        selected: activeDevicesId.includes(device.id)
      }))
    );
  }

  onDevicesSelectionChange(selectedOptions: MultiSelectOption[]): void {
    const selectedIds = selectedOptions.map(option => option.id);
    this.form.patchValue({ activeDevicesId: selectedIds });
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}/parameters`,
    });
  }



  onCancel(): void {
    this.router.navigate(['/device-types', this.deviceTypeId, 'parameters']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }

  private loadDataTypes() {
    this.enumService.getDataTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dataTypes) => {
          this.dataTypes.set(dataTypes);
        },
        error: (error) => {
          console.error('Error loading data types:', error);
          // Можно установить значения по умолчанию в случае ошибки
          this.dataTypes.set([
            { name: 'INTEGER', displayName: 'Целочисленный' },
            { name: 'DOUBLE', displayName: 'Дробный' },
            { name: 'LONG', displayName: 'Большое целое число' },
            { name: 'STRING', displayName: 'Строковый' },
            { name: 'ENUMERATED', displayName: 'Перечисляемый'}
          ]);
        }
      });
  }

  onDataTypeChange(value: string): void {
    this.form.patchValue({ dataType: value });
    // Также помечаем поле как touched для валидации
    this.form.get('dataType')?.markAsTouched();
  }
}
