import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingUp,
  Users,
  Target,
  Award,
  Medal,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { kaderPerformanceService, LeaderboardEntry, PerformanceStatistics } from '@/services/kaderTugasService';
import kelompokKaderService, { KelompokKader } from '@/services/kelompokKaderService';

export default function KaderPerformance() {
  // State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statistics, setStatistics] = useState<PerformanceStatistics | null>(null);
  const [kelompokList, setKelompokList] = useState<KelompokKader[]>([]);
  const [selectedKelompok, setSelectedKelompok] = useState<number | null>(null);
  const [kelompokLeaderboard, setKelompokLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Period filter
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await kaderPerformanceService.getLeaderboard({
        tahun: selectedYear,
        bulan: selectedMonth,
        limit: 20
      });
      if (response.success) {
        setLeaderboard(response.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await kaderPerformanceService.getStatistics({
        tahun: selectedYear,
        bulan: selectedMonth
      });
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch kelompok list
  const fetchKelompokList = useCallback(async () => {
    try {
      const response = await kelompokKaderService.getAll({ per_page: 100 });
      if (response.success) {
        setKelompokList(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch kelompok list:', err);
    }
  }, []);

  // Fetch kelompok leaderboard
  const fetchKelompokLeaderboard = useCallback(async (kelompokId: number) => {
    try {
      const response = await kaderPerformanceService.getKelompokLeaderboard(kelompokId, {
        tahun: selectedYear,
        bulan: selectedMonth
      });
      if (response.success) {
        setKelompokLeaderboard(response.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch kelompok leaderboard:', err);
    }
  }, [selectedYear, selectedMonth]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLeaderboard(), fetchStatistics(), fetchKelompokList()])
      .finally(() => setLoading(false));
  }, [fetchLeaderboard, fetchStatistics, fetchKelompokList]);

  // Load kelompok leaderboard when selected
  useEffect(() => {
    if (selectedKelompok) {
      fetchKelompokLeaderboard(selectedKelompok);
    }
  }, [selectedKelompok, fetchKelompokLeaderboard]);

  // Handle recalculate
  const handleRecalculate = async () => {
    try {
      setLoading(true);
      await kaderPerformanceService.recalculate();
      await Promise.all([fetchLeaderboard(), fetchStatistics()]);
    } catch (err) {
      console.error('Failed to recalculate:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get grade badge
  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'E': 'bg-red-100 text-red-800 border-red-300',
    };
    return (
      <Badge className={`${colors[grade] || 'bg-gray-100'} border font-bold`}>
        {grade}
      </Badge>
    );
  };

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-center font-bold text-gray-500">{rank}</span>;
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performa Kader</h1>
          <p className="text-gray-500">Pantau performa dan pencapaian kader</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculate} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Hitung Ulang
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Periode:</span>
            </div>
            <Select value={selectedMonth.toString()} onValueChange={(v: string) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v: string) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Kader</p>
                  <p className="text-2xl font-bold">{statistics.total_kader}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rata-rata Skor</p>
                  <p className={`text-2xl font-bold ${getScoreColor(statistics.average_score)}`}>
                    {statistics.average_score.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Data Dibuat</p>
                  <p className="text-2xl font-bold">{statistics.total_data_created}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Data Diupdate</p>
                  <p className="text-2xl font-bold">{statistics.total_data_updated}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Distribution */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Distribusi Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {['A', 'B', 'C', 'D', 'E'].map((grade) => {
                const count = statistics.grade_distribution[grade] || 0;
                const percentage = statistics.total_kader > 0 
                  ? Math.round((count / statistics.total_kader) * 100) 
                  : 0;
                return (
                  <div key={grade} className="text-center">
                    <div className="mb-2">{getGradeBadge(grade)}</div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                    <Progress value={percentage} className="mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard Global
          </TabsTrigger>
          <TabsTrigger value="kelompok">
            <Users className="w-4 h-4 mr-2" />
            Per Kelompok
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top 20 Kader
              </CardTitle>
              <CardDescription>
                Peringkat kader dengan skor tertinggi bulan ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada data performa untuk periode ini</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Peringkat</TableHead>
                      <TableHead>Nama Kader</TableHead>
                      <TableHead className="text-center">Nilai</TableHead>
                      <TableHead className="text-center">Skor</TableHead>
                      <TableHead className="text-right">Data Dibuat</TableHead>
                      <TableHead className="text-right">Data Diupdate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => (
                      <TableRow 
                        key={entry.kader_id}
                        className={entry.rank <= 3 ? 'bg-yellow-50/50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.kader_nama}
                        </TableCell>
                        <TableCell className="text-center">
                          {getGradeBadge(entry.grade)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getScoreColor(entry.score)}`}>
                            {entry.score.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.total_created}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.total_updated}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kelompok">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Leaderboard Kelompok
              </CardTitle>
              <CardDescription>
                <Select 
                  value={selectedKelompok?.toString() || ''} 
                  onValueChange={(v: string) => setSelectedKelompok(parseInt(v))}
                >
                  <SelectTrigger className="w-[250px] mt-2">
                    <SelectValue placeholder="Pilih kelompok..." />
                  </SelectTrigger>
                  <SelectContent>
                    {kelompokList.map((kelompok) => (
                      <SelectItem key={kelompok.id} value={kelompok.id.toString()}>
                        {kelompok.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedKelompok ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Pilih kelompok untuk melihat leaderboard</p>
                </div>
              ) : kelompokLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada data performa untuk kelompok ini</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Peringkat</TableHead>
                      <TableHead>Nama Kader</TableHead>
                      <TableHead className="text-center">Nilai</TableHead>
                      <TableHead className="text-center">Skor</TableHead>
                      <TableHead className="text-right">Data Dibuat</TableHead>
                      <TableHead className="text-right">Data Diupdate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kelompokLeaderboard.map((entry) => (
                      <TableRow 
                        key={entry.kader_id}
                        className={entry.rank <= 3 ? 'bg-yellow-50/50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.kader_nama}
                        </TableCell>
                        <TableCell className="text-center">
                          {getGradeBadge(entry.grade)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getScoreColor(entry.score)}`}>
                            {entry.score.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.total_created}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.total_updated}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
