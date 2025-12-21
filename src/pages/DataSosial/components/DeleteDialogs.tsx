import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { DataSosial } from "../types";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DataSosial | null;
  onConfirm: () => void;
  saving: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  saving,
  title = "Konfirmasi Hapus",
  message,
  buttonText = "Hapus",
}: DeleteDialogProps) {
  const itemName = item?.nama || item?.nama_anak || item?.nama_pemilik || "";
  const defaultMessage = `Apakah Anda yakin ingin menghapus data ${itemName}?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 py-4">
          {message || (
            <>
              Apakah Anda yakin ingin menghapus data <strong>{itemName}</strong>?
            </>
          )}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button onClick={onConfirm} variant="destructive" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteKbDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DataSosial | null;
  onConfirm: () => void;
  saving: boolean;
}

export function DeleteKbDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  saving,
}: DeleteKbDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus Data KB</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 py-4">
          Apakah Anda yakin ingin menghapus data KB untuk{" "}
          <strong>{item?.nama}</strong>?
          <br />
          <span className="text-sm text-gray-500">
            Data KB akan dihapus, tapi data warga tetap ada.
          </span>
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Batal
          </Button>
          <Button onClick={onConfirm} variant="destructive" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Hapus Data KB
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
