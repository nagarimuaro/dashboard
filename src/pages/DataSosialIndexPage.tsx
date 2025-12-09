import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Baby,
  Pill,
  Accessibility,
  Wallet,
  Home,
  GraduationCap,
  Heart,
  TrendingUp,
  Users,
  ArrowRight,
  Activity,
  BarChart3,
} from "lucide-react";

// Kategori Data Sosial
const categories = [
  {
    id: "kesehatan",
    title: "Data Kesehatan",
    description: "Monitoring kesehatan masyarakat meliputi stunting, KB, dan disabilitas",
    icon: Heart,
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-600",
    url: "/data-sosial/kesehatan",
    items: [
      {
        id: "stunting",
        title: "Data Stunting",
        description: "Pemantauan pertumbuhan anak usia 0-59 bulan dengan standar WHO",
        icon: Baby,
        features: ["Analisis WHO LMS", "Z-Score Calculator", "Grafik Pertumbuhan"],
      },
      {
        id: "kb",
        title: "Data KB",
        description: "Peserta program Keluarga Berencana di nagari",
        icon: Pill,
        features: ["Jenis Kontrasepsi", "Riwayat KB", "Jadwal Kontrol"],
      },
      {
        id: "disabilitas",
        title: "Data Disabilitas",
        description: "Pendataan penyandang disabilitas untuk program bantuan",
        icon: Accessibility,
        features: ["Jenis Disabilitas", "Kebutuhan Bantuan", "Status Bantuan"],
      },
    ],
  },
  {
    id: "kemiskinan",
    title: "Data Kemiskinan & Sosial Ekonomi",
    description: "Pendataan kondisi sosial ekonomi untuk program penanggulangan kemiskinan",
    icon: Wallet,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    url: "/data-sosial/kemiskinan",
    items: [
      {
        id: "kemiskinan",
        title: "Data Kemiskinan",
        description: "Keluarga penerima bantuan sosial dan program kemiskinan",
        icon: Wallet,
        features: ["DTKS", "Bansos", "PKH", "BLT"],
      },
      {
        id: "rtlh",
        title: "Rumah Tidak Layak Huni",
        description: "Pendataan rumah tidak layak huni untuk program rehabilitasi",
        icon: Home,
        features: ["Kondisi Rumah", "Status Lahan", "Prioritas Rehab"],
      },
      {
        id: "putus-sekolah",
        title: "Putus Sekolah",
        description: "Pendataan anak putus sekolah untuk program beasiswa",
        icon: GraduationCap,
        features: ["Jenjang Pendidikan", "Alasan Putus", "Program Bantuan"],
      },
    ],
  },
];

export default function DataSosialIndexPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500" />
            Data Sosial
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola dan pantau data kesehatan serta kondisi sosial ekonomi masyarakat
          </p>
        </div>
        <Button
          onClick={() => navigate("/statistik-sosial")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Lihat Statistik & Analisis
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-red-500 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">3</p>
              <p className="text-sm text-red-600">Data Kesehatan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">3</p>
              <p className="text-sm text-blue-600">Data Sosial Ekonomi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">6</p>
              <p className="text-sm text-green-600">Total Kategori</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">WHO</p>
              <p className="text-sm text-purple-600">Standar Analisis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <Card
          key={category.id}
          className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300"
          onClick={() => navigate(category.url)}
        >
          <CardHeader>
            {/* Category Header */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${category.lightColor} ${category.borderColor} border mb-4`}>
              <div className={`p-3 ${category.color} rounded-lg`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${category.textColor}`}>{category.title}</h2>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
            </div>

            {/* Sub Items Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg ${category.lightColor} ${category.borderColor} border`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`w-5 h-5 ${category.textColor}`} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className={`w-full ${category.color} hover:opacity-90`}
            >
              Buka {category.title}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Bottom CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Lihat Analisis Lengkap</h3>
            <p className="text-blue-100 mt-1">
              Statistik, grafik, dan laporan komprehensif dari semua data sosial
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/statistik-sosial")}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Buka Statistik
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
