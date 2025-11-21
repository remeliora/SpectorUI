import {Component, DestroyRef, inject, signal} from '@angular/core';
import {DetailInfoLayout} from '../../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../../shared/components/menu/menu-function-button/menu-function-button';
import {PageBodyDirective} from '../../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../../data/services/page-label-directive';
import {PageLayout} from '../../../shared/components/layouts/page-layout/page-layout';
import {FormArray, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SvgIcon} from '../../../shared/components/svg-icon/svg-icon';
import {NavbarService} from '../../../data/services/navbar-service';
import {StatusDictionaryService} from '../../../data/services/status-dictionary-service';
import {ActivatedRoute, Router} from '@angular/router';
import {StatusDictionaryDetail} from '../../../data/services/interfaces/status-dictionary/status-dictionary-detail';
import {uniqueEnumKeysValidator} from '../../../shared/helpers/validators/custom-validators';
import {Observable} from 'rxjs';
import {handleNumberInputKeyDown} from '../../../shared/helpers/events/on-key-down-event';

@Component({
  selector: 'app-status-dictionary-detail-page',
  imports: [
    DetailInfoLayout,
    MenuFunctionButton,
    PageBodyDirective,
    PageButtonsDirective,
    PageLabelDirective,
    PageLayout,
    ReactiveFormsModule,
    SvgIcon
  ],
  templateUrl: './status-dictionary-detail-page.html',
  styleUrl: './status-dictionary-detail-page.scss'
})
export class StatusDictionaryDetailPage {
  // === SERVICES ===
  private readonly navbarService = inject(NavbarService);
  private readonly statusDictionaryService = inject(StatusDictionaryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly statusDictionaryFormBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // === STATES ===
  statusDictionaryId: string | null = null;
  statusDictionary = signal<StatusDictionaryDetail | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isNotFound = signal<boolean>(false);

  // === FORM ===
  readonly form = this.statusDictionaryFormBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    enumValues: this.statusDictionaryFormBuilder.array([], {
      validators: [uniqueEnumKeysValidator()]
    })
  });

  // === ГЕТТЕРЫ ===
  get enumValuesArray(): FormArray {
    return this.form.controls.enumValues as FormArray;
  }

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  constructor() {
    this.initializeComponent();
    this.destroyRef.onDestroy(() => this.navbarService.resetConfig());
  }

  private initializeComponent(): void {
    const data = this.route.snapshot.data['statusDictionaryDetail'];
    const id = this.route.snapshot.paramMap.get('statusDictionaryId');

    this.statusDictionaryId = id;
    this.isEditMode.set(id !== 'new' && id !== null);

    if (data) {
      this.statusDictionary.set(data);
      this.form.patchValue({name: data.name});
      this.loadEnumValues(data.enumValues);
    } else {
      if (id !== 'new') {
        this.isNotFound.set(true);
      } else {
        this.addEnumValue();
      }
    }

    this.updateNavbar();
  }

  // === РАБОТА С ФОРМОЙ (enumValues) ===
  private loadEnumValues(enumValues: { [key: number]: string }): void {
    this.enumValuesArray.clear();

    Object.entries(enumValues).forEach(([key, value]) => {
      this.enumValuesArray.push(this.createEnumValueGroup(parseInt(key), value));
    });
  }

  addEnumValue(): void {
    this.enumValuesArray.push(this.createEnumValueGroup(null, ''));
  }

  removeEnumValue(index: number): void {
    this.enumValuesArray.removeAt(index);
  }

  private createEnumValueGroup(key: number | null, value: string) {
    return this.statusDictionaryFormBuilder.group({
      key: [key, [Validators.required, Validators.min(0)]],
      value: [value, Validators.required]
    });
  }

  private updateNavbar(): void {
    if (!this.statusDictionaryId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/status-dictionaries`,
      showSubsectionButton: false
    });
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const formValue = this.form.value;
      const enumValues: { [key: number]: string } = {};

      formValue.enumValues?.forEach((item: any) => {
        if (item.key !== null && item.value) {
          enumValues[item.key] = item.value;
        }
      });

      let request$: Observable<StatusDictionaryDetail>;

      if (this.isEditMode() && this.statusDictionaryId && this.statusDictionaryId !== 'new') {
        const updateData = {
          id: Number(this.statusDictionaryId),
          name: formValue.name!,
          enumValues: enumValues
        };
        // Обновление
        request$ = this.statusDictionaryService.updateStatusDictionary(Number(this.statusDictionaryId), updateData);
      } else {
        const createData = {
          name: formValue.name!,
          enumValues: enumValues
        };
        // Создание
        request$ = this.statusDictionaryService.createStatusDictionary(createData);
      }

      request$.subscribe({
        next: (result) => {
          this.isLoading.set(false);
          this.router.navigate(['/status-dictionaries']);
        },
        error: (error) => {
          console.error('Error saving status dictionary:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/status-dictionaries']); // Обновлен маршрут
  }

  onDelete(): void {
    if (this.isEditMode() && this.statusDictionaryId && this.statusDictionaryId !== 'new' && !this.isLoading()) {
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот словарь? Это действие нельзя отменить.');

      if (confirmed) {
        this.isLoading.set(true);
        this.statusDictionaryService.deleteStatusDictionary(Number(this.statusDictionaryId)) // Обновлено: передаем числовой ID
          .subscribe({
            next: () => {
              this.isLoading.set(false);
              this.router.navigate(['/status-dictionaries']); // Обновлен маршрут
            },
            error: (error) => {
              console.error('Error deleting status dictionary:', error);
              this.isLoading.set(false);
              // Обработка ошибки удаления, например, если 404
              if (error.status === 404) {
                alert('Словарь не найден.');
              }
            }
          });
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    handleNumberInputKeyDown(event);
  }
}
