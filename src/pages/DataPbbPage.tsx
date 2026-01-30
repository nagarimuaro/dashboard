import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DataPbbPageProps {
  onViewDetail?: (type: string, itemId: number) => void;
}

export default function DataPbbPage({ onViewDetail }: DataPbbPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pajak Bumi & Bangunan (PBB)</CardTitle>
        <div className="flex gap-4 items-center mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data PBB
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Halaman data PBB akan segera tersedia</p>
          <p className="text-sm mt-2">API sudah siap, UI dalam pengembangan</p>
        </div>
      </CardContent>
    </Card>
  );
}
