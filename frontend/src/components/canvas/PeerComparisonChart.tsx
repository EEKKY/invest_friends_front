import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PeerComparison } from "@/services/investment-analysis";
import { Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface PeerComparisonChartProps {
  peerComparison: PeerComparison;
  currentMetrics: {
    per: number;
    pbr: number;
    roe: number;
    dividendYield?: number;
  };
  companyName: string;
}

export const PeerComparisonChart: React.FC<PeerComparisonChartProps> = ({
  peerComparison,
  currentMetrics,
  companyName,
}) => {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  // Prepare data for bar chart (competitors comparison)
  const competitorsBarData = {
    labels: [companyName, ...peerComparison.competitors.map((c) => c.name)],
    datasets: [
      {
        label: "PER",
        data: [
          currentMetrics.per,
          ...peerComparison.competitors.map((c) => c.per),
        ],
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 2,
      },
      {
        label: "PBR",
        data: [
          currentMetrics.pbr,
          ...peerComparison.competitors.map((c) => c.pbr),
        ],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
      {
        label: "ROE (%)",
        data: [
          currentMetrics.roe,
          ...peerComparison.competitors.map((c) => c.roe),
        ],
        backgroundColor: "rgba(251, 191, 36, 0.5)",
        borderColor: "rgb(251, 191, 36)",
        borderWidth: 2,
      },
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "경쟁사 비교",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Normalize data for radar chart - convert to percentage of industry average
  const normalizeToPercent = (value: number, average: number) => {
    if (average === 0) return 0;
    return (value / average) * 100;
  };

  // Prepare data for radar chart (vs industry average)
  const radarData = {
    labels: ["PER", "PBR", "ROE (%)", "배당수익률 (%)"],
    datasets: [
      {
        label: companyName,
        data: [
          normalizeToPercent(
            currentMetrics.per,
            peerComparison.industryAverages.per
          ),
          normalizeToPercent(
            currentMetrics.pbr,
            peerComparison.industryAverages.pbr
          ),
          normalizeToPercent(
            currentMetrics.roe,
            peerComparison.industryAverages.roe
          ),
          normalizeToPercent(
            currentMetrics.dividendYield || 0,
            peerComparison.industryAverages.dividendYield || 1
          ),
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "업종 평균",
        data: [
          peerComparison.industryAverages.per, // Industry average is always 100%
          peerComparison.industryAverages.pbr,
          peerComparison.industryAverages.roe,
          peerComparison.industryAverages.dividendYield,
        ],
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(156, 163, 175, 0.2)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const radarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "업종 평균 대비 (100% = 업종 평균)",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.r;
            const dataIndex = context.dataIndex;
            const labels = ["PER", "PBR", "ROE", "배당수익률"];

            // Get actual values
            let actualValue = "";
            if (context.datasetIndex === 0) {
              // Company data
              const actuals = [
                currentMetrics.per,
                currentMetrics.pbr,
                currentMetrics.roe,
                currentMetrics.dividendYield || 0,
              ];
              actualValue = actuals[dataIndex].toFixed(2);
            } else {
              // Industry average
              const averages = [
                peerComparison.industryAverages.per,
                peerComparison.industryAverages.pbr,
                peerComparison.industryAverages.roe,
                peerComparison.industryAverages.dividendYield,
              ];
              actualValue = averages[dataIndex].toFixed(2);
            }

            if (dataIndex >= 2) {
              // ROE and dividend yield
              actualValue += "%";
            }

            return `${label} - ${
              labels[dataIndex]
            }: ${actualValue} (${value.toFixed(1)}%)`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 200, // 200% of industry average
        ticks: {
          display: true,
          font: {
            size: 12,
          },
          backdropColor: "rgba(255, 255, 255, 0.8)",
          stepSize: 50,
          callback: function (value: any) {
            return value + "%";
          },
        },
        pointLabels: {
          font: {
            size: 15,
            weight: "600",
          },
          padding: 20,
          color: "rgba(0, 0, 0, 0.8)",
        },
        grid: {
          circular: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(2)}조원`;
    } else if (value >= 100000000) {
      return `${(value / 100000000).toFixed(0)}억원`;
    }
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            동종업계 비교
            {peerComparison.competitors &&
              peerComparison.competitors.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({peerComparison.competitors.map((c) => c.name).join(", ")})
                </span>
              )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("chart")}
            >
              차트
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              테이블
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ranking Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                시가총액 순위
              </span>
            </div>
            <div className="text-2xl font-bold">
              {peerComparison.ranking.byMarketCap} /{" "}
              {peerComparison.ranking.totalCompanies}
            </div>
            {peerComparison.ranking.byMarketCap <= 3 && (
              <Badge variant="default" className="mt-1">
                상위권
              </Badge>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">매출액 순위</span>
            </div>
            <div className="text-2xl font-bold">
              {peerComparison.ranking.byRevenue} /{" "}
              {peerComparison.ranking.totalCompanies}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">수익성 순위</span>
            </div>
            <div className="text-2xl font-bold">
              {peerComparison.ranking.byProfit} /{" "}
              {peerComparison.ranking.totalCompanies}
            </div>
          </div>
        </div>

        {/* Charts */}
        {viewMode === "chart" && (
          <div className="space-y-6">
            {/* Metrics Comparison Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-muted-foreground mb-2">PER</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">현재</span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentMetrics.per.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">업종 평균</span>
                    <span className="text-sm text-gray-600">
                      {peerComparison.industryAverages.per.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className={`text-xs font-medium ${
                      currentMetrics.per < peerComparison.industryAverages.per 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {currentMetrics.per < peerComparison.industryAverages.per ? '▼' : '▲'} 
                      {' '}{Math.abs(((currentMetrics.per - peerComparison.industryAverages.per) / peerComparison.industryAverages.per * 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-muted-foreground mb-2">PBR</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">현재</span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentMetrics.pbr.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">업종 평균</span>
                    <span className="text-sm text-gray-600">
                      {peerComparison.industryAverages.pbr.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className={`text-xs font-medium ${
                      currentMetrics.pbr < peerComparison.industryAverages.pbr 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {currentMetrics.pbr < peerComparison.industryAverages.pbr ? '▼' : '▲'} 
                      {' '}{Math.abs(((currentMetrics.pbr - peerComparison.industryAverages.pbr) / peerComparison.industryAverages.pbr * 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-muted-foreground mb-2">ROE (%)</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">현재</span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentMetrics.roe.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">업종 평균</span>
                    <span className="text-sm text-gray-600">
                      {peerComparison.industryAverages.roe.toFixed(2)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className={`text-xs font-medium ${
                      currentMetrics.roe > peerComparison.industryAverages.roe 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {currentMetrics.roe > peerComparison.industryAverages.roe ? '▲' : '▼'} 
                      {' '}{Math.abs(((currentMetrics.roe - peerComparison.industryAverages.roe) / peerComparison.industryAverages.roe * 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-muted-foreground mb-2">배당수익률 (%)</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">현재</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(currentMetrics.dividendYield || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">업종 평균</span>
                    <span className="text-sm text-gray-600">
                      {(peerComparison.industryAverages.dividendYield || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className={`text-xs font-medium ${
                      (currentMetrics.dividendYield || 0) > (peerComparison.industryAverages.dividendYield || 0)
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(currentMetrics.dividendYield || 0) > (peerComparison.industryAverages.dividendYield || 0) ? '▲' : '▼'} 
                      {' '}{peerComparison.industryAverages.dividendYield ? 
                        Math.abs((((currentMetrics.dividendYield || 0) - peerComparison.industryAverages.dividendYield) / peerComparison.industryAverages.dividendYield * 100)).toFixed(1) 
                        : '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart for Competitors */}
            <div className="w-full h-[500px] border rounded-lg p-6 bg-gray-50">
              <Bar data={competitorsBarData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Competitors Table */}
        {viewMode === "table" && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2">
              <h4 className="font-medium">주요 경쟁사 상세</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-sm font-medium">
                      기업명
                    </th>
                    <th className="text-right p-3 text-sm font-medium">
                      시가총액
                    </th>
                    <th className="text-right p-3 text-sm font-medium">PER</th>
                    <th className="text-right p-3 text-sm font-medium">PBR</th>
                    <th className="text-right p-3 text-sm font-medium">
                      ROE (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-blue-50 font-semibold">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{companyName}</span>
                        <Badge variant="default" className="text-xs">
                          현재
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right p-3">-</td>
                    <td className="text-right p-3">
                      {currentMetrics.per.toFixed(2)}
                    </td>
                    <td className="text-right p-3">
                      {currentMetrics.pbr.toFixed(2)}
                    </td>
                    <td className="text-right p-3">
                      {currentMetrics.roe.toFixed(2)}
                    </td>
                  </tr>
                  {peerComparison.competitors.map((competitor, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span>{competitor.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {competitor.stockCode}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right p-3">
                        {formatMarketCap(competitor.marketCap)}
                      </td>
                      <td className="text-right p-3">
                        {competitor.per.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        {competitor.pbr.toFixed(2)}
                      </td>
                      <td className="text-right p-3">
                        {competitor.roe.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-medium">
                    <td className="p-3">업종 평균</td>
                    <td className="text-right p-3">-</td>
                    <td className="text-right p-3">
                      {peerComparison.industryAverages.per.toFixed(2)}
                    </td>
                    <td className="text-right p-3">
                      {peerComparison.industryAverages.pbr.toFixed(2)}
                    </td>
                    <td className="text-right p-3">
                      {peerComparison.industryAverages.roe.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
