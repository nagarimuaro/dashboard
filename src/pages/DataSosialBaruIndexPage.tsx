import { useNavigate, useLocation } from "react-router-dom";
import DataSosialBaruPage from "./DataSosialBaruPage";

// Config untuk judul berdasarkan tipe
const pageConfig: Record<string, { title: string; description: string }> = {
  "pola-asuh": {
    title: "Data Pola Asuh & Gizi",
    description: "Kelola data pola asuh dan gizi anak di Nagari",
  },
  infrastruktur: {
    title: "Data Infrastruktur Rumah",
    description: "Kelola data kondisi rumah dan sanitasi di Nagari",
  },
  "yatim-piatu": {
    title: "Data Yatim Piatu",
    description: "Kelola data anak yatim dan piatu di Nagari",
  },
};

export default function DataSosialBaruIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine type from URL
  const getType = (): "pola-asuh" | "infrastruktur" | "yatim-piatu" => {
    if (location.pathname.includes("infrastruktur")) return "infrastruktur";
    if (location.pathname.includes("yatim-piatu")) return "yatim-piatu";
    return "pola-asuh";
  };

  const currentType = getType();
  const config = pageConfig[currentType];

  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-sosial-baru/${type}/${itemId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* Content */}
      <DataSosialBaruPage type={currentType} onViewDetail={handleViewDetail} />
    </div>
  );
}
