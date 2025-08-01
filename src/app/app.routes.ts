import { Routes } from '@angular/router';
import { DeviceTypePage } from './pages/device-type-page/device-type-page';
import { DevicePage } from './pages/device-page/device-page';
import { ParameterPage } from './pages/parameter-page/parameter-page';
import { ThresholdPage } from './pages/threshold-page/threshold-page';
import { SettingPage } from './pages/setting-page/setting-page';
import { Layout } from './shared/components/layout/layout';

export const routes: Routes = [
  {path: '', component: Layout, children: [
      {path: 'device-types', component: DeviceTypePage},
      {path: 'devices', component: DevicePage},
      {path: 'parameters', component: ParameterPage},
      {path: 'thresholds', component: ThresholdPage},
      {path: 'settings', component: SettingPage}
    ]}
];
