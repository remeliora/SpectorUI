import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {DetailInfoLayout} from '../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../shared/components/menu/menu-function-button/menu-function-button';
import {PageBodyDirective} from '../../data/services/page-body-directive';
import {PageButtonsDirective} from '../../data/services/page-buttons-directive';
import {PageLabelDirective} from '../../data/services/page-label-directive';
import {PageLayout} from '../../shared/components/layouts/page-layout/page-layout';
import {FormArray, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {EnumerationService} from '../../data/services/enumeration-service';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, of, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {EnumerationDetail} from '../../data/services/interfaces/enumeration/enumeration-detail';
import {SvgIcon} from '../../shared/components/svg-icon/svg-icon';
import {uniqueEnumKeysValidator} from '../../data/services/validators/custom-validators';

@Component({
  selector: 'app-enumeration-detail-page',
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
  templateUrl: './enumeration-detail-page.html',
  styleUrl: './enumeration-detail-page.scss'
})
export class EnumerationDetailPage implements OnInit, OnDestroy {
  // === SERVICES ===
  private readonly navbarService = inject(NavbarService);
  private readonly enumerationService = inject(EnumerationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly enumerationFormBuilder = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // === STATES ===
  collectionName: string | null = null;
  collection = signal<EnumerationDetail | null>(null);
  isEditMode = false;
  isLoading = false;
  isNotFound = false;

  // === FORM ===
  readonly form = this.enumerationFormBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    enumValues: this.enumerationFormBuilder.array([], {
      validators: [uniqueEnumKeysValidator()]
    })
  });

  // === ГЕТТЕРЫ ===
  get enumValuesArray(): FormArray {
    return this.form.controls.enumValues as FormArray;
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  // === ЖИЗНЕННЫЙ ЦИКЛ ===
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }

  private initializeComponent(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      tap(params => this.setupComponentState(params)),
      switchMap(params => this.loadInitialData(params))
    ).subscribe({
      next: (enumeration) => this.handleLoadedData(enumeration),
      error: (error) => this.handleError(error)
    });
  }

  private setupComponentState(params: import('@angular/router').ParamMap): void {
    this.collectionName = params.get('collectionName');
    this.isEditMode = this.collectionName !== 'new' && this.collectionName !== null;
    this.isNotFound = false;
    this.updateNavbar();
  }

  private loadInitialData(params: import('@angular/router').ParamMap) {
    const name = params.get('collectionName');
    if (name === 'new' || name === null) {
      this.addEnumValue(); // Добавляем пустое поле для нового словаря
      return of(null);
    }

    return this.enumerationService.getEnumeratedStatusDetail(name).pipe(
      catchError(error => {
        if (error.status === 404) {
          this.isNotFound = true;
          this.router.navigate(['/enumerations/new']);
        }
        return of(null);
      })
    );
  }

  private handleLoadedData(enumeration: EnumerationDetail | null): void {
    this.collection.set(enumeration);
    if (enumeration) {
      this.form.patchValue({ name: enumeration.name });
      this.loadEnumValues(enumeration.enumValues);
    } else if (this.collectionName !== 'new') {
      this.isNotFound = true;
    }
  }

  private handleError(error: any): void {
    console.error('Error loading enumeration:', error);
    this.isNotFound = true;
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
    return this.enumerationFormBuilder.group({
      key: [key, [Validators.required, Validators.min(0)]],
      value: [value, Validators.required]
    });
  }

  private updateNavbar(): void {
    if (!this.collectionName) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/enumerations`,
      showSubsectionButton: false
    });
  }

  // === ОБРАБОТКА СОБЫТИЙ (СОХРАНЕНИЕ, УДАЛЕНИЕ, ОТМЕНА) ===
  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue = this.form.value;
      const enumValues: { [key: number]: string } = {};

      // Преобразуем массив в объект
      formValue.enumValues?.forEach((item: any) => {
        if (item.key !== null && item.value) {
          enumValues[item.key] = item.value;
        }
      });

      const requestData = {
        name: formValue.name!,
        enumValues: enumValues
      };

      const request$ = this.isEditMode && this.collectionName && this.collectionName !== 'new'
        ? this.enumerationService.updateEnumeratedStatus(this.collectionName, requestData)
        : this.enumerationService.createEnumeratedStatus(requestData);

      request$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (result) => {
          this.isLoading = false;
          this.router.navigate(['/enumerations']);
        },
        error: (error) => {
          console.error('Error saving enumeration:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/enumerations']);
  }

  onDelete(): void {
    if (this.isEditMode && this.collectionName && this.collectionName !== 'new' && !this.isLoading) {
      // Показываем системное окно подтверждения
      const confirmed = window.confirm('Вы уверены, что хотите удалить этот словарь? ' +
        'Это действие нельзя отменить.');

      // Если пользователь подтвердил, продолжаем удаление
      // Если пользователь нажал "Отмена", ничего не делаем
      if (confirmed) {
        this.isLoading = true;
        this.enumerationService.deleteEnumeratedStatus(this.collectionName)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/enumerations']);
            },
            error: (error) => {
              console.error('Error deleting enumeration:', error);
              this.isLoading = false;
            }
          });
      }
    }
  }

  // === ОБРАБОТКА ВВОДА ===
  onKeyDown(event: KeyboardEvent): void {
    // Разрешённые клавиши
    const allowedKeys = [
      'Backspace', 'Tab', 'Enter', 'Escape', 'Delete',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'
    ];

    // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X и т.д.
    if (event.ctrlKey || event.metaKey) return;


    // Проверяем, является ли нажатая клавиша цифрой
    if (event.key >= '0' && event.key <= '9') return;

    // Разрешаем точку (десятичный разделитель)
    if (event.key === '.') {
      const input = event.target as HTMLInputElement;
      // Проверяем, что точка ещё не введена
      if (input.value.includes('.')) { event.preventDefault(); return; }
      return;
    }

    // Разрешаем минус, только если он в начале
    if (event.key === '-') {
      const input = event.target as HTMLInputElement;
      if (input.selectionStart !== 0) { event.preventDefault(); return; }
      return;
    }

    // Если клавиша не разрешена, отменяем её
    if (!allowedKeys.includes(event.key)) { event.preventDefault() }
  }
}
