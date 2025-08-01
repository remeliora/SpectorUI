import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/devices/'

  getUniqueLocations() {
    return this.http.get<string[]>(`${this.baseApiUrl}unique-locations`)
  }
}
