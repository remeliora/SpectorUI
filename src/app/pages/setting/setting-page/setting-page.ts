import {Component, DestroyRef, inject, signal} from '@angular/core';
import {NavbarService} from '../../../data/services/navbar-service';
import {DetailInfoLayout} from '../../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MenuFunctionButton} from '../../../shared/components/menu/menu-function-button/menu-function-button';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {ActivatedRoute, Router} from '@angular/router';
import {AppSettingService} from '../../../data/services/app-setting-service';
import {AppSettingDetail} from '../../../data/services/interfaces/app-setting/app-setting-detail';
import {SwitchForForm} from '../../../shared/components/switches/switch-for-form/switch-for-form';

@Component({
  selector: 'app-setting-page',
  imports: [
    DetailInfoLayout,
    FormsModule,
    MenuFunctionButton,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    SwitchForForm
  ],
  templateUrl: './setting-page.html',
  styleUrl: './setting-page.scss'
})
export class SettingPage {
  // === SERVICES ===
  private readonly appSettingService = inject(AppSettingService);
  private readonly navbarService = inject(NavbarService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appSettingFormBuilder = inject(FormBuilder);

  // === STATES ===
  appSetting = signal<AppSettingDetail | null>(null);
  isLoading = signal<boolean>(false);

  // === FORM ===
  readonly form = this.appSettingFormBuilder.group({
    pollActive: [true, Validators.required],
    alarmActive: [true, Validators.required],
  })

  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent() {
    const data = this.route.snapshot.data['appSetting'];

    this.appSetting.set(data);

    this.form.patchValue({
      pollActive: data.pollActive,
      alarmActive: data.alarmActive
    });

    this.updateNavbar();
  }

  private updateNavbar() {
    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: ``
    });
  }

  // === ОБРАБОТКА СОБЫТИЙ (СОХРАНЕНИЕ, УДАЛЕНИЕ, ОТМЕНА) ===
  onSave(): void {
    this.form.markAllAsTouched();

    if (this.form.valid && !this.isLoading()) {
      console.log('Inside save logic');
      this.isLoading.set(true);
      const formValue = this.form.value;

      const settingData: AppSettingDetail = {
        id: this.appSetting()?.id || 1,
        pollActive: formValue.pollActive as boolean,
        alarmActive: formValue.alarmActive as boolean
      };

      this.appSettingService.updateSettings(settingData).subscribe({
        next: (updatedSettings) => {
          this.isLoading.set(false);
          this.appSetting.set(updatedSettings);
          console.log('Settings updated successfully:', updatedSettings);
          this.router.navigate(['/devices']);
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/devices']);
  }

  onReset(): void {
    const confirmed = window.confirm('Вы уверены, что хотите сбросить настройки к значениям по умолчанию? ' +
      'Это действие нельзя отменить.');

    if (confirmed) {
      this.isLoading.set(true);
      this.appSettingService.resetSettings()
        .subscribe({
          next: (resetSettings) => {
            this.isLoading.set(false);
            this.appSetting.set(resetSettings);
            this.form.patchValue({
              pollActive: resetSettings.pollActive,
              alarmActive: resetSettings.alarmActive
            });
            console.log('Settings reset successfully:', resetSettings);
            this.router.navigate(['/devices']);
          },
          error: (error) => {
            console.error('Error resetting settings:', error);
            this.isLoading.set(false);
          }
        });
    }
  }
}
