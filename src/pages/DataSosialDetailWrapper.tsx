/**
 * Data Sosial Detail Wrapper
 * Wrapper untuk menangani routing parameter dan navigasi
 */

import { useParams, useNavigate } from "react-router-dom";
import DataSosialDetailPage from "./DataSosialDetailPage";
import { typeConfig } from "@/constants/socialData";

export default function DataSosialDetailWrapper() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  // Validate params
  if (!type || !id || !typeConfig[type as keyof typeof typeConfig]) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Invalid Route</h2>
          <p className="text-muted-foreground">Tipe data atau ID tidak valid</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    // Navigate to edit page or trigger edit modal
    navigate(`/data-sosial/${type}?edit=${id}`);
  };

  return (
    <DataSosialDetailPage
      type={type as keyof typeof typeConfig}
      itemId={parseInt(id, 10)}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}
