/**
 * Social Data Statistics Tab
 * Komponen untuk menampilkan statistik data sosial
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  AlertTriangle,
  Activity,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calculator,
} from "lucide-react";
import { STATUS_COLORS, CHART_COLORS, tahunList } from "@/constants/socialData";
import { calculateStuntingStatus } from "@/utils/stuntingCalculator";
import type { DataSosialGeneric, StatisticsData } from "@/types/socialData";

interface StatisticsTabProps {
  type: string;
  config: { title: string; statusOptions: string[] };
  data: DataSosialGeneric[];
  jorongList: string[];
  paginationTotal: number;
}

export default function StatisticsTab({ 
  type, 
  config, 
  data, 
  jorongList, 
  paginationTotal 
}: StatisticsTabProps) {
  // Stunting calculator state
  const [calcUsia, setCalcUsia] = useState<number>(12);
  const [calcTinggi, setCalcTinggi] = useState<number>(75);
  const [calcJenisKelamin, setCalcJenisKelamin] = useState<"L" | "P">("L");
  const [calcResult, setCalcResult] = useState<{ status: string; zscore: number; color: string } | null>(null);

  // Statistics calculations
  const statistics = useMemo<StatisticsData>(() => {
    // Status distribution
    const statusCounts: Record<string, number> = {};
    config.statusOptions.forEach(s => { statusCounts[s] = 0; });
    data.forEach(item => {
      const itemStatus = item.status as string;
      if (itemStatus && statusCounts[itemStatus] !== undefined) {
        statusCounts[itemStatus]++;
      }
    });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#6b7280"
    }));

    // Jorong distribution
    const jorongCounts: Record<string, number> = {};
    jorongList.forEach(j => { jorongCounts[j] = 0; });
    data.forEach(item => {
      const itemJorong = item.jorong as string;
      if (itemJorong && jorongCounts[itemJorong] !== undefined) {
        jorongCounts[itemJorong]++;
      }
    });
    const jorongDistribution = Object.entries(jorongCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Year trend
    const yearCounts: Record<number, number> = {};
    tahunList.forEach(t => { yearCounts[t] = 0; });
    data.forEach(item => {
      if (yearCounts[item.tahun_data] !== undefined) {
        yearCounts[item.tahun_data]++;
      }
    });
    const yearTrend = Object.entries(yearCounts)
      .map(([year, count]) => ({ tahun: parseInt(year), jumlah: count }))
      .sort((a, b) => a.tahun - b.tahun);

    // Status by jorong
    const statusByJorong = jorongList.map(jorong => {
      const jorongData: Record<string, any> = { jorong };
      config.statusOptions.forEach(status => {
        jorongData[status] = data.filter(d => d.jorong === jorong && (d.status as string) === status).length;
      });
      return jorongData;
    });

    // Total summary
    const total = paginationTotal || data.length;
    const criticalStatus = config.statusOptions[0];
    const criticalCount = statusCounts[criticalStatus] || 0;
    const criticalPercentage = total > 0 ? ((criticalCount / total) * 100).toFixed(1) : "0";

    return {
      statusDistribution,
      jorongDistribution,
      yearTrend,
      statusByJorong,
      total,
      criticalCount,
      criticalPercentage,
      criticalStatus
    };
  }, [data, config.statusOptions, jorongList, paginationTotal]);

  const handleCalculateStunting = () => {
    const result = calculateStuntingStatus(calcUsia, calcTinggi, calcJenisKelamin);
    setCalcResult(result);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Data</p>
              <p className="text-xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{statistics.criticalStatus}</p>
              <p className="text-xl font-bold text-red-600">{statistics.criticalCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Persentase Kritis</p>
              <p className="text-xl font-bold text-orange-600">{statistics.criticalPercentage}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jorong Aktif</p>
              <p className="text-xl font-bold text-green-600">{jorongList.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="w-4 h-4" />
              Distribusi Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statistics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statistics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jorong Distribution Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Distribusi per Jorong
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.jorongDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Jumlah" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Year Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4" />
              Tren per Tahun
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={statistics.yearTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tahun" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="jumlah" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                  name="Jumlah Data"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status by Jorong */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Status per Jorong
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.statusByJorong}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jorong" fontSize={10} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                {config.statusOptions.map((status, idx) => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    stackId="a" 
                    fill={STATUS_COLORS[status] || CHART_COLORS[idx % CHART_COLORS.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ringkasan Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-center">Persentase</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.statusDistribution.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.value}</TableCell>
                    <TableCell className="text-center">
                      {statistics.total > 0 ? ((item.value / statistics.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${statistics.total > 0 ? (item.value / statistics.total) * 100 : 0}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stunting Calculator */}
      {type === "stunting" && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calculator className="w-5 h-5" />
              Kalkulator Stunting
            </CardTitle>
            <CardDescription>
              Hitung status stunting berdasarkan standar WHO (TB/U)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Usia (bulan)</Label>
                <Input
                  type="number"
                  value={calcUsia}
                  onChange={(e) => setCalcUsia(parseInt(e.target.value) || 0)}
                  placeholder="Usia dalam bulan"
                  min={0}
                  max={60}
                />
              </div>
              <div className="space-y-2">
                <Label>Tinggi Badan (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={calcTinggi}
                  onChange={(e) => setCalcTinggi(parseFloat(e.target.value) || 0)}
                  placeholder="Tinggi badan"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={calcJenisKelamin} onValueChange={(v: "L" | "P") => setCalcJenisKelamin(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleCalculateStunting} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Hitung
                </Button>
              </div>
            </div>
            
            {calcResult && (
              <div 
                className="p-4 rounded-lg border-2 mt-4"
                style={{ 
                  backgroundColor: `${calcResult.color}10`,
                  borderColor: calcResult.color 
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hasil Perhitungan:</p>
                    <p className="text-2xl font-bold" style={{ color: calcResult.color }}>
                      {calcResult.status}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Z-Score: {calcResult.zscore.toFixed(2)} SD
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-full"
                    style={{ backgroundColor: `${calcResult.color}20` }}
                  >
                    {calcResult.status === "Normal" ? (
                      <CheckCircle className="w-10 h-10" style={{ color: calcResult.color }} />
                    ) : (
                      <AlertTriangle className="w-10 h-10" style={{ color: calcResult.color }} />
                    )}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium mb-1">Interpretasi Z-Score:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li className="text-green-600">Normal: Z-Score ≥ -1 SD</li>
                    <li className="text-yellow-600">Risiko Stunting: -2 SD ≤ Z-Score &lt; -1 SD</li>
                    <li className="text-orange-600">Stunting Ringan: -3 SD ≤ Z-Score &lt; -2 SD</li>
                    <li className="text-red-600">Stunting Berat: Z-Score &lt; -3 SD</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
