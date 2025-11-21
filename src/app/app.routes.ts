import {Routes} from '@angular/router';
import {DeviceTypePage} from './pages/device-type/device-type-page/device-type-page';
import {DevicePage} from './pages/device/device-page/device-page';
import {ParameterPage} from './pages/parameter/parameter-page/parameter-page';
import {ThresholdPage} from './pages/threshold/threshold-page/threshold-page';
import {SettingPage} from './pages/setting/setting-page/setting-page';
import {Layout} from './shared/components/layouts/layout/layout';
import {DeviceDetailPage} from './pages/device/device-detail-page/device-detail-page';
import {ThresholdDetailPage} from './pages/threshold/threshold-detail-page/threshold-detail-page';
import {DeviceTypeDetailPage} from './pages/device-type/device-type-detail-page/device-type-detail-page';
import {ParameterDetailPage} from './pages/parameter/parameter-detail-page/parameter-detail-page';
import {deviceTypeDetailResolver} from './data/services/resolvers/device-types/device-type-detail-resolver';
import {parameterResolver} from './data/services/resolvers/parameters/parameter-resolver';
import {parameterDetailResolver} from './data/services/resolvers/parameters/parameter-detail-resolver';
import {NotFoundPage} from './pages/error/not-found-page/not-found-page';
import {ErrorPage} from './pages/error/error-page/error-page';
import {ErrorLayout} from './shared/components/layouts/error-layout/error-layout';
import {StatusDictionaryPage} from './pages/status-dictionary/status-dictionary-page/status-dictionary-page';
import {StatusDictionaryDetailPage} from './pages/status-dictionary/status-dictionary-detail-page/status-dictionary-detail-page';
import {statusDictionaryResolver} from './data/services/resolvers/status-dictionaries/status-dictionary-resolver';
import {
  statusDictionaryDetailResolver
} from './data/services/resolvers/status-dictionaries/status-dictionary-detail-resolver';
import {deviceDetailResolver} from './data/services/resolvers/devices/device-detail-resolver';
import {DeviceParameterPage} from './pages/device/device-parameter-page/device-parameter-page';
import {appSettingResolver} from './data/services/resolvers/app-settings/app-setting-resolver';
import {thresholdResolver} from './data/services/resolvers/thresholds/threshold-resolver';
import {thresholdDetailResolver} from './data/services/resolvers/thresholds/threshold-detail-resolver';
import {GraphPage} from './pages/graph-page/graph-page';

export const routes: Routes = [
  { path: '', component: Layout, children: [
      { path: 'device-types', component: DeviceTypePage },
      {
        path: 'device-types/:deviceTypeId',
        children: [
          {
            path: '',
            component: DeviceTypeDetailPage,
            resolve: {
              deviceTypeDetail: deviceTypeDetailResolver
            }
          },
          {
            path: 'parameters',
            component: ParameterPage,
            resolve: {
              parameterCards: parameterResolver
            }
          },
          {
            path: 'parameters/:parameterId',
            component: ParameterDetailPage,
            resolve: {
              parameterDetailPageData: parameterDetailResolver
            }
          }
        ]
      },
      { path: 'devices', component: DevicePage },
      {
        path: 'devices/:deviceId',
        children: [
          {
            path: '',
            component: DeviceDetailPage,
            resolve: {
              deviceDetail: deviceDetailResolver
            }
          },
          {
            path: 'parameters',
            component: DeviceParameterPage
          },
          {
            path: 'thresholds',
            component: ThresholdPage,
            resolve: {
              thresholdCards: thresholdResolver
            }
          },
          {
            path: 'thresholds/:thresholdId',
            component: ThresholdDetailPage,
            resolve: {
              thresholdDetailPageData: thresholdDetailResolver
            }
          }
        ]
      },
      { path: 'settings',
        component: SettingPage,
        resolve: {
          appSetting: appSettingResolver
        }
      },
      {
        path: 'graphs',
        component: GraphPage
      },
      {
        path: 'status-dictionaries',
        component: StatusDictionaryPage,
        resolve: {
          statusDictionaryCards: statusDictionaryResolver
        }
      },
      {
        path: 'status-dictionaries/:statusDictionaryId',
        component: StatusDictionaryDetailPage,
        resolve: {
          statusDictionaryDetail: statusDictionaryDetailResolver
        }
      },
      { path: '', redirectTo: 'devices', pathMatch: 'full' }
    ]},
  { path: '', component: ErrorLayout, children: [
      { path: 'not-found', component: NotFoundPage },
      { path: 'error', component: ErrorPage },
      { path: '**', redirectTo: '/not-found' },
    ]
  }
];
