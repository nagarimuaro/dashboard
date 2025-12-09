/**
 * Social Data Form Dialog
 * Dialog untuk menambah atau mengedit data sosial
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";

// Import all form components
import KemiskinanForm from "./forms/KemiskinanForm";
import StuntingForm from "./forms/StuntingForm";
import DisabilitasForm from "./forms/DisabilitasForm";
import KbForm from "./forms/KbForm";
import RtlhForm from "./forms/RtlhForm";
import PutusSekolahForm from "./forms/PutusSekolahForm";

interface SocialDataFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  config: { title: string; statusOptions: string[] };
  isEditing: boolean;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  jorongList: string[];
  rtList: string[];
  rwList: string[];
  loading: boolean;
  onSubmit: () => void;
}

export default function SocialDataFormDialog({
  open,
  onOpenChange,
  type,
  config,
  isEditing,
  formData,
  setFormData,
  jorongList,
  rtList,
  rwList,
  loading,
  onSubmit,
}: SocialDataFormDialogProps) {
  // Render form based on type
  const renderForm = () => {
    const commonProps = {
      formData,
      setFormData: setFormData as any,
      jorongList,
      rtList,
      rwList,
      statusOptions: config.statusOptions,
    };

    switch (type) {
      case "kemiskinan":
        return <KemiskinanForm {...commonProps} />;
      case "stunting":
        return <StuntingForm {...commonProps} />;
      case "disabilitas":
        return <DisabilitasForm {...commonProps} />;
      case "rtlh":
        return <RtlhForm {...commonProps} />;
      case "kb":
        return <KbForm {...commonProps} />;
      case "putus-sekolah":
        return <PutusSekolahForm {...commonProps} />;
      default:
        return <div className="text-center py-8 text-gray-500">Form tidak tersedia</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Tambah"} Data {config.title}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Ubah data ${config.title.toLowerCase()} yang sudah ada.`
              : `Tambahkan data ${config.title.toLowerCase()} baru ke dalam sistem.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderForm()}</div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Perbarui" : "Simpan"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
