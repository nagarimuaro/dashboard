import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { 
  Map as MapIcon, 
  Layers, 
  Search, 
  MapPin, 
  Home, 
  Users, 
  Filter,
  Eye,
  EyeOff,
  Maximize2,
  Download
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

interface GISMapProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function GISMap({ userRole }: GISMapProps) {
  const [activeLayer, setActiveLayer] = useState("batas-wilayah")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchLocation, setSearchLocation] = useState("")
  
  // Mock data untuk layer controls
  const mapLayers = [
    {
      id: "batas-wilayah",
      name: "Batas Wilayah",
      description: "Batas administratif nagari",
      visible: true,
      color: "#1E40AF"
    },
    {
      id: "rt-rw",
      name: "RT/RW",
      description: "Pembagian RT dan RW",
      visible: true,
      color: "#059669"
    },
    {
      id: "population",
      name: "Kepadatan Penduduk",
      description: "Heat map jumlah penduduk",
      visible: false,
      color: "#F59E0B"
    },
    {
      id: "infrastructure",
      name: "Infrastruktur",
      description: "Jalan, jembatan, fasilitas umum",
      visible: false,
      color: "#6B7280"
    },
    {
      id: "land-use",
      name: "Penggunaan Lahan",
      description: "Perumahan, pertanian, industri",
      visible: false,
      color: "#8B5CF6"
    }
  ]

  // Mock data untuk lokasi penting
  const importantLocations = [
    {
      id: 1,
      name: "Balai Nagari",
      type: "Kantor Pemerintahan",
      coordinates: "0.9471° S, 100.4172° E",
      population: 0,
      description: "Pusat pemerintahan nagari"
    },
    {
      id: 2,
      name: "Jorong Koto Baru",
      type: "Permukiman",
      coordinates: "0.9461° S, 100.4162° E", 
      population: 1247,
      description: "Jorong dengan kepadatan tertinggi"
    },
    {
      id: 3,
      name: "Jorong Koto Lama",
      type: "Permukiman",
      coordinates: "0.9481° S, 100.4182° E",
      population: 983,
      description: "Jorong tradisional"
    },
    {
      id: 4,
      name: "Jorong Ladang Padi",
      type: "Pertanian",
      coordinates: "0.9451° S, 100.4142° E",
      population: 617,
      description: "Area persawahan utama"
    }
  ]

  // Mock statistik wilayah
  const wilayahStats = {
    totalLuas: "45.7 km²",
    jumlahJorong: 4,
    jumlahRT: 24,
    jumlahRW: 8,
    titikKoordinat: "0.9471° S, 100.4172° E",
    ketinggian: "780-1.200 mdpl"
  }

  const MapPlaceholder = () => (
    <div className="w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
      
      {/* Mock map content */}
      <div className="relative z-10 text-center">
        <MapIcon className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Peta Digital Nagari</h3>
        <p className="text-sm text-gray-500 mb-4">React-Leaflet Integration</p>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Batas Nagari</span>
          <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
          <span className="text-xs text-gray-600">RT/RW</span>
          <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
          <span className="text-xs text-gray-600">Kepadatan</span>
        </div>
      </div>
      
      {/* Mock locations */}
      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
      <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
      <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="w-8 h-8 p-0">+</Button>
        <Button size="sm" variant="secondary" className="w-8 h-8 p-0">-</Button>
        <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Sistem Informasi Geografis (GIS)</h1>
          <p className="text-muted-foreground">Peta digital dan analisis spasial nagari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Peta
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? "Keluar" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cari Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  placeholder="Cari alamat, jorong..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jorong" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koto-baru">Jorong Koto Baru</SelectItem>
                    <SelectItem value="koto-lama">Jorong Koto Lama</SelectItem>
                    <SelectItem value="ladang-padi">Jorong Ladang Padi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Layer Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layer Peta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mapLayers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <div>
                        <Label className="text-sm font-medium">{layer.name}</Label>
                        <p className="text-xs text-muted-foreground">{layer.description}</p>
                      </div>
                    </div>
                    <Switch checked={layer.visible} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistik Wilayah */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Info Wilayah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Luas Total:</span>
                  <span className="font-medium">{wilayahStats.totalLuas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah Jorong:</span>
                  <span className="font-medium">{wilayahStats.jumlahJorong}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total RT:</span>
                  <span className="font-medium">{wilayahStats.jumlahRT}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total RW:</span>
                  <span className="font-medium">{wilayahStats.jumlahRW}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ketinggian:</span>
                  <span className="font-medium">{wilayahStats.ketinggian}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Map */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <MapPlaceholder />
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lokasi Penting</CardTitle>
              <CardDescription>
                Daftar lokasi dan informasi demografi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {importantLocations.map((location) => (
                  <div key={location.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{location.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.coordinates}
                          </div>
                          {location.population > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {location.population.toLocaleString()} jiwa
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {location.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}