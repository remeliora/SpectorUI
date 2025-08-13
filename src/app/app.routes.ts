import {Routes} from '@angular/router';
import {DeviceTypePage} from './pages/device-type-page/device-type-page';
import {DevicePage} from './pages/device-page/device-page';
import {ParameterPage} from './pages/parameter-page/parameter-page';
import {ThresholdPage} from './pages/threshold-page/threshold-page';
import {SettingPage} from './pages/setting-page/setting-page';
import {Layout} from './shared/components/layout/layout';
import {EnumerationPage} from './pages/enumeration-page/enumeration-page';
import {DeviceDetailPage} from './pages/device-detail-page/device-detail-page';
import {ThresholdDetailPage} from './pages/threshold-detail-page/threshold-detail-page';
import {DeviceTypeDetailPage} from './pages/device-type-detail-page/device-type-detail-page';
import {ParameterDetailPage} from './pages/parameter-detail-page/parameter-detail-page';
import {EnumerationDetailPage} from './pages/enumeration-detail-page/enumeration-detail-page';

export const routes: Routes = [
  { path: '', component: Layout, children: [
      { path: 'device-types', component: DeviceTypePage },
      {
        path: 'device-types/:deviceTypeId',
        children: [
          {
            path: '',
            component: DeviceTypeDetailPage
          },
          {
            path: 'parameters',
            component: ParameterPage
          },
          { path: 'parameters/:parameterId',
            component: ParameterDetailPage
          }
        ]
      },
      { path: 'devices', component: DevicePage },
      {
        path: 'devices/:deviceId',
        children: [
          {
            path: '',
            component: DeviceDetailPage
          },
          {
            path: 'thresholds',
            component: ThresholdPage
          },
          {
            path: 'thresholds/:thresholdId',
            component: ThresholdDetailPage
          }
        ]
      },
      { path: 'parameters', component: ParameterPage },
      { path: 'thresholds', component: ThresholdPage },
      { path: 'settings', component: SettingPage },
      { path: 'enumerations', component: EnumerationPage },
      {
        path: 'enumerations/:collectionName',
        component: EnumerationDetailPage
      },
      { path: '', redirectTo: 'devices', pathMatch: 'full' }
    ]}
];
