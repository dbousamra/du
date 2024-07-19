import { Box, Button, Flex, Heading, HStack, Spacer, Stack, Text } from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/tauri';
import type { EChartsOption, SunburstSeriesOption } from 'echarts';
import EChartsReact from 'echarts-for-react';
import prettyBytes from 'pretty-bytes';
import React from 'react';
import { ECharts } from './components/ECharts';

const SLATE_700 = 'rgb(51 65 85)';
const SLATE_800 = 'rgb(30 41 59)';

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
      dir: '/Users/dbousamra/Code/Misc/tauri-du/du',
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

  return (
    <Stack w="full" h="full" rounded="xl" bg="transparent">
      <Box pos="absolute" zIndex={10000} top={0} h={8} w="full" data-tauri-drag-region />
      <Flex w="full" h="full">
        <Stack w="full" h="full" bg="rgb(31,41,55)" flexShrink={1} pt={8}>
          <Heading ml={8} mt={8} alignSelf="start" size="2xl" color="white" textAlign="center">
            {data?.[0]?.name}
          </Heading>
          <ECharts
            ref={ref}
            onChartReady={(instance) => {
              instance.on('mouseover', (params: any) => {
                setHovered(params.data);
              });
            }}
            options={options}
          />
        </Stack>
        <Stack h="full" w="420px" flexShrink={0} bg="rgb(71, 85, 105, 0.2)" p={4}>
          <Button size="lg" w="full" onClick={() => walkDirs()}>
            SCAN
          </Button>
          <Stack color="white" opacity={1}>
            {(hovered?.children ?? []).slice(0, 10).map((child) => (
              <HStack>
                <Text fontWeight="semibold" w="2xs">
                  {getLastItem(child.name)}
                </Text>
                <Spacer />
                <Text>{prettyBytes(child.value ?? 0)}</Text>
              </HStack>
            ))}
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};
