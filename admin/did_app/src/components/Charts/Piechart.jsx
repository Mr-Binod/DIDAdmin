"use client";

import dynamic from "next/dynamic";

// dynamic import to prevent SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function DonutPieChart({totalCert, totalRequest, issueRequest, revokeRequest}) {
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
            <div className="p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">일일 수료증 가이드</h2>
                <ReactECharts option={option} style={{ height: 400, width: 300 }} />
            </div>
        </div>
    );
}
