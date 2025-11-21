import {Component, DestroyRef, inject, signal} from '@angular/core';
import {NavbarService} from '../../../data/services/navbar-service';
import {ActivatedRoute, Router} from '@angular/router';
import {PageBodyDirective} from "../../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../../data/services/page-label-directive";
import {PageLayout} from "../../../shared/components/layouts/page-layout/page-layout";
import {DetailInfoLayout} from '../../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../../shared/components/menu/menu-function-button/menu-function-button';
import {DeviceTypeService} from '../../../data/services/device-type-service';
import {DeviceTypeDetail} from '../../../data/services/interfaces/device-type/device-type-detail';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DeviceTypeCreate} from '../../../data/services/interfaces/device-type/device-type-create';
import {DeviceTypeUpdate} from '../../../data/services/interfaces/device-type/device-type-update';

@Component({
  selector: 'app-device-type-detail-page',
  imports: [
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    DetailInfoLayout,
    MenuFunctionButton,
    ReactiveFormsModule
  ],
  templateUrl: './device-type-detail-page.html',
  styleUrl: './device-type-detail-page.scss'
})
export class DeviceTypeDetailPage {
  // === SERVICES ===
  private readonly deviceTypeService = inject(DeviceTypeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navbarService = inject(NavbarService);
  private readonly deviceTypeFormBuilder = inject(FormBuilder);

  // === STATES ===
  deviceTypeId: string | null = null;
  deviceType = signal<DeviceTypeDetail | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isNotFound = signal<boolean>(false);

  // === FORM ===
  readonly form = this.deviceTypeFormBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    className: ['', Validators.maxLength(50)],
    description: ['', Validators.maxLength(500)]
  });

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent(): void {
    const data = this.route.snapshot.data['deviceTypeDetail'];
    const id = this.route.snapshot.paramMap.get('deviceTypeId');

    this.deviceTypeId = id;
    this.isEditMode.set(id !== 'new' && id !== null);

    if (data) {
      this.deviceType.set(data);
      this.form.patchValue(data);
    } else {
      if (id !== 'new') {
        this.isNotFound.set(true);
      }
    }

    this.updateNavbar();
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types`,
      showSubsectionButton: this.isEditMode() && !this.isNotFound(),
      subsectionButton: {
        label: 'Параметры',
        route: `/device-types/${this.deviceTypeId}/parameters`
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

      const request$ = this.isEditMode() && this.deviceTypeId && this.deviceTypeId !== 'new'
        ? this.deviceTypeService.updateDeviceType(
          Number(this.deviceTypeId),
          {id: Number(this.deviceTypeId), ...formValue} as DeviceTypeUpdate
        )
        : this.deviceTypeService.createDeviceType(formValue as DeviceTypeCreate);

      request$.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.deviceTypeService.refreshFilters();
          this.router.navigate(['/device-types']);
        },
        error: (error) => {
          console.error('Error saving device type:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/device-types']);
  }

  onDelete(): void {
    if (this.isEditMode() && this.deviceTypeId && this.deviceTypeId !== 'new' && !this.isLoading()) {
      // Показываем системное окно подтверждения
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот тип устройства? ' +
        'Это действие нельзя отменить.');

      // Если пользователь подтвердил, продолжаем удаление
      // Если пользователь нажал "Отмена", ничего не делаем
      if (confirmed) {
        // this.isLoading = true;
        this.isLoading.set(true);
        this.deviceTypeService.deleteDeviceType(Number(this.deviceTypeId))
          .subscribe({
            next: () => {
              this.isLoading.set(false);
              this.deviceTypeService.refreshFilters();
              this.router.navigate(['/device-types']);
            },
            error: (error) => {
              console.error('Error deleting device type:', error);
              this.isLoading.set(false);
            }
          });
      }
    }
  }
}
