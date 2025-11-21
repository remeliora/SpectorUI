import {AfterViewInit, Component, DestroyRef, inject, signal, ViewChild} from '@angular/core';
import * as Highcharts from 'highcharts';
import {HighchartsChartDirective, providePartialHighcharts} from 'highcharts-angular';
import {GraphStateService} from '../../../data/services/graph-state-service';
import {GraphService} from '../../../data/services/graph-service';
import {SeriesData} from '../../../data/services/interfaces/graph/series-data';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';

@Component({
  selector: 'app-graph-chart',
  imports: [
    HighchartsChartDirective
  ],
  providers: [
    providePartialHighcharts({
      modules: () => [
        import('highcharts/esm/modules/stock')
      ]
    })
  ],
  templateUrl: './graph-chart.html',
  styleUrl: './graph-chart.scss'
})
export class GraphChart implements AfterViewInit {
  private readonly graphStateService = inject(GraphStateService);
  private readonly graphService = inject(GraphService);
  private readonly destroyRef = inject(DestroyRef);

  chartData = signal<SeriesData[] | null>(null);
  isLoading = signal(false);

  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      height: 737
    },
    title: {
      text: 'График параметров'
    },
    time: {
      timezone: 'Asia/Vladivostok'
    },
    tooltip: {
      xDateFormat: '%Y-%m-%d %H:%M:%S'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e. %b',
        week: '%e. %b',
        month: '%b \'%y',
        year: '%Y'
      }
    },
    yAxis: {
      title: {
        text: 'Значение'
      }
    },
    navigator: {
      enabled: true,
      height: 40,
      adaptToUpdatedData: true,
      handles: {backgroundColor: '#f7f7f7', borderColor: '#b2b1b6'},
      outlineColor: '#ccc',
      maskFill: 'rgba(100, 100, 100, 0.3)',
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          millisecond: '%H:%M:%S.%L',
          second: '%H:%M:%S',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%e. %b',
          week: '%e. %b',
          month: '%b \'%y',
          year: '%Y'
        }
      }
    },
    series: [],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            enabled: false
          }
        }
      }]
    }
  };

  @ViewChild('chart', {static: false}) chartDirective?: HighchartsChartDirective;
  private chartInstance: Highcharts.Chart | undefined;

  constructor() {
    console.log('GraphChart: инициализация');

    this.graphStateService.buildChart$
      .pipe(
        switchMap(request => {
          console.log('GraphChart: switchMap получил новый запрос, отменяет предыдущий:', request);
          this.isLoading.set(true);
          return this.graphService.getChartData(request)
            .pipe(takeUntilDestroyed(this.destroyRef));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          console.log('GraphChart: получены данные из switchMap, обновляем chartData');
          this.chartData.set(response.series);
          this.updateChartWithInstance();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Ошибка при получении данных графика из switchMap:', error);
          this.isLoading.set(false);
          this.chartData.set(null);
          this.updateChartWithInstance();
        }
      });
  }

  ngAfterViewInit() {
  }

  onChartInstance(chart: Highcharts.Chart) {
    console.log('GraphChart: экземпляр чарта получен');
    this.chartInstance = chart;
  }

  private updateChartWithInstance(): void {
    if (!this.chartInstance) {
      console.warn('GraphChart: chartInstance не доступен, обновление отложено или пропущено');
      const seriesData = this.chartData();
      if (seriesData && seriesData.length > 0) {
        const chartSeries = seriesData.map(series => ({
          name: `${series.deviceName} - ${series.parameterName}`,
          data: series.data as [number, number][],
          type: 'line' as const,
          tooltip: {
            valueDecimals: 2
          }
        }));
        console.log('GraphChart: обновляем chartOptions.series (без экземпляра)', chartSeries);
        this.chartOptions.series = chartSeries;
      } else {
        console.log('GraphChart: очищаем chartOptions.series (без экземпляра)');
        this.chartOptions.series = [];
      }

      this.oneToOneFlag = true;
      this.updateFlag = true;
      return;
    }

    // Если экземпляр доступен, используем его для обновления
    const seriesData = this.chartData();
    console.log('GraphChart: updateChartWithInstance вызван, seriesData:', seriesData);

    if (seriesData && seriesData.length > 0) {
      const chartSeries = seriesData.map(series => ({
        name: `${series.deviceName} - ${series.parameterName}`,
        data: series.data as [number, number][],
        type: 'line' as const,
        tooltip: {
          valueDecimals: 2
        }
      }));
      console.log('GraphChart: обновляем график с сериями через экземпляр', chartSeries);

      this.chartOptions.series = chartSeries;

      this.oneToOneFlag = true;
      this.updateFlag = true;

    } else {
      console.log('GraphChart: очищаем график через экземпляр (нет данных)');
      this.chartOptions.series = [];
      this.oneToOneFlag = true;
      this.updateFlag = true;
    }
  }
}
