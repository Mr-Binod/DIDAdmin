"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// dynamic import to prevent SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function DonutPieChart({totalCert, totalRequest, issueRequest, revokeRequest}) {
    const option = {
        tooltip: {
            trigger: "item"
        },
        legend: {
            top: "5%",
            left: "center"
        },
        series: [
            {
                name: "Access From",
                type: "pie",
                radius: ["40%", "70%"], // donut style
                avoidLabelOverlap: false,
                padAngle: 2,
                itemStyle: {
                    borderRadius: 10
                },
                label: {
                    show: false,
                    position: "center"
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: "bold"
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: totalCert, name: "전체 발급" },
                    { value: totalRequest, name: "전체 요청" },
                    { value: issueRequest, name: "발급 요청" },
                    { value: revokeRequest, name: "폐기 요청" },
                ]
            }
        ]
    };

    return (
        <div className=" flex justify-center items-center ">
            <div className="p-6 bg-darkergray rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">일일 수료증 가이드</h2>
                <ReactECharts option={option} style={{ height: 300, width: 400 }} />
            </div>
        </div>
    );
}


export function MultiXAxisLineChart({ rawData, title }) {

  if (!rawData || Object.keys(rawData).length === 0) return null;
  console.log(rawData, 'multiplex');
  const [chartData, setChartData] = useState({ dates: [], counts: [] });
  useEffect(() => {
    // This effect runs whenever the rawData prop changes
    const dates = Object.keys(rawData).sort();
    const counts = dates.map(date => rawData[date]);
    console.log(dates, 'dates', counts, 'counts');
    setChartData({ dates, counts });
  }, [rawData]);

  const option = {
    // ... (rest of your chart options)
    
    xAxis: {
      type: "category",
      data: chartData.dates // Use your processed date array
    },
    yAxis: {
      type: "value",
      name: "총 수료증 개수"
    },
    series: [
      {
        name: "Certificates Issued",
        type: "line",
        smooth: true,
        data: chartData.counts // Use your processed counts array
      }
    ]
  };

  return (
    <div className="p-6 bg-darkergray rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
}