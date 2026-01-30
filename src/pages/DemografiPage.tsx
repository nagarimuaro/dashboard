import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Baby, Heart, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import newModulesService from "@/services/newModulesService";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface KategoriItem {
  label: string;
  count: number;
}

interface DemografiResponse {
  total_penduduk: number;
  by_gender: {
    laki_laki: number;
    perempuan: number;
  };
  kategori_usia: Record<string, KategoriItem>;
  kategori_khusus: Record<string, KategoriItem>;
  filter: {
    jorong: string | null;
  };
}

interface JorongData {
  jorong: string;
  total: number;
  laki_laki: number;
  perempuan: number;
  lansia: number;
  balita: number;
  usia_sekolah: number;
  usia_produktif: number;
  pus: number;
}

export default function DemografiPage() {
  const [loading, setLoading] = useState(true);
  const [demografi, setDemografi] = useState<DemografiResponse | null>(null);
  const [byJorong, setByJorong] = useState<JorongData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [demografiRes, jorongRes] = await Promise.all([
        newModulesService.getDemografi(),
        newModulesService.getDemografiByJorong(),
      ]);
      setDemografi(demografiRes as unknown as DemografiResponse);
      setByJorong(jorongRes as unknown as JorongData[]);
    } catch (error: any) {
      console.error('Failed to load demografi data:', error);
      toast.error(error.message || 'Gagal memuat data demografi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!demografi) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Data tidak tersedia</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform data for charts
  const genderData = [
    { name: 'Laki-laki', value: demografi.by_gender?.laki_laki || 0, color: '#3b82f6' },
    { name: 'Perempuan', value: demografi.by_gender?.perempuan || 0, color: '#ec4899' },
  ];

  const totalByGender = (demografi.by_gender?.laki_laki || 0) + (demografi.by_gender?.perempuan || 0);

  // Transform kategori_usia for chart
  const kategoriUsiaData = demografi.kategori_usia 
    ? Object.entries(demografi.kategori_usia).map(([key, item]) => ({
        name: item.label || key,
        value: item.count || 0,
      }))
    : [];

  // Transform kategori_khusus for chart
  const kategoriKhususData = demografi.kategori_khusus
    ? Object.entries(demografi.kategori_khusus).map(([key, item]) => ({
        name: item.label || key,
        value: item.count || 0,
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Demografi Penduduk</h1>
        <p className="text-muted-foreground">Statistik dan distribusi penduduk Nagari</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penduduk</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demografi.total_penduduk?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">jiwa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.by_gender?.laki_laki || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalByGender > 0 ? ((demografi.by_gender?.laki_laki || 0) / totalByGender * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
            <UserX className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.by_gender?.perempuan || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalByGender > 0 ? ((demografi.by_gender?.perempuan || 0) / totalByGender * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balita</CardTitle>
            <Baby className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.kategori_usia?.balita?.count || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">0-59 bulan</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lansia</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.kategori_usia?.lansia?.count || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">60+ tahun</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usia Sekolah</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.kategori_usia?.usia_sekolah?.count || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">6-17 tahun</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usia Produktif</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.kategori_usia?.usia_produktif?.count || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">18-59 tahun</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ibu Hamil</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(demografi.kategori_khusus?.ibu_hamil?.count || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">saat ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Jenis Kelamin</CardTitle>
            <CardDescription>Perbandingan penduduk laki-laki dan perempuan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By Jorong */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Per Jorong</CardTitle>
            <CardDescription>Jumlah penduduk setiap jorong</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byJorong}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jorong" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="laki_laki" fill="#3b82f6" name="Laki-laki" stackId="a" />
                <Bar dataKey="perempuan" fill="#ec4899" name="Perempuan" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Kategori Usia */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Usia</CardTitle>
            <CardDescription>Distribusi penduduk berdasarkan kelompok umur</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={kategoriUsiaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kategori Khusus */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Khusus</CardTitle>
            <CardDescription>WUS, PUS, Ibu Hamil, dll</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={kategoriKhususData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Jorong Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Per Jorong</CardTitle>
          <CardDescription>Breakdown data demografi setiap jorong</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Jorong</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Laki-laki</th>
                  <th className="text-right p-2">Perempuan</th>
                  <th className="text-right p-2">Balita</th>
                  <th className="text-right p-2">Usia Sekolah</th>
                  <th className="text-right p-2">Produktif</th>
                  <th className="text-right p-2">Lansia</th>
                  <th className="text-right p-2">PUS</th>
                </tr>
              </thead>
              <tbody>
                {byJorong.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.jorong}</td>
                    <td className="text-right p-2">{item.total?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.laki_laki?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.perempuan?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.balita?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.usia_sekolah?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.usia_produktif?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.lansia?.toLocaleString()}</td>
                    <td className="text-right p-2">{item.pus?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
