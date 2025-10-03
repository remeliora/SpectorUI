import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ParameterCard} from './interfaces/parameter/parameter-card';
import {ParameterDetail} from './interfaces/parameter/parameter-detail';
import {ParameterCreate} from './interfaces/parameter/parameter-create';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  http = inject(HttpClient)

  getParameters(deviceTypeId: number) {
    return this.http.get<ParameterCard[]>(
      `http://localhost:8080/api/v1/main/device-types/${deviceTypeId}/parameters`
    );
  }

  getParameterById(deviceTypeId: number, parameterId: number) {
    return this.http.get<ParameterDetail>(
      `http://localhost:8080/api/v1/main/device-types/${deviceTypeId}/parameters/${parameterId}`
    );
  }

  createParameter(deviceTypeId: number, parameter: ParameterCreate) {
    return this.http.post<ParameterDetail>(
      `http://localhost:8080/api/v1/main/device-types/${deviceTypeId}/parameters`,
      parameter
    );
  }

  updateParameter(deviceTypeId: number, parameterId: number, parameter: ParameterDetail) {
    return this.http.put<ParameterDetail>(
      `http://localhost:8080/api/v1/main/device-types/${deviceTypeId}/parameters/${parameterId}`,
      parameter
    );
  }

  deleteParameter(deviceTypeId: number, parameterId: number) {
    return this.http.delete(
      `http://localhost:8080/api/v1/main/device-types/${deviceTypeId}/parameters/${parameterId}`
    );
  }
}
