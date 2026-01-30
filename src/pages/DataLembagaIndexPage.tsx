import { useNavigate, useLocation } from "react-router-dom";
import DataLembagaPage from "./DataLembagaPage";

// Config untuk judul berdasarkan tipe
const pageConfig: Record<string, { title: string; description: string }> = {
  "lembaga-keagamaan": {
    title: "Data Lembaga Keagamaan",
    description: "Kelola data masjid, mushola, dan TPQ di Nagari",
  },
  "lembaga-pendidikan": {
    title: "Data Lembaga Pendidikan",
    description: "Kelola data PAUD, SD, SMP, dan SMA di Nagari",
  },
};

export default function DataLembagaIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine type from URL
  const getType = (): "lembaga-keagamaan" | "lembaga-pendidikan" => {
    if (location.pathname.includes("pendidikan")) return "lembaga-pendidikan";
    return "lembaga-keagamaan";
  };

  const currentType = getType();
  const config = pageConfig[currentType];

  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-lembaga/${type}/${itemId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* Content */}
      <DataLembagaPage type={currentType} onViewDetail={handleViewDetail} />
    </div>
  );
}
