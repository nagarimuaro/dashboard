/**
 * Social Data Detail Dialog
 * Dialog untuk menampilkan detail lengkap data sosial berdasarkan tipe
 */

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Home,
  Heart,
  Baby,
  Accessibility,
  GraduationCap,
  DollarSign,
  CheckCircle,
  XCircle,
  Printer,
} from "lucide-react";
import { getStatusColor, detailFieldsConfig, STATUS_COLORS } from "@/constants/socialData";
import type { DataSosialGeneric } from "@/types/socialData";

interface SocialDataDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DataSosialGeneric | null;
  type: string;
  config: { title: string };
}

// Get icon for section
const getSectionIcon = (section: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Data Utama": <User className="w-4 h-4" />,
    "Data Anak": <Baby className="w-4 h-4" />,
    "Data Orang Tua": <User className="w-4 h-4" />,
    "Data Peserta": <User className="w-4 h-4" />,
    "Data Penyandang": <Accessibility className="w-4 h-4" />,
    "Data Pemilik": <Home className="w-4 h-4" />,
    "Status Kemiskinan": <DollarSign className="w-4 h-4" />,
    "Status": <FileText className="w-4 h-4" />,
    "Data Pengukuran": <FileText className="w-4 h-4" />,
    "Bantuan yang Diterima": <Heart className="w-4 h-4" />,
    "Bantuan": <Heart className="w-4 h-4" />,
    "Data KB": <Heart className="w-4 h-4" />,
    "Data Kehamilan": <Baby className="w-4 h-4" />,
    "Jenis Disabilitas": <Accessibility className="w-4 h-4" />,
    "Pendidikan & Pekerjaan": <GraduationCap className="w-4 h-4" />,
    "Data Pendidikan": <GraduationCap className="w-4 h-4" />,
    "Kondisi Rumah": <Home className="w-4 h-4" />,
    "Fasilitas": <Home className="w-4 h-4" />,
    "Program Perbaikan": <CheckCircle className="w-4 h-4" />,
    "Intervensi": <Heart className="w-4 h-4" />,
    "Metadata": <Calendar className="w-4 h-4" />,
  };
  return icons[section] || <FileText className="w-4 h-4" />;
};

// Format value based on type
const formatValue = (
  value: any,
  type?: string
): React.ReactNode => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400 italic">-</span>;
  }

  switch (type) {
    case "date":
      try {
        return new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {
        return value;
      }

    case "currency":
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(value) || 0);

    case "boolean":
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          Ya
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-600">
          <XCircle className="w-4 h-4" />
          Tidak
        </span>
      );

    case "badge":
      const colorClass = getStatusColor(String(value));
      const hexColor = STATUS_COLORS[String(value)] || "#6b7280";
      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${hexColor}20`,
            color: hexColor,
            borderColor: hexColor,
          }}
        >
          {value}
        </Badge>
      );

    case "array":
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        );
      }
      return <span className="text-gray-400 italic">-</span>;

    case "number":
      if (typeof value === "number") {
        return value.toLocaleString("id-ID");
      }
      return value;

    default:
      // Handle jenis_kelamin
      if (value === "L") return "Laki-laki";
      if (value === "P") return "Perempuan";
      return String(value);
  }
};

export default function SocialDataDetailDialog({
  open,
  onOpenChange,
  item,
  type,
  config,
}: SocialDataDetailDialogProps) {
  // Get field configuration for this type
  const fields = detailFieldsConfig[type] || [];

  // Group fields by section
  const groupedFields = useMemo(() => {
    const groups: Record<string, typeof fields> = {};
    fields.forEach((field) => {
      const section = field.section || "Lainnya";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });
    return groups;
  }, [fields]);

  // Get display name for the item
  const getDisplayName = () => {
    if (!item) return "";
    return item.nama || item.nama_anak || item.nama_pemilik || "Data";
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">Detail {config.title}</span>
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap untuk <strong>{getDisplayName()}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge Header */}
          {item.status && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  {formatValue(item.status, "badge")}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tahun Data</p>
                <p className="text-lg font-semibold">{item.tahun_data}</p>
              </div>
            </div>
          )}

          {/* Grouped Fields */}
          {Object.entries(groupedFields).map(([section, sectionFields]) => (
            <Card key={section}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {getSectionIcon(section)}
                  {section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionFields.map((field) => {
                    const value = item[field.key];
                    // Skip status and tahun_data if they're in header
                    if (field.key === "status" && section !== "Status" && section !== "Status Kemiskinan") {
                      return null;
                    }
                    
                    return (
                      <div key={field.key} className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {field.label}
                        </p>
                        <div className="font-medium text-sm">
                          {formatValue(value, field.type)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Timestamps */}
          {(item.created_at || item.updated_at) && (
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
              {item.created_at && (
                <span>
                  Dibuat: {new Date(String(item.created_at)).toLocaleString("id-ID")}
                </span>
              )}
              {item.updated_at && (
                <span>
                  Diperbarui: {new Date(String(item.updated_at)).toLocaleString("id-ID")}
                </span>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="mr-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
