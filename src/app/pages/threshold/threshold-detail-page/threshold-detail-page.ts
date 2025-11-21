import {Component, computed, DestroyRef, effect, inject, signal, untracked} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavbarService} from '../../../data/services/navbar-service';
import {ThresholdService} from '../../../data/services/threshold-service';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {handleNumberInputKeyDown} from '../../../shared/helpers/events/on-key-down-event';
import {DetailInfoLayout} from '../../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../../shared/components/menu/menu-function-button/menu-function-button';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {Select} from '../../../shared/components/selects/select/select';
import {SwitchForForm} from '../../../shared/components/switches/switch-for-form/switch-for-form';
import {DeviceDetail} from '../../../data/services/interfaces/device/device-detail';
import {ThresholdDetail} from '../../../data/services/interfaces/threshold/threshold-detail';
import {ParameterShort} from '../../../data/services/interfaces/parameter/parameter-short';
import {toSignal} from '@angular/core/rxjs-interop';
import {Observable} from 'rxjs';
import {ThresholdUpdate} from '../../../data/services/interfaces/threshold/threshold-update';
import {ThresholdCreate} from '../../../data/services/interfaces/threshold/threshold-create';
import {SelectOption} from '../../../data/services/interfaces/select/select-option';
import {ParameterService} from '../../../data/services/parameter-service';
import {StatusDictionaryService} from '../../../data/services/status-dictionary-service';
import {ParameterDetail} from '../../../data/services/interfaces/parameter/parameter-detail';

