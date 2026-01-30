import { useNavigate, useLocation } from "react-router-dom";
import DataTernakPage from "./DataTernakPage";
import DataPbbPage from "./DataPbbPage";

// Config untuk judul berdasarkan tipe
const pageConfig: Record<string, { title: string; description: string }> = {
  ternak: {
    title: "Data Peternakan",
    description: "Kelola data ternak dan peternak di Nagari",
  },
  pbb: {
    title: "Data Pajak Bumi & Bangunan",
    description: "Kelola data PBB dan pembayaran di Nagari",
  },
};

export default function DataEkonomiIndexPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine type from URL
  const getType = (): "ternak" | "pbb" => {
    if (location.pathname.includes("pbb")) return "pbb";
    return "ternak";
  };

  const currentType = getType();
  const config = pageConfig[currentType];

  const handleViewDetail = (type: string, itemId: number) => {
    navigate(`/data-ekonomi/${type}/${itemId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* Content */}
      {currentType === "ternak" ? (
        <DataTernakPage onViewDetail={handleViewDetail} />
      ) : (
        <DataPbbPage onViewDetail={handleViewDetail} />
      )}
    </div>
  );
}
