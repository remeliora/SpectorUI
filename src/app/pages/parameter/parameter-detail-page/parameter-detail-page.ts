import {Component, computed, DestroyRef, effect, inject, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavbarService} from '../../../data/services/navbar-service';
import {DetailInfoLayout} from "../../../shared/components/layouts/detail-info-layout/detail-info-layout";
import {MenuFunctionButton} from "../../../shared/components/menu/menu-function-button/menu-function-button";
import {PageBodyDirective} from "../../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../../data/services/page-label-directive";
import {PageLayout} from "../../../shared/components/layouts/page-layout/page-layout";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ParameterService} from '../../../data/services/parameter-service';
import {Select} from '../../../shared/components/selects/select/select';
import {DeviceTypeDetail} from '../../../data/services/interfaces/device-type/device-type-detail';
import {ParameterDetail} from '../../../data/services/interfaces/parameter/parameter-detail';
import {EnumOption} from '../../../data/services/interfaces/enum/enum-option';
import {MultiSelect} from '../../../shared/components/selects/multi-select/multi-select';
import {MultiSelectOption} from '../../../data/services/interfaces/select/multi-select-option';
import {DeviceByDeviceType} from '../../../data/services/interfaces/device/device-by-device-type';
import {ParameterCreate} from '../../../data/services/interfaces/parameter/parameter-create';
import {handleNumberInputKeyDown} from '../../../shared/helpers/events/on-key-down-event';
import {oidValidator} from '../../../shared/helpers/validators/custom-validators';
import {StatusDictionaryCard} from '../../../data/services/interfaces/status-dictionary/status-dictionary-card';
import {ParameterUpdate} from '../../../data/services/interfaces/parameter/parameter-update';
import {toSignal} from '@angular/core/rxjs-interop';

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
  // === SERVICES ===
  private readonly parameterService = inject(ParameterService);
  private readonly navbarService = inject(NavbarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly parameterFormBuilder = inject(FormBuilder);

  // === STATES ===
  deviceTypeId!: number;
  parameterId: string | null = null;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isNotFound = signal<boolean>(false);
  deviceType = signal<DeviceTypeDetail | null>(null);
  parameter = signal<ParameterDetail | null>(null);
  dataTypes = signal<EnumOption[]>([]);
  devices = signal<MultiSelectOption[]>([]);
  statusDictionaries = signal<StatusDictionaryCard[]>([]);
  statusDictionaryOptions = computed(() => {
    const dicts = this.statusDictionaries();
    // Создаем специальный объект для опции "Создать новый"
    // Используем уникальное значение, которое не может быть реальным ID
    const createNewOption: StatusDictionaryCard & { isCreateNew: boolean } = {
      id: -1,
      name: 'Создать новый словарь',
      count: 0,
      isCreateNew: true
    };
    return [createNewOption, ...dicts];
  });
  isDataTypeEnumerated = signal<boolean>(false);

  // === FORM ===
  readonly form = this.parameterFormBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.maxLength(100), oidValidator()]],
    metric: ['', Validators.maxLength(10)],
    additive: [0, Validators.required],
    coefficient: [1, [Validators.required, Validators.min(0)]],
    description: ['', Validators.maxLength(500)],
    dataType: ['', Validators.required],
    activeDevicesId: [[] as number[]],
    statusDictionaryId: [null as number | null]
  })

  // === SIGNAL-BASED OBSERVABLES ===
  // Преобразуем FormControl dataType в сигнал
  dataTypeSignal = toSignal(this.form.get(
      'dataType')!.valueChanges,
    {initialValue: this.form.get('dataType')!.value});

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.initializeComponent();
    this.setupDataTypeChangeListener();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent(): void {
    const data = this.route.snapshot.data['parameterDetailPageData'];

    const deviceTypeIdParam = this.route.snapshot.paramMap.get('deviceTypeId');
    if (deviceTypeIdParam) {
      this.deviceTypeId = Number(deviceTypeIdParam);
      if (isNaN(this.deviceTypeId)) {
        console.error('Invalid deviceTypeId:', deviceTypeIdParam);
        return;
      }
    } else {
      console.error('Missing deviceTypeId in route params');
      return;
    }

    this.parameterId = this.route.snapshot.paramMap.get('parameterId');
    this.isEditMode.set(this.parameterId !== 'new' && this.parameterId !== null);
    this.isNotFound.set(false);
    this.deviceType.set(data.deviceType);
    this.parameter.set(data.parameter);
    this.dataTypes.set(data.dataTypes);
    this.statusDictionaries.set(data.statusDictionaries);

    const multiSelectOptions: MultiSelectOption[] = (data.devices as DeviceByDeviceType[])
      .map(device => ({
        id: device.id,
        mainInfo: device.name,
        secondInfo: device.ipAddress,
        selected: false
      }));
    this.devices.set(multiSelectOptions);

    if (data.parameter) {
      this.form.patchValue(data.parameter);
      this.setSelectedDevices(data.parameter.activeDevicesId || []);
    }

    this.updateNavbar();
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
    this.form.patchValue({activeDevicesId: selectedIds});
    this.form.get('activeDevicesId')?.markAsTouched();
  }

  // Обработчик клика по опции селекта
  handleStatusDictionaryOptionClick(option: any, event: Event): boolean {
    if (option.isCreateNew) {
      event.preventDefault();
      event.stopPropagation();
      this.router.navigate(['/status-dictionaries', 'new']);
      return false;
    }
    return true;
  }

  onStatusDictionaryChange(value: number | null): void {
    this.form.patchValue({statusDictionaryId: value});
    this.form.get('statusDictionaryId')?.markAsTouched();
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types/${this.deviceTypeId}/parameters`,
    });
  }

  // Метод для настройки слушателя изменения dataType
  private setupDataTypeChangeListener(): void {
    // Используем effect для отслеживания изменений значения контрола dataType
    effect(() => {
      const currentDataType = this.dataTypeSignal();
      const isEnum = currentDataType === 'ENUMERATED'; // Предполагаем, что точное значение 'enumerated'
      this.isDataTypeEnumerated.set(isEnum);

      // Управляем валидацией и значениями полей
      untracked(() => {
        if (isEnum) {
          // Если enumerated, скрываем и очищаем поля для числовых данных
          this.form.get('metric')?.clearValidators();
          this.form.get('additive')?.clearValidators();
          this.form.get('coefficient')?.clearValidators();

          this.form.get('metric')?.setValue('');
          this.form.get('additive')?.setValue(0);
          this.form.get('coefficient')?.setValue(1);

          // Делаем поле statusDictionaryId обязательным (если нужно)
          this.form.get('statusDictionaryId')?.setValidators([Validators.required]);
        } else {
          // Если не enumerated, скрываем и очищаем поле словаря
          this.form.get('statusDictionaryId')?.clearValidators();

          this.form.get('statusDictionaryId')?.setValue(null);

          // Делаем поля для числовых данных обязательными (если нужно)
          this.form.get('metric')?.setValidators([Validators.maxLength(10)]);
          this.form.get('additive')?.setValidators([Validators.required]);
          this.form.get('coefficient')?.setValidators([Validators.required, Validators.min(0)]);
        }

        // Обновляем состояние валидации для всех затронутых полей
        this.form.get('metric')?.updateValueAndValidity();
        this.form.get('additive')?.updateValueAndValidity();
        this.form.get('coefficient')?.updateValueAndValidity();
        this.form.get('statusDictionaryId')?.updateValueAndValidity();
      });
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
      const parameterData = {
        name: formValue.name || '',
        address: formValue.address || '',
        metric: formValue.metric || '',
        additive: formValue.additive != null ? Number(formValue.additive) : 0,
        coefficient: formValue.coefficient != null ? Number(formValue.coefficient) : 1,
        description: formValue.description || '',
        dataType: formValue.dataType || '',
        activeDevicesId: formValue.activeDevicesId || [],
        statusDictionaryId: formValue.statusDictionaryId
      };

      const request$ = this.isEditMode() && this.parameterId && this.parameterId !== 'new'
        ? this.parameterService.updateParameter(
          this.deviceTypeId,
          Number(this.parameterId),
          {id: Number(this.parameterId), ...parameterData} as ParameterUpdate
        )
        : this.parameterService.createParameter(
          this.deviceTypeId,
          parameterData as ParameterCreate
        );

      request$.subscribe({
        next: (savedParameter) => {
          this.isLoading.set(false);
          console.log('Parameter saved successfully:', savedParameter);
          this.router.navigate(['/device-types', this.deviceTypeId, 'parameters']);
        },
        error: (error) => {
          console.error('Error saving parameter:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/device-types', this.deviceTypeId, 'parameters']);
  }

  onDelete(): void {
    if (this.isEditMode() && this.parameterId && this.parameterId !== 'new' && !this.isLoading()) {
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот параметр? ' +
        'Это действие нельзя отменить.');

      if (confirmed) {
        this.isLoading.set(true);
        this.parameterService.deleteParameter(this.deviceTypeId, Number(this.parameterId))
          .subscribe({
            next: () => {
              this.isLoading.set(false);
              console.log('Parameter deleted successfully');
              this.router.navigate(['/device-types', this.deviceTypeId, 'parameters']);
            },
            error: (error) => {
              console.error('Error deleting parameter:', error);
              this.isLoading.set(false);
            }
          });
      }
    }
  }

  onDataTypeChange(value: string): void {
    this.form.patchValue({dataType: value});
    // Также помечаем поле как touched для валидации
    this.form.get('dataType')?.markAsTouched();
  }

  // === ОБРАБОТКА ВВОДА ===
  onKeyDown(event: KeyboardEvent): void {
    handleNumberInputKeyDown(event);
  }
}
