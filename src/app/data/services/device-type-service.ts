import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/device-types/'

  getUniqueClassNames() {
    return this.http.get<string[]>(`${this.baseApiUrl}unique-class-names`)

  }

}
