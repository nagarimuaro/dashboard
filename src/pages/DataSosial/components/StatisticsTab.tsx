import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Baby,
  AlertTriangle,
  Activity,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { STATUS_COLORS, CHART_COLORS } from "@/constants/socialData";
import type { StatisticsData, DataSosial } from "../types";

interface StatisticsTabProps {
  type: string;
  statistics: StatisticsData;
  jorongList: string[];
  filteredData: DataSosial[];
  config: { statusOptions: string[] };
}

export function StatisticsTab({
  type,
  statistics,
  jorongList,
  filteredData,
  config,
}: StatisticsTabProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {type === 'stunting' ? <Baby className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <p className="text-xs text-gray-500">{type === 'stunting' ? 'Total Balita' : 'Total Data'}</p>
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
        {type === 'stunting' && statistics.warningCount !== undefined ? (
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Stunting Ringan</p>
                <p className="text-xl font-bold text-orange-600">{statistics.warningCount}</p>
              </div>
            </div>
          </Card>
        ) : (
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
        )}
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{type === 'stunting' ? 'Normal' : 'Jorong Aktif'}</p>
              <p className="text-xl font-bold text-green-600">
                {type === 'stunting' 
                  ? statistics.statusDistribution.find(s => s.name === 'Normal')?.value || 0 
                  : jorongList.length}
              </p>
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
        {/* Year Trend Line Chart - hide for balita */}
        {type !== 'stunting' && (
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
        )}
        
        {/* Age Distribution for Balita */}
        {type === 'stunting' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Baby className="w-4 h-4" />
                Distribusi Usia Balita
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(() => {
                  const ageGroups = [
                    { range: '0-6 bln', min: 0, max: 6, count: 0 },
                    { range: '7-12 bln', min: 7, max: 12, count: 0 },
                    { range: '13-24 bln', min: 13, max: 24, count: 0 },
                    { range: '25-36 bln', min: 25, max: 36, count: 0 },
                    { range: '37-48 bln', min: 37, max: 48, count: 0 },
                    { range: '49-59 bln', min: 49, max: 59, count: 0 },
                  ];
                  filteredData.forEach(item => {
                    const usia = item.usia_bulan as number || 0;
                    const group = ageGroups.find(g => usia >= g.min && usia <= g.max);
                    if (group) group.count++;
                  });
                  return ageGroups.map(g => ({ name: g.range, value: g.count }));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" name="Jumlah" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Status by Jorong Stacked Bar */}
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
                {(statistics.statusOptions || config.statusOptions).map((status: string, idx: number) => {
                  const balitaColors: Record<string, string> = {
                    'Normal': '#22c55e',
                    'Stunting Ringan': '#f97316',
                    'Stunting Berat': '#ef4444',
                    'Belum Diukur': '#9ca3af'
                  };
                  return (
                    <Bar 
                      key={status} 
                      dataKey={status} 
                      stackId="a" 
                      fill={statistics.isBalitaType ? (balitaColors[status] || CHART_COLORS[idx % CHART_COLORS.length]) : (STATUS_COLORS[status] || CHART_COLORS[idx % CHART_COLORS.length])} 
                    />
                  );
                })}
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
    </div>
  );
}
