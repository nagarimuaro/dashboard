import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Wallet, Home, GraduationCap, Landmark } from "lucide-react";
import DataSosialPage from "./DataSosialPage";

const tabs = [
  {
    id: "kemiskinan",
    label: "Kemiskinan",
    icon: Wallet,
    description: "Data keluarga miskin & bantuan",
    activeClasses: "ring-2 ring-amber-500 bg-amber-50",
    iconActive: "bg-amber-500",
    textActive: "text-amber-700",
  },
  {
    id: "rtlh",
    label: "RTLH",
    icon: Home,
    description: "Rumah tidak layak huni",
    activeClasses: "ring-2 ring-blue-500 bg-blue-50",
    iconActive: "bg-blue-500",
    textActive: "text-blue-700",
  },
  {
    id: "putus-sekolah",
    label: "Putus Sekolah",
    icon: GraduationCap,
    description: "Data anak putus sekolah",
    activeClasses: "ring-2 ring-red-500 bg-red-50",
    iconActive: "bg-red-500",
    textActive: "text-red-700",
  },
];

export default function DataKemiskinanPage() {
  const [activeTab, setActiveTab] = useState("kemiskinan");
  const navigate = useNavigate();

  // Handler untuk navigasi ke halaman detail
  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-sosial/${type}/${itemId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500 rounded-xl">
          <Landmark className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Kemiskinan & Sosial</h1>
          <p className="text-sm text-gray-500">Pengelolaan data sosial ekonomi masyarakat</p>
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
        <TabsContent value="kemiskinan" className="mt-0">
          <DataSosialPage type="kemiskinan" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="rtlh" className="mt-0">
          <DataSosialPage type="rtlh" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
        <TabsContent value="putus-sekolah" className="mt-0">
          <DataSosialPage type="putus-sekolah" embedded onViewDetail={handleViewDetail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
