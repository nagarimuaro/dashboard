import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DataTernakPageProps {
  onViewDetail?: (type: string, itemId: number) => void;
}

export default function DataTernakPage({ onViewDetail }: DataTernakPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Peternakan</CardTitle>
        <div className="flex gap-4 items-center mt-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data Ternak
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Halaman data peternakan akan segera tersedia</p>
          <p className="text-sm mt-2">API sudah siap, UI dalam pengembangan</p>
        </div>
      </CardContent>
    </Card>
  );
}
