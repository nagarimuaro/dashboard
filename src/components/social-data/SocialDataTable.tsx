/**
 * Social Data Table Component
 * Komponen tabel untuk menampilkan data sosial dengan pagination dan aksi
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getStatusColor, typeColumns as columnsByType } from "@/constants/socialData";
import type { DataSosial, PaginationMeta } from "@/types/socialData";

interface SocialDataTableProps {
  type: string;
  data: DataSosial[];
  pagination: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (item: DataSosial) => void;
  onEdit: (item: DataSosial) => void;
  onDelete: (item: DataSosial) => void;
}

export default function SocialDataTable({
  type,
  data,
  pagination,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: SocialDataTableProps) {
  // Get columns for this type
  const columns = columnsByType[type] || [];

  // Format cell value
  const formatCellValue = (item: DataSosial, col: { key: string; label: string }) => {
    const value = item[col.key as keyof DataSosial];
    
    if (col.key === "status") {
      const statusColor = getStatusColor(value as string);
      return (
        <Badge 
          variant="outline"
          style={{ 
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            borderColor: statusColor
          }}
        >
          {value}
        </Badge>
      );
    }
    
    if (col.key === "jenis_kelamin") {
      return value === "L" ? "Laki-laki" : "Perempuan";
    }
    
    if (col.key === "tinggi_badan" || col.key === "berat_badan") {
      return `${value} ${col.key === "tinggi_badan" ? "cm" : "kg"}`;
    }
    
    if (col.key === "pendapatan") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(Number(value) || 0);
    }
    
    return value ?? "-";
  };

  // Pagination controls
  const totalPages = pagination.last_page;
  const currentPage = pagination.current_page;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12 text-center">#</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} className="whitespace-nowrap">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-32 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                    Tidak ada data ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="text-center text-gray-500">
                      {(currentPage - 1) * pagination.per_page + index + 1}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="whitespace-nowrap">
                        {formatCellValue(item, col)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => onView(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(item)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Menampilkan {((currentPage - 1) * pagination.per_page) + 1} -{" "}
            {Math.min(currentPage * pagination.per_page, pagination.total)} dari {pagination.total} data
          </p>
          
          <div className="flex items-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            
            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page Numbers */}
            {getPageNumbers().map((page, idx) => (
              typeof page === "number" ? (
                <Button
                  key={idx}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-2 text-gray-400">...</span>
              )
            ))}
            
            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
