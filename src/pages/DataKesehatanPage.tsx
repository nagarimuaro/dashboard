import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Baby, Pill, Accessibility, Heart, HeartPulse, Syringe, Stethoscope, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DataSosialPage from "./DataSosialPage";
import { KaderKehamilan, KaderImunisasi, KaderPersalinan } from "@/components/kader";
import posyanduService from "@/services/posyanduService";

const tabs = [
  {
    id: "stunting",
    label: "Balita",
    icon: Baby,
    description: "Pertumbuhan anak 0-59 bulan",
    activeClasses: "ring-2 ring-orange-500 bg-orange-50",
    iconActive: "bg-orange-500",
    textActive: "text-orange-700",
  },
  {
    id: "kb",
    label: "Keluarga Berencana",
    icon: Pill,
    description: "Program KB aktif",
    activeClasses: "ring-2 ring-pink-500 bg-pink-50",
    iconActive: "bg-pink-500",
    textActive: "text-pink-700",
  },
  {
    id: "disabilitas",
    label: "Disabilitas",
    icon: Accessibility,
    description: "Data penyandang disabilitas",
    activeClasses: "ring-2 ring-purple-500 bg-purple-50",
    iconActive: "bg-purple-500",
    textActive: "text-purple-700",
  },
  {
    id: "kehamilan",
    label: "Kehamilan",
    icon: HeartPulse,
    description: "Data ibu hamil",
    activeClasses: "ring-2 ring-rose-500 bg-rose-50",
    iconActive: "bg-rose-500",
    textActive: "text-rose-700",
  },
  {
    id: "imunisasi",
    label: "Imunisasi",
    icon: Syringe,
    description: "Data imunisasi anak",
    activeClasses: "ring-2 ring-teal-500 bg-teal-50",
    iconActive: "bg-teal-500",
    textActive: "text-teal-700",
  },
  {
    id: "persalinan",
    label: "Persalinan",
    icon: Stethoscope,
    description: "Data persalinan",
    activeClasses: "ring-2 ring-indigo-500 bg-indigo-50",
    iconActive: "bg-indigo-500",
    textActive: "text-indigo-700",
  },
];

export default function DataKesehatanPage() {
  const [activeTab, setActiveTab] = useState("stunting");
  const navigate = useNavigate();
  
  // Export Format 3 state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());
  const [exportPosyandu, setExportPosyandu] = useState("semua");
  const [posyanduList, setPosyanduList] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [loadingPosyandu, setLoadingPosyandu] = useState(false);

  // Load posyandu list when dialog opens
  useEffect(() => {
    if (exportDialogOpen && posyanduList.length === 0) {
      loadPosyanduList();
    }
  }, [exportDialogOpen]);

  const loadPosyanduList = async () => {
    setLoadingPosyandu(true);
    try {
      const list = await posyanduService.getPosyanduList();
      setPosyanduList(list);
    } catch (error) {
      console.error('Failed to load posyandu list:', error);
    } finally {
      setLoadingPosyandu(false);
    }
  };

  // Handler untuk navigasi ke halaman detail
  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-sosial/${type}/${itemId}`);
  };

  // Export Format 3 to PDF
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const params: { tahun: number; posyandu?: string } = {
        tahun: parseInt(exportYear),
      };
      if (exportPosyandu !== "semua") {
        params.posyandu = exportPosyandu;
      }
      
      const blob = await posyanduService.exportFormat3ToPdf(params);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Format3_Posyandu_${exportYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export PDF Format 3 berhasil!');
      setExportDialogOpen(false);
    } catch (error: any) {
      console.error('Export PDF failed:', error);
      toast.error(error.message || 'Gagal export PDF');
    } finally {
      setExporting(false);
    }
  };

  // Export Format 3 to Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params: { tahun: number; posyandu?: string } = {
        tahun: parseInt(exportYear),
      };
      if (exportPosyandu !== "semua") {
        params.posyandu = exportPosyandu;
      }
      
      const blob = await posyanduService.exportFormat3ToExcel(params);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Format3_Posyandu_${exportYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export Excel Format 3 berhasil!');
      setExportDialogOpen(false);
    } catch (error: any) {
      console.error('Export Excel failed:', error);
      toast.error(error.message || 'Gagal export Excel');
    } finally {
      setExporting(false);
    }
  };

  // Generate year options (current year - 5 to current year)
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Kesehatan</h1>
            <p className="text-sm text-gray-500">Monitoring kesehatan masyarakat nagari</p>
          </div>
        </div>
        
        {/* Export Format 3 Button */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              Export Format 3
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Export Format 3 Posyandu</DialogTitle>
              <DialogDescription>
                Export laporan bulanan kegiatan posyandu sesuai format resmi (Isian Data Kegiatan Posyandu)
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Tahun
                </Label>
                <Select value={exportYear} onValueChange={setExportYear}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="posyandu" className="text-right">
                  Posyandu
                </Label>
                <Select value={exportPosyandu} onValueChange={setExportPosyandu}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih posyandu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Posyandu</SelectItem>
                    {loadingPosyandu ? (
                      <SelectItem value="_loading" disabled>
                        Memuat...
                      </SelectItem>
                    ) : (
                      posyanduList.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={exporting}
                className="gap-2"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Excel
              </Button>
              <Button
                onClick={handleExportPdf}
                disabled={exporting}
                className="gap-2"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <Card
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                cursor-pointer p-4 transition-all duration-200
                ${isActive ? tab.activeClasses : "hover:bg-gray-50"}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isActive ? tab.iconActive : "bg-gray-100"}`}>
                  <TabIcon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className={`font-medium ${isActive ? tab.textActive : "text-gray-700"}`}>{tab.label}</p>
                  <p className="text-xs text-gray-400">{tab.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="stunting" className="mt-0">
          <DataSosialPage type="stunting" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="kb" className="mt-0">
          <DataSosialPage type="kb" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="disabilitas" className="mt-0">
          <DataSosialPage type="disabilitas" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="kehamilan" className="mt-0">
          <KaderKehamilan userRole="admin_nagari" embedded />
        </TabsContent>
        <TabsContent value="imunisasi" className="mt-0">
          <KaderImunisasi userRole="admin_nagari" embedded />
        </TabsContent>
        <TabsContent value="persalinan" className="mt-0">
          <KaderPersalinan userRole="admin_nagari" embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
