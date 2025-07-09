'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
} from 'recharts';
import useSWR from 'swr';

import { ElemType } from '@/types/element';
import { AllResponse } from '@/types/response';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEditorContext } from '@/components/context/editor';

export default function Result() {
  // fetch from api using useSWR
  //result
  const { elemSave } = useEditorContext();
  const path = usePathname();
  const id = path.split('/').pop() || '';
  const fetcher = (url: string) => {
    console.log('Fetching:', url);
    return fetch(url).then(async (res) => {
      const json = await res.json();
      console.log('Result API response:', json);
      return json;
    });
  };
  const { data, error, mutate }: { data: { status: number; data?: AllResponse } | undefined; error: any; mutate: any } = useSWR(
    `/api/result?id=${id}`,
    fetcher,
    { 
      revalidateOnReconnect: true,
      revalidateOnFocus: true,
      refreshInterval: 5000 // 5秒ごとに自動更新
    }
  );

  const summarizeRadio = (correct: number[], data: number[][]) => {
    let result: [{ option: string; count: number; fill: string }] = [] as any;
    data.forEach((answers) => {
      if (!answers || answers.length === 0) return;
      const a = answers[0];
      if (a === undefined || a === null) return;
      const index = result.findIndex((r) => r.option === a.toString());
      if (index !== -1) {
        result[index].count++;
      } else {
        result.push({
          option: a.toString(),
          count: 1,
          fill:
            correct[0] === a ? 'var(--color-correct)' : 'var(--color-wrong)',
        });
      }
    });
    const chartConfig = {
      count: {
        label: 'count',
        color: 'hsl(var(--chart-1))',
      },
      correct: {
        label: 'correct',
        color: 'hsl(var(--chart-1))',
      },
      wrong: {
        label: 'wrong',
        color: 'hsl(var(--chart-2))',
      },
    } satisfies ChartConfig;
    return (
      <ChartContainer className="w-96" config={chartConfig}>
        <BarChart accessibilityLayer data={result}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="option"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={8}>
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  };

  const summarizeMatrix = (correct: number[][], data: [number[][]]) => {
    return correct.map((c, i) => {
      return summarizeRadio(
        c,
        data.map((d) => d[i])
      );
    });
  };

  const summarizeText = (correct: string[], data: string[][]) => {
    return summarizeRadio(
      correct as any as number[],
      data as any as number[][]
    );
  };

  const summarize = (
    type: ElemType,
    correct: number[][] | number[] | string[],
    data: [number[][] | number[] | string[]]
  ) => {
    switch (type) {
      case 'radio':
        return summarizeRadio(
          correct as any as number[],
          data as any as [number[]]
        );
      case 'matrix':
        return summarizeMatrix(
          correct as any as number[][],
          data as any as [number[][]]
        );
      case 'text':
      case 'paragraph':
        return summarizeText(
          correct as any as string[],
          data as any as string[][]
        );
      default:
        return <div>Not implemented</div>;
    }
  };

  type Overview = {
    pointDist: number[];
    possiblePoint: number;
    radar: { [key: string]: number };
    radarMax: { [key: string]: number };
  };
  
  const overviewData = useMemo(() => {
    if (!data?.data?.userIdList || !data?.data?.answersList || !elemSave) return null;
    
    let result: Overview = {
      pointDist: new Array(data.data.userIdList.length).fill(0),
      radar: {},
      radarMax: {},
      possiblePoint: 0,
    };
    
    data.data.answersList.forEach((answer) => {
      let id = answer.id;
      //get corresponding from elemSave
      let question = elemSave?.elements.find((elem) => elem.id === id);
      if (!question) {
        console.error('Question not found with id: ', id);
        return;
      }
      
      if (!answer.correctAnswers || answer.correctAnswers.length === 0) {
        console.error('No correct answers found for question: ', id);
        return;
      }
      
      let average = 0;
      switch (question.type) {
        case 'radio':
          let correct = answer.correctAnswers[0];
          if (correct === undefined || correct === null) break;
          answer.answersList.forEach((answers, i) => {
            if (!answers || answers.length === 0) return;
            let a = answers[0];
            if (a !== undefined && a !== null && a.toString() === correct.toString()) {
              result.pointDist[i] += question.point;
              average += question.point;
            }
          });
          break;
        case 'matrix':
          answer.correctAnswers.forEach((correct, i) => {
            if (correct === undefined || correct === null) return;
            answer.answersList.forEach((answers, j) => {
              if (!answers || answers.length <= i) return;
              let a = answers[i];
              if (a !== undefined && a !== null && a.toString() === correct.toString()) {
                result.pointDist[j] +=
                  question.point / answer.correctAnswers.length;
                average += question.point / answer.correctAnswers.length;
              }
            });
          });
          break;
        case 'text':
        case 'paragraph':
          answer.correctAnswers.forEach((correct, i) => {
            if (correct === undefined || correct === null) return;
            answer.answersList.forEach((answers, j) => {
              if (!answers || answers.length <= i) return;
              let a = answers[i];
              if (a === correct) {
                result.pointDist[j] += question.point;
                average += question.point;
              }
            });
          });
          break;
        default:
          console.error('Not implemented');
      }
      
      if (answer.answersList.length > 0) {
        average /= answer.answersList.length;
      }
      
      question.tags?.forEach((tag) => {
        result.radar[tag] = (result.radar[tag] || 0) + average;
        result.radarMax[tag] = (result.radarMax[tag] || 0) + question.point;
      });
      
      result.possiblePoint += question.point;
    });
    
    return result;
  }, [data, elemSave]);
  const visualizeOverview = (overview?: Overview) => {
    if (!overview) return;
    console.log(overview);
    const average =
      overview.pointDist.reduce((a, b) => a + b, 0) / overview.pointDist.length;
    const sd = Math.sqrt(
      overview.pointDist.reduce((a, b) => a + (b - average) ** 2, 0) /
        overview.pointDist.length
    );
    const n = 10;
    let pointHistogram = new Array(n + 1).fill(0);
    overview.pointDist.forEach((point) => {
      pointHistogram[
        Math.min(Math.floor((point / overview.possiblePoint) * n) + 1, n)
      ]++;
    });
    pointHistogram = pointHistogram.map((count, i) => ({
      point: `${(overview.possiblePoint / n) * i}`,
      count,
    }));
    pointHistogram.reverse();
    const areaConfig = {
      count: {
        label: '人数',
        color: 'hsl(var(--chart-1))',
      },
      // point: {
      //   label: '点数',
      //   color: 'hsl(var(--chart-1))',
      // },
    } satisfies ChartConfig;
    //radar chart
    const radarData = Object.keys(overview.radar).map((key) => ({
      tag: key,
      point: (overview.radar[key] / overview.radarMax[key]) * 100,
    }));
    const radarConfig = {
      point: {
        label: '正解率',
        color: 'hsl(var(--chart-1))',
      },
    } satisfies ChartConfig;
    const possiblePointStep = overview.possiblePoint / n;

    return (
      <div>
        <h2>平均{average}点</h2>
        <h2>標準偏差{sd}</h2>
        <ChartContainer className="w-96" config={areaConfig}>
          <AreaChart
            accessibilityLayer
            data={pointHistogram}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="point"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `${value}点`}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              labelFormatter={(value) =>
                `${value}点-${value - possiblePointStep}点`
              }
            />
            <Area
              type="stepAfter"
              dataKey="count"
              fill="var(--color-point)"
              radius={8}
            />
          </AreaChart>
        </ChartContainer>
        <ChartContainer className="w-96" config={radarConfig}>
          <RadarChart
            data={radarData}
            outerRadius="80%"
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid />
            <PolarAngleAxis dataKey="tag" />
            <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
            <Radar
              dataKey="point"
              stroke="var(--color-point)"
              fill="var(--color-point)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </div>
    );
  };

  const onDownloadExam = () => {
    if (!elemSave) return;
    const json = JSON.stringify(elemSave);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}_exam.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const onDownloadResult = () => {
    if (!data?.data) return;
    const json = JSON.stringify(data.data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}_result.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const onDownloadResultAsCSV = () => {
    if (!data?.data?.answersList || !data?.data?.userIdList) return;
    let res = 'ユーザーID,提出日時,提出ID,';
    let count = 1;
    //Making header
    for (let answer of data.data.answersList) {
      const isMatrix = Array.isArray(answer.correctAnswers) && 
                       answer.correctAnswers.length > 0 && 
                       Array.isArray(answer.correctAnswers[0]);
      console.log(answer.correctAnswers, isMatrix);
      if (!isMatrix) {
        res += count++ + '.' + answer.title + ',';
      } else {
        for (let i = 0; i < answer.correctAnswers.length; i++) {
          res += `${count}.${i}.${answer.title},`;
        }
        count++;
      }
    }
    res += '\n';
    for (let i = 0; i < data.data.userIdList.length; i++) {
      res += data.data.userIdList[i] + ',';
      //convert to local time string
      let dateStr = new Date(data.data.submissionTimeList[i]).toLocaleString();
      //escape
      dateStr = dateStr.replace(/,/g, ' ');
      res += dateStr + ',';
      res += data.data.responseIdList[i] + ',';
      for (let answer of data.data.answersList) {
        const isMatrix = Array.isArray(answer.correctAnswers) && 
                         answer.correctAnswers.length > 0 && 
                         Array.isArray(answer.correctAnswers[0]);
        if (!isMatrix) {
          const value = answer.answersList?.[i]?.[0];
          res += (value !== undefined && value !== null ? value : '') + ',';
        } else {
          //asserting cast to avoid error
          for (let j = 0; j < answer.correctAnswers.length; j++) {
            const value = (answer.answersList?.[i] as any)?.[j]?.[0];
            res += (value !== undefined && value !== null ? value : '') + ',';
          }
        }
      }
      res += '\n';
    }
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]); //UTF-8 BOM
    const blob = new Blob([bom, res], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}_result.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data && !error) {
    return (
      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="flex w-full max-w-screen-sm flex-col gap-8 p-0 md:p-16">
          <p>データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="flex w-full max-w-screen-sm flex-col gap-8 p-0 md:p-16">
          <p>エラーが発生しました: {error.message}</p>
        </div>
      </div>
    );
  }

  // 404の場合（まだ誰も回答していない）
  if (data?.status === 404) {
    return (
      <div className="flex w-full min-w-0 max-w-full justify-center">
        <div className="flex w-full max-w-screen-sm flex-col gap-8 p-0 md:p-16">
          <div className="flex w-full flex-col gap-2">
            <h1 className="scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0">
              {elemSave?.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              まだ回答がありません（試験ID: {id}）
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              回答を提出した場合は、しばらく待ってからページを更新してください。
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button asChild>
              <Link href={`/editor/${id}`}>問題を見る</Link>
            </Button>
            <Button onClick={onDownloadExam} disabled={!elemSave}>
              問題のダウンロード
            </Button>
            <Button disabled>
              回答結果のダウンロード（回答がありません）
            </Button>
            <Button onClick={() => mutate()} variant="outline">
              データを再取得
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 max-w-full justify-center">
      <div className="flex w-full max-w-screen-sm flex-col gap-8 p-0 md:p-16">
        <div className="flex w-full flex-col gap-2">
          <h1 className="scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0">
            {elemSave?.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            回答数: {data?.data?.userIdList?.length || 0}人
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button asChild>
            <Link href={`/editor/${id}`}>問題を見る</Link>
          </Button>
          <Button onClick={onDownloadExam}>問題のダウンロード</Button>
          <Button onClick={onDownloadResultAsCSV}>
            回答結果のダウンロード
          </Button>
        </div>
        {overviewData && visualizeOverview(overviewData)}
        {data?.data?.answersList?.map((question) => {
          return (
            <div key={question.id}>
              <h1 className="text-xl font-bold">{question.title}</h1>
              {summarize(
                question.type,
                question.correctAnswers,
                question.answersList
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
