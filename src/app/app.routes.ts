import { Routes } from '@angular/router';
import {DeviceTypePage} from './pages/device-type-page/device-type-page';
import {DevicePage} from './pages/device-page/device-page';
import {ParameterPage} from './pages/parameter-page/parameter-page';
import {ThresholdPage} from './pages/threshold-page/threshold-page';
import {SettingPage} from './pages/setting-page/setting-page';
import {Layout} from './shared/components/layout/layout';

export const routes: Routes = [
  {path: '', component: Layout, children: [
      {path: 'device-type', component: DeviceTypePage},
      {path: 'device', component: DevicePage},
      {path: 'parameter', component: ParameterPage},
      {path: 'threshold', component: ThresholdPage},
      {path: 'setting', component: SettingPage}
    ]}
];
