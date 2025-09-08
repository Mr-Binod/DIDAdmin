"use client";

import dynamic from "next/dynamic";

// dynamic import to prevent SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function DonutPieChart() {
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
                padAngle: 5,
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
                    { value: 1048, name: "Search Engine" },
                    { value: 735, name: "Direct" },
                    { value: 580, name: "Email" },
                    { value: 484, name: "Union Ads" },
                    { value: 300, name: "Video Ads" }
                ]
            }
        ]
    };

    return (
        <div className=" flex justify-center items-center ">
            <div className="p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">Donut Pie Chart</h2>
                <ReactECharts option={option} style={{ height: 400, width: 300 }} />
            </div>
        </div>
    );
}
