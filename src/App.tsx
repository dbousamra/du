import { Box, Button, Heading, HStack, Spacer, Stack, Text } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/tauri';
import type { EChartsOption, SunburstSeriesOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import prettyBytes from 'pretty-bytes';
import React from 'react';
import { ECharts } from './components/ECharts';

const randomColor = (() => {
  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return () => {
    var h = randomInt(0, 360);
    var s = randomInt(42, 98);
    var l = randomInt(40, 90);
    return `hsl(${h},${s}%,${l}%)`;
  };
})();

const getLastItem = (path: string) => {
  return path.substring(path.lastIndexOf('/') + 1);
};

type Node = {
  path: string;
  absolute_path: string;
  size: number;
  children: Node[];
};

type SunburstData = {
  name: string;
  value?: number;
  itemStyle?: {
    color?: string;
  };
  children?: SunburstData[];
};

type ChartData = NonNullable<SunburstSeriesOption['data']>;

const convertNodeToSunburstData = (node: Node): SunburstData => {
  return {
    name: node.absolute_path,
    value: node.size,
    itemStyle: {
      color: randomColor(),
    },
    children: node.children.filter((n) => n.size > 1000000).map(convertNodeToSunburstData),
  };
};

export const App = () => {
  const ref = React.useRef<EChartsReact>(null);
  const [data, setData] = React.useState<ChartData>([]);
  const [hovered, setHovered] = React.useState<SunburstData | null>(null);

  const walkDirs = async () => {
    const res: Node = await invoke('walk_dirs', {
      dir: '/Users/dbousamra/Code/Misc/tauri-du/tauri-app',
    });

    const transformed = convertNodeToSunburstData(res);

    setData([transformed]);
  };

  const options: EChartsOption = {
    series: {
      type: 'sunburst',
      data: data,
      radius: [60, '90%'],
      itemStyle: {
        borderRadius: 7,
        borderWidth: 2,
      },
      label: {
        show: false,
      },
    },
  };

  console.log(hovered);

  return (
    <Stack p={8} spaceY={8} h="full">
      <HStack p={4} h="full">
        <ECharts
          ref={ref}
          onChartReady={(instance) => {
            instance.on('mouseover', (params: any) => {
              setHovered(params.data);
            });
          }}
          options={options}
        />
        <Stack h="full" w="400px" flexShrink={0}>
          {hovered && (
            <Stack>
              <HStack>
                <Heading>{getLastItem(hovered.name)}</Heading>
                <Spacer />
                <Heading>{prettyBytes(hovered.value ?? 0)}</Heading>
              </HStack>
              <Stack>
                {(hovered.children ?? []).slice(0, 10).map((child) => (
                  <HStack>
                    <Text>{getLastItem(child.name)}</Text>
                    <Spacer />
                    <Text>{prettyBytes(child.value ?? 0)}</Text>
                  </HStack>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </HStack>

      <Box w="full">
        <Button size="lg" w="full" onClick={() => walkDirs()}>
          SCAN
        </Button>
      </Box>
    </Stack>
  );
};
