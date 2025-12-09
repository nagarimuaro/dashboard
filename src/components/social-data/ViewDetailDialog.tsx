/**
 * View Detail Dialog
 * Dialog untuk melihat detail data sosial dan analisis stunting
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Loader2, Activity, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { getStatusColor, typeColumns as columnsByType } from "@/constants/socialData";
import { calculateStuntingStatus } from "@/utils/stuntingCalculator";
import type { DataSosialGeneric, GrowthHistoryItem, GrowthStatsResponse } from "@/types/socialData";

interface ViewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DataSosialGeneric | null;
  type: string;
  config: { title: string };
  growthHistory: GrowthHistoryItem[];
  growthStats: GrowthStatsResponse | null;
  loadingGrowth: boolean;
}

export default function ViewDetailDialog({
  open,
  onOpenChange,
  item,
  type,
  config,
  growthHistory,
  growthStats,
  loadingGrowth,
}: ViewDetailDialogProps) {
  const [stuntingAnalysis, setStuntingAnalysis] = useState<{ status: string; zscore: number; color: string } | null>(null);

  // Calculate stunting status when item changes
  useEffect(() => {
    const usia = item?.usia_bulan as number | undefined;
    const tinggi = item?.tinggi_badan as number | undefined;
    const jk = item?.jenis_kelamin as string | undefined;
    if (item && type === "stunting" && usia && tinggi && jk) {
      const result = calculateStuntingStatus(
        Number(usia),
        Number(tinggi),
        jk as "L" | "P"
      );
      setStuntingAnalysis(result);
    } else {
      setStuntingAnalysis(null);
    }
  }, [item, type]);

  if (!item) return null;

  // Get columns for display
  const columns = columnsByType[type] || [];

  // Format cell value for detail
  const formatDetailValue = (key: string, value: any) => {
    if (key === "status") {
      const statusColor = getStatusColor(value as string);
      return (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            borderColor: statusColor,
          }}
        >
          {value}
        </Badge>
      );
    }

    if (key === "jenis_kelamin") {
      return value === "L" ? "Laki-laki" : "Perempuan";
    }

    if (key === "tinggi_badan") {
      return `${value} cm`;
    }

    if (key === "berat_badan") {
      return `${value} kg`;
    }

    if (key === "usia") {
      return `${value} bulan`;
    }

    if (key === "pendapatan") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(Number(value) || 0);
    }

    return value ?? "-";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Data {config.title}</DialogTitle>
          <DialogDescription>
            Informasi lengkap untuk {item.nama || item.nama_anak || item.nama_pemilik || '-'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.key} className="space-y-1">
                <p className="text-sm text-gray-500">{col.label}</p>
                <p className="font-medium">
                  {formatDetailValue(col.key, item[col.key])}
                </p>
              </div>
            ))}
          </div>

          {/* Stunting Analysis Section */}
          {type === "stunting" && stuntingAnalysis && (
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Calculator className="w-5 h-5" />
                  Analisis Stunting (Standar WHO)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status Berdasarkan Z-Score TB/U:</p>
                    <p className="text-2xl font-bold" style={{ color: stuntingAnalysis.color }}>
                      {stuntingAnalysis.status}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Z-Score: {stuntingAnalysis.zscore.toFixed(2)} SD
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Usia: {item.usia_bulan} bulan | TB: {item.tinggi_badan} cm | 
                      JK: {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-full"
                    style={{ backgroundColor: `${stuntingAnalysis.color}20` }}
                  >
                    {stuntingAnalysis.status === "Normal" ? (
                      <CheckCircle className="w-10 h-10" style={{ color: stuntingAnalysis.color }} />
                    ) : (
                      <AlertTriangle className="w-10 h-10" style={{ color: stuntingAnalysis.color }} />
                    )}
                  </div>
                </div>

                {/* Z-Score Interpretation */}
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Interpretasi Z-Score:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Normal: Z-Score ≥ -1 SD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Risiko: -2 SD ≤ Z-Score &lt; -1 SD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>Stunting: -3 SD ≤ Z-Score &lt; -2 SD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Stunting Berat: Z-Score &lt; -3 SD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growth History Chart (Stunting only) */}
          {type === "stunting" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-5 h-5" />
                  Riwayat Pertumbuhan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGrowth ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">Memuat riwayat...</span>
                  </div>
                ) : growthHistory.length > 0 ? (
                  <div className="space-y-4">
                    {/* Growth Stats Summary */}
                    {growthStats && growthStats.data && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <p className="text-xs text-gray-500">Pertumbuhan TB</p>
                          <p className="text-lg font-bold text-blue-600">
                            +{(growthStats.data as any).height_growth?.toFixed(1) || 0} cm
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <p className="text-xs text-gray-500">Pertumbuhan BB</p>
                          <p className="text-lg font-bold text-green-600">
                            +{(growthStats.data as any).weight_growth?.toFixed(1) || 0} kg
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <p className="text-xs text-gray-500">Total Pengukuran</p>
                          <p className="text-lg font-bold text-purple-600">
                            {(growthStats.data as any).total_measurements || growthHistory.length}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Growth Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={growthHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="usia_bulan"
                          fontSize={11}
                          label={{ value: "Usia (bulan)", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis
                          yAxisId="left"
                          fontSize={11}
                          label={{ value: "TB (cm)", angle: -90, position: "insideLeft" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          fontSize={11}
                          label={{ value: "BB (kg)", angle: 90, position: "insideRight" }}
                        />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="#666" />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="tinggi_cm"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6" }}
                          name="Tinggi Badan (cm)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="berat_kg"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                          name="Berat Badan (kg)"
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* History Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-2 px-3">Tanggal</th>
                            <th className="text-center py-2 px-3">Usia</th>
                            <th className="text-center py-2 px-3">TB</th>
                            <th className="text-center py-2 px-3">BB</th>
                            <th className="text-center py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {growthHistory.map((record, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-3">{record.tanggal_pengukuran || "-"}</td>
                              <td className="text-center py-2 px-3">{record.usia_bulan} bln</td>
                              <td className="text-center py-2 px-3">{record.tinggi_cm} cm</td>
                              <td className="text-center py-2 px-3">{record.berat_kg} kg</td>
                              <td className="text-center py-2 px-3">
                                <Badge
                                  variant="outline"
                                  style={{
                                    backgroundColor: `${getStatusColor(record.status || "")}20`,
                                    color: getStatusColor(record.status || ""),
                                    borderColor: getStatusColor(record.status || ""),
                                  }}
                                >
                                  {record.status || "-"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada riwayat pertumbuhan
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          {(item.keterangan || item.created_at || item.updated_at) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informasi Tambahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.keterangan && (
                  <div>
                    <p className="text-sm text-gray-500">Keterangan</p>
                    <p className="font-medium">{item.keterangan}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {item.created_at && (
                    <div>
                      <p className="text-gray-500">Dibuat</p>
                      <p>{new Date(String(item.created_at)).toLocaleString("id-ID")}</p>
                    </div>
                  )}
                  {item.updated_at && (
                    <div>
                      <p className="text-gray-500">Diperbarui</p>
                      <p>{new Date(String(item.updated_at)).toLocaleString("id-ID")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
