import type { EChartsOption } from 'echarts';
import type EChartsReact from 'echarts-for-react';
import type { EChartsInstance } from 'echarts-for-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { SunburstChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TimelineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { forwardRef } from 'react';

echarts.use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SunburstChart,
  TimelineComponent,
  LegendComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  DatasetComponent,
  MarkLineComponent,
]);

interface Props {
  options: EChartsOption;
  onChartReady: (instance: EChartsInstance) => void;
}

export const ECharts = forwardRef<EChartsReact, Props>((props, ref) => {
  const { options, onChartReady } = props;

  return (
    <ReactEChartsCore
      ref={ref}
      echarts={echarts}
      notMerge={true}
      lazyUpdate={true}
      option={options}
      onChartReady={onChartReady}
      style={{ width: '100%', height: '100%' }}
    />
  );
});
