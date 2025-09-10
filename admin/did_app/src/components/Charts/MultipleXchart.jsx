// "use client";

// import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";

// // Dynamically import to avoid SSR issues
// const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// export default function MultiXAxisLineChart({ rawData }) {

//   if(!rawData || rawData.length === 0) return 
//   console.log(rawData, 'multiplex');
//   const [chartData, setChartData] = useState({ dates: [], counts: [] });
//   useEffect(() => {
//     // This effect runs whenever the rawData prop changes
//     const dates = Object.keys(rawData).sort();
//     const counts = dates.map(date => rawData[date]);
//     setChartData({ dates, counts });
//   }, [rawData]);

//   const option = {
//     // ... (rest of your chart options)
    
//     xAxis: {
//       type: "category",
//       data: chartData.dates // Use your processed date array
//     },
//     yAxis: {
//       type: "value",
//       name: "총 수료증 개수"
//     },
//     series: [
//       {
//         name: "Certificates Issued",
//         type: "line",
//         smooth: true,
//         data: chartData.counts // Use your processed counts array
//       }
//     ]
//   };

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-md">
//       <h2 className="text-lg font-semibold mb-4">총 발급 된 수료증 개수</h2>
//       <ReactECharts option={option} style={{ height: 400 }} />
//     </div>
//   );
// }