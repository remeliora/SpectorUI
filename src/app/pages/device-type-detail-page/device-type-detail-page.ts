import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {NavbarService} from '../../data/services/navbar-service';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, of, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {PageBodyDirective} from "../../data/services/page-body-directive";
import {PageButtonsDirective} from "../../data/services/page-buttons-directive";
import {PageLabelDirective} from "../../data/services/page-label-directive";
import {PageLayout} from "../../shared/components/layouts/page-layout/page-layout";
import {DetailInfoLayout} from '../../shared/components/layouts/detail-info-layout/detail-info-layout';
import {MenuFunctionButton} from '../../shared/components/menu/menu-function-button/menu-function-button';
import {DeviceTypeService} from '../../data/services/device-type-service';
import {DeviceTypeDetail} from '../../data/services/interfaces/device-type/device-type-detail';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DeviceTypeCreate} from '../../data/services/interfaces/device-type/device-type-create';

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
export class DeviceTypeDetailPage implements OnInit, OnDestroy {
  private deviceTypeService = inject(DeviceTypeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private navbarService = inject(NavbarService);

  deviceTypeId: string | null = null;
  deviceType = signal<DeviceTypeDetail | null>(null);
  isEditMode = false;
  isLoading = false;
  isNotFound = false;

  deviceTypeFormBuilder = inject(FormBuilder);
  form = this.deviceTypeFormBuilder.group({
    name: ['', Validators.required],
    className: [''],
    description: ['']
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      tap(params => {
        this.deviceTypeId = params.get('deviceTypeId');
        this.isEditMode = this.deviceTypeId !== 'new' && this.deviceTypeId !== null;
        this.isNotFound = false;
        this.updateNavbar();
      }),
      switchMap(params => {
        const id = params.get('deviceTypeId');
        if (id === 'new' || id === null) {
          return of(null);
        }

        const numericId = Number(id);
        if (isNaN(numericId)) {
          this.router.navigate(['/device-types/new']);
          return of(null);
        }

        return this.deviceTypeService.getDeviceTypeById(numericId).pipe(
          catchError(error => {
            if (error.status === 404) {
              this.isNotFound = true;
              this.router.navigate(['/device-types/new']);
            }
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (deviceType) => {
        this.deviceType.set(deviceType);
        if (deviceType) {
          this.form.patchValue(deviceType);
        } else if (this.deviceTypeId !== 'new') {
          // Если deviceType null, но мы не в режиме создания,
          // значит произошла ошибка
          this.isNotFound = true;
        }
      },
      error: (error) => {
        console.error('Error loading device type:', error);
        this.isNotFound = true;
      }
    });
  }

  private updateNavbar(): void {
    if (!this.deviceTypeId) return;

    this.navbarService.setConfig({
      showBackButton: true,
      backRoute: `/device-types`,
      showSubsectionButton: this.isEditMode && !this.isNotFound,
      subsectionButton: {
        label: 'Параметры',
        route: `/device-types/${this.deviceTypeId}/parameters`
      }
    });
  }

  onSave(): void {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.form.value;

      const request$ = this.isEditMode && this.deviceTypeId && this.deviceTypeId !== 'new'
        ? this.deviceTypeService.updateDeviceType(
          Number(this.deviceTypeId),
          {id: Number(this.deviceTypeId), ...formValue} as unknown as DeviceTypeDetail
        )
        : this.deviceTypeService.createDeviceType(formValue as DeviceTypeCreate);

      request$.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.isLoading = false;
          this.deviceTypeService.refreshFilters();
          this.router.navigate(['/device-types']);
        },
        error: (error) => {
          console.error('Error saving device type:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/device-types']);
  }

  onDelete(): void {
    if (this.isEditMode && this.deviceTypeId && this.deviceTypeId !== 'new' && !this.isLoading) {
      this.isLoading = true;
      this.deviceTypeService.deleteDeviceType(Number(this.deviceTypeId))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.deviceTypeService.refreshFilters();
            this.router.navigate(['/device-types']);
          },
          error: (error) => {
            console.error('Error deleting device type:', error);
            this.isLoading = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.navbarService.resetConfig();
  }
}
