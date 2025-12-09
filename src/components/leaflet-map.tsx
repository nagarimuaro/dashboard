import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { 
  Map as MapIcon, 
  Layers, 
  Search, 
  MapPin, 
  Home, 
  Users, 
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  Navigation,
  Satellite,
  TreePine,
  Building2,
  Route
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface LeafletMapProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function LeafletMap({ userRole }: LeafletMapProps) {
  const [activeLayer, setActiveLayer] = useState("batas-wilayah")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'street'>('street')

  // Mock data untuk layer controls
  const mapLayers = [
    {
      id: "batas-wilayah",
      name: "Batas Wilayah Nagari",
      description: "Batas administratif nagari",
      visible: true,
      color: "#1E40AF",
      icon: MapPin
    },
    {
      id: "rt-rw",
      name: "Batas RT/RW",
      description: "Pembagian RT dan RW",
      visible: true,
      color: "#059669",
      icon: Home
    },
    {
      id: "population-density",
      name: "Kepadatan Penduduk",
      description: "Heat map jumlah penduduk per area",
      visible: false,
      color: "#F59E0B",
      icon: Users
    },
    {
      id: "infrastructure",
      name: "Infrastruktur",
      description: "Jalan, jembatan, fasilitas umum",
      visible: true,
      color: "#6B7280",
      icon: Route
    },
    {
      id: "land-use",
      name: "Tata Guna Lahan",
      description: "Perumahan, pertanian, industri",
      visible: false,
      color: "#8B5CF6",
      icon: TreePine
    },
    {
      id: "public-facilities",
      name: "Fasilitas Umum",
      description: "Sekolah, puskesmas, masjid, dll",
      visible: true,
      color: "#DC2626",
      icon: Building2
    }
  ]

  // Mock data untuk lokasi penting dengan koordinat yang lebih realistis
  const importantLocations = [
    {
      id: 1,
      name: "Balai Nagari Koto Baru",
      type: "Pemerintahan",
      coordinates: [-0.9471, 100.4172],
      population: 0,
      description: "Pusat pemerintahan dan pelayanan masyarakat",
      facilities: ["Kantor Wali Nagari", "Ruang Pelayanan", "Aula Pertemuan"],
      address: "Jorong Koto Baru, RT 01/RW 01"
    },
    {
      id: 2,
      name: "Jorong Koto Baru",
      type: "Permukiman",
      coordinates: [-0.9461, 100.4162],
      population: 1247,
      description: "Permukiman dengan kepadatan tertinggi",
      facilities: ["Posyandu", "PAUD", "Masjid Al-Ikhlas"],
      address: "Koto Baru, RT 01-08/RW 01-02"
    },
    {
      id: 3,
      name: "Jorong Koto Lama",
      type: "Permukiman",
      coordinates: [-0.9481, 100.4182],
      population: 983,
      description: "Permukiman tradisional dengan bangunan bersejarah",
      facilities: ["SD Negeri 01", "Masjid Nurul Iman", "Balai Adat"],
      address: "Koto Lama, RT 01-06/RW 01-02"
    },
    {
      id: 4,
      name: "Jorong Ladang Padi",
      type: "Pertanian",
      coordinates: [-0.9451, 100.4142],
      population: 617,
      description: "Area persawahan dan pertanian utama",
      facilities: ["Irigasi Teknis", "Gudang Gabah", "Pos Pertanian"],
      address: "Ladang Padi, RT 01-04/RW 01"
    },
    {
      id: 5,
      name: "Puskesmas Koto Baru",
      type: "Kesehatan",
      coordinates: [-0.9465, 100.4175],
      population: 0,
      description: "Pusat pelayanan kesehatan masyarakat",
      facilities: ["Rawat Jalan", "UGD", "Laboratorium", "Apotek"],
      address: "Jl. Nagari Koto Baru"
    },
    {
      id: 6,
      name: "SMP Negeri 1 Koto Baru",
      type: "Pendidikan",
      coordinates: [-0.9475, 100.4165],
      population: 0,
      description: "Sekolah menengah pertama negeri",
      facilities: ["12 Ruang Kelas", "Laboratorium", "Perpustakaan", "Lapangan"],
      address: "Jl. Pendidikan No. 15"
    }
  ]

  // Mock data statistik wilayah yang lebih lengkap
  const wilayahStats = {
    totalLuas: "45.7 km²",
    luasPermukiman: "8.2 km²",
    luasPertanian: "28.5 km²",
    luasHutan: "9.0 km²",
    jumlahJorong: 4,
    jumlahRT: 24,
    jumlahRW: 8,
    titikKoordinat: "0°56'50\" S, 100°25'02\" E",
    ketinggian: "780-1.200 mdpl",
    totalPenduduk: 2847,
    kepadatanPenduduk: "62 jiwa/km²"
  }

  // Simulasi Leaflet Map dengan styling yang lebih realistis
  const LeafletMapSimulation = () => {
    const [selectedMarker, setSelectedMarker] = useState<any>(null)

    return (
      <div className="w-full h-[500px] bg-gradient-to-br from-green-100 via-blue-100 to-green-200 rounded-lg border relative overflow-hidden">
        {/* Background terrain pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="terrain" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#22c55e" opacity="0.3"/>
                <circle cx="10" cy="10" r="0.5" fill="#16a34a" opacity="0.5"/>
                <circle cx="30" cy="30" r="0.5" fill="#16a34a" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#terrain)"/>
          </svg>
        </div>

        {/* Rivers/waterways */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 50 400 Q 200 350 350 300 Q 500 250 650 200 Q 800 150 950 100"
            stroke="#3b82f6"
            strokeWidth="4"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 100 450 Q 300 400 500 350 Q 700 300 900 250"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Roads */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 0 250 L 1000 250"
            stroke="#71717a"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
            strokeDasharray="5,5"
          />
          <path
            d="M 300 0 L 300 500"
            stroke="#71717a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
            strokeDasharray="3,3"
          />
          <path
            d="M 600 100 L 600 400"
            stroke="#71717a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
            strokeDasharray="3,3"
          />
        </svg>

        {/* Area boundaries (RT/RW) */}
        <svg className="absolute inset-0 w-full h-full">
          <rect x="50" y="50" width="200" height="150" fill="none" stroke="#1E40AF" strokeWidth="2" strokeDasharray="10,5" opacity="0.8"/>
          <rect x="270" y="80" width="180" height="120" fill="none" stroke="#1E40AF" strokeWidth="2" strokeDasharray="10,5" opacity="0.8"/>
          <rect x="470" y="60" width="160" height="140" fill="none" stroke="#1E40AF" strokeWidth="2" strokeDasharray="10,5" opacity="0.8"/>
          <rect x="650" y="90" width="170" height="130" fill="none" stroke="#1E40AF" strokeWidth="2" strokeDasharray="10,5" opacity="0.8"/>
        </svg>

        {/* Location markers */}
        {importantLocations.map((location, index) => {
          const x = 150 + index * 150 + (index % 2) * 50
          const y = 120 + (index % 3) * 80
          const isSelected = selectedMarker?.id === location.id

          return (
            <div
              key={location.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-200 ${
                isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{ left: x, top: y }}
              onClick={() => setSelectedMarker(isSelected ? null : location)}
            >
              {/* Marker pin */}
              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                location.type === 'Pemerintahan' ? 'bg-red-500' :
                location.type === 'Permukiman' ? 'bg-blue-500' :
                location.type === 'Pertanian' ? 'bg-green-500' :
                location.type === 'Kesehatan' ? 'bg-pink-500' :
                location.type === 'Pendidikan' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}>
                {location.type === 'Pemerintahan' && <Building2 className="h-3 w-3 text-white" />}
                {location.type === 'Permukiman' && <Home className="h-3 w-3 text-white" />}
                {location.type === 'Pertanian' && <TreePine className="h-3 w-3 text-white" />}
                {location.type === 'Kesehatan' && <MapPin className="h-3 w-3 text-white" />}
                {location.type === 'Pendidikan' && <MapPin className="h-3 w-3 text-white" />}
              </div>
              
              {/* Popup */}
              {isSelected && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg border p-3 z-30">
                  <div className="text-sm">
                    <h4 className="font-semibold text-gray-900">{location.name}</h4>
                    <p className="text-gray-600 text-xs mb-2">{location.description}</p>
                    {location.population > 0 && (
                      <p className="text-xs text-gray-500 mb-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {location.population.toLocaleString()} jiwa
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">{location.address}</p>
                    <div className="text-xs">
                      <p className="font-medium text-gray-700 mb-1">Fasilitas:</p>
                      <ul className="text-gray-600">
                        {location.facilities.slice(0, 3).map((facility, idx) => (
                          <li key={idx} className="list-disc list-inside">• {facility}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          )
        })}

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          © OpenStreetMap | LeafletJS
        </div>

        {/* Map controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0 shadow-lg">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0 shadow-lg">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-8 h-8 p-0 shadow-lg">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-8 h-8 p-0 shadow-lg"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded text-xs">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-black"></div>
            <span>1 km</span>
          </div>
        </div>

        {/* Coordinates display */}
        <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs font-mono">
          0°56'50" S, 100°25'02" E
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>WebGIS Nagari Terpadu</h1>
          <p className="text-muted-foreground">Sistem Informasi Geografis berbasis Leaflet untuk pemetaan digital nagari</p>
        </div>
        <div className="flex gap-2">
          <Select value={mapView} onValueChange={(value: any) => setMapView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Map
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? "Exit" : "Fullscreen"}
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
                  placeholder="Cari alamat, jorong, fasilitas..."
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
                <Button className="w-full" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Cari di Peta
                </Button>
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
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <layer.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
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
                <MapIcon className="h-4 w-4" />
                Statistik Wilayah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Luas Total:</span>
                    <span className="font-medium">{wilayahStats.totalLuas}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Penduduk:</span>
                    <span className="font-medium">{wilayahStats.totalPenduduk}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Kepadatan:</span>
                    <span className="font-medium">{wilayahStats.kepadatanPenduduk}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Jorong:</span>
                    <span className="font-medium">{wilayahStats.jumlahJorong}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">RT/RW:</span>
                    <span className="font-medium">{wilayahStats.jumlahRT}/{wilayahStats.jumlahRW}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Ketinggian:</span>
                    <span className="font-medium">{wilayahStats.ketinggian}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Tata Guna Lahan:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Pertanian
                      </span>
                      <span>{wilayahStats.luasPertanian}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Permukiman
                      </span>
                      <span>{wilayahStats.luasPermukiman}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                        Hutan
                      </span>
                      <span>{wilayahStats.luasHutan}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Map */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <LeafletMapSimulation />
            </CardContent>
          </Card>

          <Tabs defaultValue="locations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="locations">Lokasi Penting</TabsTrigger>
              <TabsTrigger value="demographics">Demografi</TabsTrigger>
              <TabsTrigger value="analysis">Analisis Spasial</TabsTrigger>
            </TabsList>

            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lokasi dan Fasilitas</CardTitle>
                  <CardDescription>
                    Daftar lokasi penting dan fasilitas umum di nagari
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {importantLocations.map((location) => (
                      <div key={location.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${
                                location.type === 'Pemerintahan' ? 'bg-red-500' :
                                location.type === 'Permukiman' ? 'bg-blue-500' :
                                location.type === 'Pertanian' ? 'bg-green-500' :
                                location.type === 'Kesehatan' ? 'bg-pink-500' :
                                location.type === 'Pendidikan' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}></div>
                              <h4 className="font-medium text-sm">{location.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{location.description}</p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {location.address}
                              </p>
                              {location.population > 0 && (
                                <p className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {location.population.toLocaleString()} jiwa
                                </p>
                              )}
                              <div>
                                <p className="font-medium">Fasilitas:</p>
                                <ul className="ml-2">
                                  {location.facilities.map((facility, idx) => (
                                    <li key={idx} className="text-xs">• {facility}</li>
                                  ))}
                                </ul>
                              </div>
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
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analisis Demografi Spasial</CardTitle>
                  <CardDescription>
                    Distribusi penduduk berdasarkan wilayah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">Kepadatan per Jorong</h4>
                      {[
                        { jorong: "Koto Baru", penduduk: 1247, kepadatan: "152 jiwa/km²", color: "bg-red-500" },
                        { jorong: "Koto Lama", penduduk: 983, kepadatan: "121 jiwa/km²", color: "bg-orange-500" },
                        { jorong: "Ladang Padi", penduduk: 617, kepadatan: "76 jiwa/km²", color: "bg-yellow-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <div>
                              <p className="text-sm font-medium">{item.jorong}</p>
                              <p className="text-xs text-muted-foreground">{item.kepadatan}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.penduduk}</p>
                            <p className="text-xs text-muted-foreground">jiwa</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Fasilitas per Jorong</h4>
                      {[
                        { jorong: "Koto Baru", sekolah: 2, puskesmas: 1, masjid: 3 },
                        { jorong: "Koto Lama", sekolah: 1, puskesmas: 0, masjid: 2 },
                        { jorong: "Ladang Padi", sekolah: 0, puskesmas: 0, masjid: 1 }
                      ].map((item, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          <p className="text-sm font-medium mb-1">{item.jorong}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="font-medium">{item.sekolah}</p>
                              <p className="text-muted-foreground">Sekolah</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{item.puskesmas}</p>
                              <p className="text-muted-foreground">Puskesmas</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{item.masjid}</p>
                              <p className="text-muted-foreground">Masjid</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analisis Spasial</CardTitle>
                  <CardDescription>
                    Tools analisis geospasial untuk perencanaan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">Buffer Analysis</h4>
                      <p className="text-sm text-muted-foreground">Analisis jangkauan fasilitas umum</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Jalankan Buffer Analysis
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Overlay Analysis</h4>
                      <p className="text-sm text-muted-foreground">Analisis tumpang susun layer</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Layers className="h-4 w-4 mr-2" />
                        Jalankan Overlay Analysis
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Network Analysis</h4>
                      <p className="text-sm text-muted-foreground">Analisis jalur dan rute optimal</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Route className="h-4 w-4 mr-2" />
                        Jalankan Network Analysis
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Spatial Query</h4>
                      <p className="text-sm text-muted-foreground">Query data berdasarkan lokasi</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Jalankan Spatial Query
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}