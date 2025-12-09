import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Baby, Pill, Accessibility, Heart } from "lucide-react";
import DataSosialPage from "./DataSosialPage";

const tabs = [
  {
    id: "stunting",
    label: "Stunting",
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
];

export default function DataKesehatanPage() {
  const [activeTab, setActiveTab] = useState("stunting");
  const navigate = useNavigate();

  // Handler untuk navigasi ke halaman detail
  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-sosial/${type}/${itemId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-500 rounded-xl">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Kesehatan</h1>
          <p className="text-sm text-gray-500">Monitoring kesehatan masyarakat nagari</p>
        </div>
      </div>

      {/* Tab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </Tabs>
    </div>
  );
}
