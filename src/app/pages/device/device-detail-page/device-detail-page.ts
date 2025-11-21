import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {NavbarService} from '../../../data/services/navbar-service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceService} from '../../../data/services/device-service';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DeviceDetail} from '../../../data/services/interfaces/device/device-detail';
import {EnumOption} from '../../../data/services/interfaces/enum/enum-option';
import {MultiSelectOption} from '../../../data/services/interfaces/select/multi-select-option';
import {DeviceTypeShort} from '../../../data/services/interfaces/device-type/device-type-short';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ParameterByDeviceType} from '../../../data/services/interfaces/parameter/parameter-by-device-type';
import {DetailInfoLayout} from '../../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../../shared/components/menu/menu-function-button/menu-function-button';
import {MultiSelect} from '../../../shared/components/selects/multi-select/multi-select';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {Select} from '../../../shared/components/selects/select/select';
import {handleNumberInputKeyDown} from '../../../shared/helpers/events/on-key-down-event';
import {DeviceUpdate} from '../../../data/services/interfaces/device/device-update';
import {DeviceCreate} from '../../../data/services/interfaces/device/device-create';
import {ipValidator} from '../../../shared/helpers/validators/custom-validators';
import {SwitchForForm} from '../../../shared/components/switches/switch-for-form/switch-for-form';