@Component({
  selector: 'app-threshold-detail-page',
  imports: [
    DetailInfoLayout,
    FormsModule,
    MenuFunctionButton,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    Select,
    SwitchForForm
  ],
  templateUrl: './threshold-detail-page.html',
  styleUrl: './threshold-detail-page.scss'
})
export class ThresholdDetailPage {
  // === SERVICES ===
  private readonly thresholdService = inject(ThresholdService);
  private readonly parameterService = inject(ParameterService);
  private readonly statusDictionaryService = inject(StatusDictionaryService);
  private readonly navbarService = inject(NavbarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly thresholdFormBuilder = inject(FormBuilder);

  // === STATES ===
  deviceId!: number;
  thresholdId: string | null = null;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isNotFound = signal<boolean>(false);
  device = signal<DeviceDetail | null>(null);
  threshold = signal<ThresholdDetail | null>(null);
  availableParameters = signal<ParameterShort[]>([]);
  // Для хранения выбранного параметра
  selectedParameter = signal<ParameterShort | null>(null);
  // Вычисляемый сигнал для определения, является ли выбранный параметр ENUMERATED
  isParameterEnumerated = computed(() => {
    const param = this.selectedParameter();
    return param ? param.dataType === 'ENUMERATED' : false;
  });

  // === FORM ===
  readonly form = this.thresholdFormBuilder.group({
    lowValue: [null as number | null, []],
    matchExact: [''],
    highValue: [null as number | null, []],
    isEnable: [false, Validators.required],
    parameterId: [null as number | null, Validators.required]
  });

  // === SIGNAL-BASED OBSERVABLES ===
  // Преобразуем FormControl parameterId в сигнал для отслеживания выбора
  parameterIdSignal = toSignal(this.form.get('parameterId')!.valueChanges,
    {initialValue: this.form.get('parameterId')!.value});

  constructor() {
    this.initializeComponent();
    this.setupParameterChangeListener();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent() {
    const data = this.route.snapshot.data['thresholdDetailPageData'];

    const deviceIdParam = this.route.snapshot.paramMap.get('deviceId');
    if (deviceIdParam) {
      this.deviceId = Number(deviceIdParam);
      if (isNaN(this.deviceId)) {
        console.error('Invalid deviceId:', deviceIdParam);
        return;
      }
    } else {
      console.error('Missing deviceId in route params');
      return;
    }

    this.thresholdId = this.route.snapshot.paramMap.get('thresholdId');
    this.isEditMode.set(this.thresholdId !== 'new' && this.thresholdId !== null);
    this.isNotFound.set(false);
    this.device.set(data.device);
    this.threshold.set(data.threshold);
    this.availableParameters.set(data.availableParameters);

    console.log('Available Parameters from Resolver:', data.availableParameters); // <-- Добавьте это
    console.log('Signal availableParameters:', this.availableParameters()); // <-- И это

    if (data.threshold) {
      // --- ЛОГИКА ДЛЯ РЕДАКТИРОВАНИЯ ---
      if (this.isEditMode()) {
        const initialParamId = data.threshold.parameterId;
        const deviceTypeId = data.device?.deviceTypeId;

        if (initialParamId && deviceTypeId) {
          // Загружаем детали параметра
          this.parameterService.getParameterById(deviceTypeId, initialParamId).subscribe({
            next: (paramDetail: ParameterDetail) => {
              // Начинаем формировать объект, совместимый с ParameterShort
              const paramAsShort: ParameterShort = {
                id: paramDetail.id,
                name: paramDetail.name,
                description: paramDetail.description,
                dataType: paramDetail.dataType,
                enumeration: {} // Инициализируем пустым объектом
              };

              // Если dataType ENUMERATED, загружаем словарь статусов для получения enumeration
              if (paramDetail.dataType === 'ENUMERATED' && paramDetail.statusDictionaryId) {
                this.statusDictionaryService.getStatusDictionaryDetail(paramDetail.statusDictionaryId).subscribe({
                  next: (statusDictDetail) => {
                    // Создаем enumeration из enumValues словаря
                    // StatusDictionaryDetail.enumValues: { [key: number]: string }
                    // ParameterShort.enumeration: { [key: string]: string }
                    // Нужно преобразовать ключи из number в string
                    const enumFromDict: { [key: string]: string } = {};
                    Object.entries(statusDictDetail.enumValues).forEach(([numKey, value]) => {
                      enumFromDict[numKey] = value; // numKey уже строка после Object.entries
                    });
                    paramAsShort.enumeration = enumFromDict;

                    // Теперь у нас есть полный объект paramAsShort с enumeration
                    this.selectedParameter.set(paramAsShort);
                    // Заполняем форму с данными порога
                    this.form.patchValue(data.threshold);
                    console.log('Selected parameter for edit set from service with enumeration:', paramAsShort);
                  },
                  error: (error) => {
                    console.error('Failed to load status dictionary for parameter:', error);
                    // Если словарь не загрузился, можно оставить enumeration пустым или отобразить ошибку
                    this.selectedParameter.set(paramAsShort); // Устанавливаем без enumeration
                    this.form.patchValue(data.threshold); // Заполняем остальные поля
                  }
                });
              } else {
                // Если не ENUMERATED или нет statusDictionaryId, просто устанавливаем
                this.selectedParameter.set(paramAsShort);
                this.form.patchValue(data.threshold);
                console.log('Selected parameter for edit set from service (no enum load):', paramAsShort);
              }
            },
            error: (error) => {
              console.error('Failed to load parameter details for edit:', error);
              this.selectedParameter.set(null);
            }
          });
        } else {
          console.error('Parameter ID or Device Type ID not available for loading parameter details during edit.');
          this.selectedParameter.set(null);
        }
      } else { // --- ЛОГИКА ДЛЯ СОЗДАНИЯ ---
        this.form.patchValue(data.threshold || {});
        // selectedParameter останется null, пока пользователь не выберет параметр из селекта
      }
    } else { // Создание без начальных данных
      this.form.patchValue({});
    }

    this.updateNavbar();
  }

  private updateNavbar(): void {
    if (!this.deviceId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/devices/${this.deviceId}/thresholds`,
    });
  }

  private setupParameterChangeListener() {
    effect(() => {
      if (!this.isEditMode()) {
        const currentParameterId = this.parameterIdSignal();
        const availableParams = this.availableParameters();
        // Находим объект параметра по ID
        const selectedParam = availableParams.find(p => p.id === currentParameterId) || null;
        this.selectedParameter.set(selectedParam);

        untracked(() => {
          if (this.isParameterEnumerated()) {
            // Если выбранный параметр ENUMERATED
            // Поля lowValue и highValue не требуются
            this.form.get('lowValue')?.clearValidators();
            this.form.get('highValue')?.clearValidators();
            this.form.get('lowValue')?.setValue(null);
            this.form.get('highValue')?.setValue(null);
            // Поле matchExact становится обязательным
            this.form.get('matchExact')?.setValidators([Validators.required]);
          } else {
            // Если выбранный параметр НЕ ENUMERATED
            // Поле matchExact не требуется
            this.form.get('matchExact')?.clearValidators();
            this.form.get('matchExact')?.setValue('');
            // Поля lowValue и highValue становятся обязательными (если нужно по бизнес-логике)
            // Пример с простой проверкой на число:
            this.form.get('lowValue')?.setValidators([Validators.required]);
            this.form.get('highValue')?.setValidators([Validators.required]);
          }

          // Обновляем состояние валидации для всех затронутых полей
          this.form.get('lowValue')?.updateValueAndValidity();
          this.form.get('highValue')?.updateValueAndValidity();
          this.form.get('matchExact')?.updateValueAndValidity();
        });
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
      const thresholdData = {
        lowValue: formValue.lowValue,
        matchExact: formValue.matchExact || null, // Убедитесь, что null передается, если пусто
        highValue: formValue.highValue,
        isEnable: formValue.isEnable,
        parameterId: formValue.parameterId // ID выбранного параметра
      };

      let request$: Observable<ThresholdDetail>;

      if (this.isEditMode() && this.thresholdId && this.thresholdId !== 'new') {
        // Обновление
        request$ = this.thresholdService.updateThreshold(
          this.deviceId,
          Number(this.thresholdId),
          {id: Number(this.thresholdId), ...thresholdData} as ThresholdUpdate
        );
      } else {
        // Создание
        request$ = this.thresholdService.createThreshold(
          this.deviceId,
          thresholdData as ThresholdCreate
        );
      }

      request$.subscribe({
        next: (savedThreshold) => {
          this.isLoading.set(false);
          console.log('Threshold saved successfully:', savedThreshold);
          this.router.navigate(['/devices', this.deviceId, 'thresholds']);
        },
        error: (error) => {
          console.error('Error saving threshold:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/devices', this.deviceId, 'thresholds']);
  }

  onDelete(): void {
    if (this.isEditMode() && this.thresholdId && this.thresholdId !== 'new' && !this.isLoading()) {
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот порог? Это действие нельзя отменить.');

      if (confirmed) {
        this.isLoading.set(true);
        this.thresholdService.deleteThreshold(this.deviceId, Number(this.thresholdId))
          .subscribe({
            next: () => {
              this.isLoading.set(false);
              console.log('Threshold deleted successfully');
              this.router.navigate(['/devices', this.deviceId, 'thresholds']);
            },
            error: (error) => {
              console.error('Error deleting threshold:', error);
              this.isLoading.set(false);
            }
          });
      }
    }
  }

  getMatchExactSelectOptions(): SelectOption[] {
    const param = this.selectedParameter();
    if (param && param.enumeration) {
      return Object.entries(param.enumeration).map(([key, value]) => ({
        key: key,
        value: value
      }));
    }
    return [];
  }

  onMatchExactChange(value: string | null): void {
    this.form.patchValue({matchExact: value});
    this.form.get('matchExact')?.markAsTouched();
  }

  onParameterChange(value: number | null): void {
    this.form.patchValue({parameterId: value});
    this.form.get('parameterId')?.markAsTouched();
  }

  // === ОБРАБОТКА ВВОДА ===
  onKeyDown(event: KeyboardEvent): void {
    handleNumberInputKeyDown(event);
  }
}
