import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private deviceTypeFilterSubject = new BehaviorSubject<string | null>(null);
  private deviceFilterSubject = new BehaviorSubject<string | null>(null);

  deviceTypeFilter$ = this.deviceTypeFilterSubject.asObservable();
  deviceFilter$ = this.deviceFilterSubject.asObservable();

  setDeviceTypeFilter(filter: string | null) {
    this.deviceTypeFilterSubject.next(filter);
  }

  setDeviceFilter(filter: string | null) {
    this.deviceFilterSubject.next(filter);
  }
}