@Component({
  selector: 'app-device-detail-page',
  imports: [
    DetailInfoLayout,
    FormsModule,
    MenuFunctionButton,
    MultiSelect,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    Select,
    SwitchForForm
  ],
  templateUrl: './device-detail-page.html',
  styleUrl: './device-detail-page.scss'
})
export class DeviceDetailPage {
  // === SERVICES ===
  private readonly deviceService = inject(DeviceService);
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly navbarService = inject(NavbarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly deviceFormBuilder = inject(FormBuilder);

  // === STATES ===
  deviceId: string | null = null;
  device = signal<DeviceDetail | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isNotFound = signal<boolean>(false);
  deviceTypes = signal<DeviceTypeShort[]>([]);
  locations = signal<string[]>([]);
  alarmTypes = signal<EnumOption[]>([]);
  parameters = signal<MultiSelectOption[]>([]);

  // === FORM ===
  readonly form = this.deviceFormBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    ipAddress: ['', [Validators.required, Validators.maxLength(45), ipValidator()]],
    deviceTypeId: [null as number | null, Validators.required],
    description: ['', Validators.maxLength(500)],
    location: ['', [Validators.required, Validators.maxLength(100)]],
    period: [30, [Validators.required, Validators.min(1)]],
    alarmType: ['', [Validators.required, Validators.maxLength(50)]],
    isEnable: [false],
    activeParametersId: [[] as number[]]
  });

  // === SIGNAL-BASED OBSERVABLES ===
  deviceTypeIdSignal = toSignal(
    this.form.get('deviceTypeId')!.valueChanges,
    {initialValue: this.form.get('deviceTypeId')!.value}
  );

  constructor() {
    this.initializeComponent();
    this.setupDeviceTypeChangeListener();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent() {
    const data = this.route.snapshot.data['deviceDetail'];
    const id = this.route.snapshot.paramMap.get('deviceId');

    this.deviceId = id;
    this.isEditMode.set(id !== 'new' && id !== null);
    this.isNotFound.set(false);
    this.device.set(data.device);
    this.deviceTypes.set(data.deviceTypes);
    this.locations.set(data.locations);
    this.alarmTypes.set(data.alarmTypes);

    if (data.device) {
      this.form.patchValue(data.device);
      // Если редактируем, загрузим параметры для текущего типа
      if (data.device.deviceTypeId) {
        this.loadParametersForDeviceType(data.device.deviceTypeId);
      }
    }

    this.updateNavbar();
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

  private setSelectedParameters(activeParametersId: number[]): void {
    if (activeParametersId.length === 0) {
      // Если нет выбранных параметров, просто обновляем selected на false для всех
      this.parameters.update(params =>
        params.map(param => ({...param, selected: false}))
      );
      return;
    }

    this.parameters.update(parameters =>
      parameters.map(parameter => ({
        ...parameter,
        selected: activeParametersId.includes(parameter.id)
      }))
    );
  }

  onParametersSelectionChange(selectedOptions: MultiSelectOption[]): void {
    const selectedIds = selectedOptions.map(option => option.id);
    this.form.patchValue({activeParametersId: selectedIds});
    this.form.get('activeParametersId')?.markAsTouched();
  }

  private setupDeviceTypeChangeListener() {
    // Используем effect для отслеживания изменений сигнала deviceTypeIdSignal
    effect(() => {
      const deviceTypeId = this.deviceTypeIdSignal();

      if (deviceTypeId) {
        this.loadParametersForDeviceType(deviceTypeId);
      } else {
        this.parameters.set([]);
      }
    });
  }

  onDeviceTypeChange(value: number | null): void {
    this.form.patchValue({deviceTypeId: value});
    this.form.get('deviceTypeId')?.markAsTouched();
  }

  onLocationChange(value: string): void {
    this.form.patchValue({location: value});
    this.form.get('location')?.markAsTouched();
  }

  onAlarmTypeChange(value: string): void {
    this.form.patchValue({alarmType: value});
    this.form.get('alarmType')?.markAsTouched();
  }

  private loadParametersForDeviceType(deviceTypeId: number): void {
    this.isLoading.set(true);

    this.deviceTypeService.getParameterByType(deviceTypeId).subscribe({
      next: (params: ParameterByDeviceType[]) => {
        // Преобразуем в MultiSelectOption
        const options: MultiSelectOption[] = params.map(p => ({
          id: p.id,
          mainInfo: p.name,
          secondInfo: p.description,
          selected: false // Изначально все не выбраны
        }));

        this.parameters.set(options);

        // Теперь устанавливаем выбранные параметры
        const currentSelectedIds = this.form.get('activeParametersId')?.value ||
          this.device()?.activeParametersId || [];
        this.setSelectedParameters(currentSelectedIds);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load parameters for device type:', error);
        this.parameters.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // === ОБРАБОТКА СОБЫТИЙ (СОХРАНЕНИЕ, УДАЛЕНИЕ, ОТМЕНА) ===
  onSave(): void {
    this.form.markAllAsTouched();

    if (this.form.valid && !this.isLoading()) {
      console.log('Inside save logic');
      this.isLoading.set(true);
      const formValue = this.form.value;

      // Подготовка данных для отправки
      const deviceData = {
        ...formValue,
        activeParametersId: formValue.activeParametersId || []
      };

      const request$ = this.isEditMode() && this.deviceId && this.deviceId !== 'new'
        ? this.deviceService.updateDevice(
          Number(this.deviceId),
          {id: Number(this.deviceId), ...deviceData} as DeviceUpdate
        )
        : this.deviceService.createDevice(deviceData as DeviceCreate);

      request$.subscribe({
        next: (savedDevice) => {
          this.isLoading.set(false);
          console.log('Device saved successfully:', savedDevice);
          this.router.navigate(['/devices']);
        },
        error: (error) => {
          console.error('Error saving device:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/devices']);
  }

  onDelete(): void {
    if (this.isEditMode() && this.deviceId && this.deviceId !== 'new' && !this.isLoading()) {
      const confirmed = window.confirm('Вы уверены, что хотите удалить это устройство? ' +
        'Это действие нельзя отменить.');

      if (confirmed) {
        this.isLoading.set(true);
        this.deviceService.deleteDevice(Number(this.deviceId))
          .subscribe({
            next: () => {
              this.isLoading.set(false);
              console.log('Device deleted successfully');
              this.router.navigate(['/devices']);
            },
            error: (error) => {
              console.error('Error deleting device:', error);
              this.isLoading.set(false);
            }
          });
      }
    }
  }

  // === ОБРАБОТКА ВВОДА ===
  onKeyDown(event: KeyboardEvent): void {
    handleNumberInputKeyDown(event);
  }
}
