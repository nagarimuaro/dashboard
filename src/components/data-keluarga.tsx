import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { keluargaService } from "../services/keluargaService"
import { wargaService } from "../services/wargaService"
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Users,
  UserPlus,
  UserMinus,
  Home,
  TreePine,
  UsersRound,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"

interface DataKeluargaProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
  onNavigateToDetail?: (keluargaId: string | number) => void
}

// Extract KeluargaForm as separate memoized component to prevent input focus loss
interface KeluargaFormProps {
  keluarga?: any
  formData: {
    no_kk: string
    kepala_keluarga_id: string
    alamat: string
    rt: string
    rw: string
    jorong: string
  }
  allWarga: any[]
  filteredWarga: any[]
  selectedKepalaKeluarga: any
  additionalMembers: Array<{warga_id: string, hubungan: string}>
  formError: string
  onFormDataChange: (data: any) => void
  onKepalaKeluargaChange: (warga: any) => void
  onAdditionalMembersChange: (members: Array<{warga_id: string, hubungan: string}>) => void
  onSubmit: () => void
  onCancel: () => void
}

const KeluargaFormComponent = React.memo(({ 
  keluarga,
  formData,
  allWarga,
  filteredWarga,
  selectedKepalaKeluarga,
  additionalMembers,
  formError,
  onFormDataChange,
  onKepalaKeluargaChange,
  onAdditionalMembersChange,
  onSubmit,
  onCancel
}: KeluargaFormProps) => {
  const handleKepalaKeluargaChange = (wargaId: string) => {
    const warga = allWarga.find(w => w.id.toString() === wargaId)
    if (warga) {
      onKepalaKeluargaChange(warga)
      onFormDataChange({
        ...formData,
        kepala_keluarga_id: warga.id.toString(),
        alamat: warga.alamat || formData.alamat,
        rt: warga.rt || formData.rt,
        rw: warga.rw || formData.rw,
        jorong: warga.jorong || formData.jorong
      })
    }
  }
  
  const handleNoKKChange = (value: string) => {
    onFormDataChange({...formData, no_kk: value})
  }

  const handleAddMember = () => {
    console.log('➕ Adding member. Current count:', additionalMembers.length)
    console.log('📊 Filtered warga:', filteredWarga.length)
    console.log('👤 Selected kepala:', selectedKepalaKeluarga?.nama || 'none')
    onAdditionalMembersChange([...additionalMembers, { warga_id: '', hubungan: '' }])
  }
  
  const handleRemoveMember = (index: number) => {
    const updated = additionalMembers.filter((_, i) => i !== index)
    onAdditionalMembersChange(updated)
  }
  
  const handleMemberChange = (index: number, field: 'warga_id' | 'hubungan', value: string) => {
    const updated = [...additionalMembers]
    updated[index][field] = value
    onAdditionalMembersChange(updated)
  }
  
  // Get available warga for additional members (excluding kepala and already added)
  const getAvailableWargaForMember = (currentIndex: number) => {
    const usedIds = new Set([
      formData.kepala_keluarga_id,
      ...additionalMembers
        .map((m, idx) => idx !== currentIndex ? m.warga_id : null)
        .filter(id => id)
    ])
    // Only show warga from filteredWarga (same No KK)
    const available = filteredWarga.filter(w => !usedIds.has(w.id.toString()))
    console.log(`📋 Available warga for member #${currentIndex}:`, available.length, 'out of', filteredWarga.length)
    return available
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {formError}
        </div>
      )}

      {/* Instruksi */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1">Cara Buat Kartu Keluarga:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Masukkan No KK untuk menampilkan daftar warga dengan No KK yang sama</li>
          <li>Pilih Kepala Keluarga dari dropdown</li>
          <li>Data alamat akan terisi otomatis dari data kepala keluarga</li>
          <li>Tambahkan anggota keluarga lainnya jika diperlukan</li>
        </ol>
      </div>

      {/* No KK Field - FIRST */}
      <div className="space-y-2">
        <Label htmlFor="no-kk">Nomor Kartu Keluarga *</Label>
        <Input 
          id="no-kk" 
          placeholder="Masukkan 16 digit nomor KK" 
          value={formData.no_kk}
          onChange={(e) => handleNoKKChange(e.target.value)}
          maxLength={16}
        />
        <p className="text-xs text-muted-foreground">
          Masukkan No KK terlebih dahulu untuk memfilter daftar warga
        </p>
      </div>

      {/* Kepala Keluarga - Shows filtered options */}
      <div className="space-y-2">
        <Label htmlFor="kepala-keluarga">Kepala Keluarga *</Label>
        <Select 
          value={formData.kepala_keluarga_id} 
          onValueChange={handleKepalaKeluargaChange}
          disabled={!formData.no_kk || filteredWarga.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !formData.no_kk 
                ? "Masukkan No KK terlebih dahulu" 
                : filteredWarga.length === 0
                  ? "Tidak ada warga dengan No KK ini"
                  : "Pilih kepala keluarga"
            } />
          </SelectTrigger>
          <SelectContent>
            {filteredWarga.map((warga) => (
              <SelectItem key={warga.id} value={warga.id.toString()}>
                {warga.nama_lengkap || warga.nama} - NIK: {warga.nik}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.no_kk && filteredWarga.length === 0 && (
          <p className="text-xs text-amber-600">
            Tidak ada warga dengan No KK "{formData.no_kk}". Pastikan No KK sudah terdaftar di data warga.
          </p>
        )}
      </div>

      {/* Address fields - auto-filled from kepala keluarga */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Input 
            id="alamat" 
            placeholder="Alamat lengkap" 
            value={formData.alamat}
            onChange={(e) => onFormDataChange({...formData, alamat: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rt">RT</Label>
          <Input 
            id="rt" 
            placeholder="RT" 
            value={formData.rt}
            onChange={(e) => onFormDataChange({...formData, rt: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rw">RW</Label>
          <Input 
            id="rw" 
            placeholder="RW" 
            value={formData.rw}
            onChange={(e) => onFormDataChange({...formData, rw: e.target.value})}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="jorong">Jorong</Label>
          <Input 
            id="jorong" 
            placeholder="Jorong" 
            value={formData.jorong}
            onChange={(e) => onFormDataChange({...formData, jorong: e.target.value})}
          />
        </div>
      </div>

      {/* Preview current family members */}
      {(selectedKepalaKeluarga || additionalMembers.length > 0) && (
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm mb-3 text-blue-900">Preview Anggota Keluarga</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
            {selectedKepalaKeluarga && (
              <div className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-blue-200">
                <Badge variant="default" className="bg-blue-600">Kepala Keluarga</Badge>
                <span className="font-medium">{selectedKepalaKeluarga.nama_lengkap || selectedKepalaKeluarga.nama}</span>
                <span className="text-muted-foreground text-xs">NIK: {selectedKepalaKeluarga.nik}</span>
              </div>
            )}
            {additionalMembers.map((member, idx) => {
              const warga = allWarga.find(w => w.id.toString() === member.warga_id)
              if (!warga) return null
              return (
                <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded border border-blue-200">
                  <Badge variant="secondary">{member.hubungan || 'Belum dipilih'}</Badge>
                  <span className="font-medium">{warga.nama_lengkap || warga.nama}</span>
                  <span className="text-muted-foreground text-xs">NIK: {warga.nik}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Additional Members Section */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Anggota Keluarga Lainnya</Label>
            {selectedKepalaKeluarga && filteredWarga.length > 1 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredWarga.length - 1 - additionalMembers.length} anggota tersedia
              </p>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleAddMember}
            disabled={
              !selectedKepalaKeluarga || 
              filteredWarga.length <= 1 ||
              (filteredWarga.length - 1 - additionalMembers.length) <= 0
            }
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>
        
        {!selectedKepalaKeluarga && (
          <p className="text-xs text-muted-foreground">
            Pilih kepala keluarga terlebih dahulu untuk menambah anggota
          </p>
        )}
        
        {selectedKepalaKeluarga && filteredWarga.length <= 1 && (
          <p className="text-xs text-amber-600">
            Hanya ada 1 warga dengan No KK ini (kepala keluarga). Tidak ada anggota lain yang bisa ditambahkan.
          </p>
        )}
        
        {selectedKepalaKeluarga && filteredWarga.length > 1 && (filteredWarga.length - 1 - additionalMembers.length) <= 0 && (
          <p className="text-xs text-green-600">
            ✓ Semua anggota keluarga ({filteredWarga.length - 1} orang) sudah ditambahkan.
          </p>
        )}

        {additionalMembers.length > 0 && (
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {additionalMembers.map((member, index) => {
              const availableWarga = getAvailableWargaForMember(index)
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Anggota #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Nama Warga</Label>
                      <Select 
                        value={member.warga_id} 
                        onValueChange={(value: string) => handleMemberChange(index, 'warga_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih warga" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWarga.map((warga) => (
                            <SelectItem key={warga.id} value={warga.id.toString()}>
                              {warga.nama_lengkap || warga.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Hubungan Keluarga</Label>
                      <Select 
                        value={member.hubungan} 
                        onValueChange={(value: string) => handleMemberChange(index, 'hubungan', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Istri">Istri</SelectItem>
                          <SelectItem value="Suami">Suami</SelectItem>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Anak Kandung">Anak Kandung</SelectItem>
                          <SelectItem value="Anak Tiri">Anak Tiri</SelectItem>
                          <SelectItem value="Anak Angkat">Anak Angkat</SelectItem>
                          <SelectItem value="Cucu">Cucu</SelectItem>
                          <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                          <SelectItem value="Mertua">Mertua</SelectItem>
                          <SelectItem value="Menantu">Menantu</SelectItem>
                          <SelectItem value="Kakek">Kakek</SelectItem>
                          <SelectItem value="Nenek">Nenek</SelectItem>
                          <SelectItem value="Saudara Kandung">Saudara Kandung</SelectItem>
                          <SelectItem value="Keponakan">Keponakan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={onSubmit}>
          {keluarga ? "Update KK" : "Buat KK Baru"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  )
})

KeluargaFormComponent.displayName = 'KeluargaForm'

export function DataKeluarga({ userRole, onNavigateToDetail }: DataKeluargaProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKK, setSelectedKK] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAnggotaDialogOpen, setIsAnggotaDialogOpen] = useState(false)
  const [keluargaData, setKeluargaData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedJorong, setSelectedJorong] = useState<string>("all")
  const [selectedRT, setSelectedRT] = useState<string>("all")
  const [selectedRW, setSelectedRW] = useState<string>("all")
  
  // Form states
  const [allWarga, setAllWarga] = useState<any[]>([])
  const [filteredWarga, setFilteredWarga] = useState<any[]>([])
  const [formData, setFormData] = useState({
    no_kk: '',
    kepala_keluarga_id: '',
    alamat: '',
    rt: '',
    rw: '',
    jorong: ''
  })
  const [selectedKepalaKeluarga, setSelectedKepalaKeluarga] = useState<any>(null)
  const [additionalMembers, setAdditionalMembers] = useState<Array<{warga_id: string, hubungan: string}>>([])
  const [formError, setFormError] = useState<string>('')
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Load data from API
  const loadKeluargaData = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        per_page: 15
      }

      if (searchTerm) {
        params.search = searchTerm
      }
      if (selectedJorong && selectedJorong !== "all") {
        params.jorong = selectedJorong
      }
      if (selectedRT && selectedRT !== "all") {
        params.rt = selectedRT
      }
      if (selectedRW && selectedRW !== "all") {
        params.rw = selectedRW
      }

      const response = await keluargaService.getAll(params)
      // Laravel pagination structure: { data: [...], meta: { last_page, ... } }
      setKeluargaData(response.data || [])
      setTotalPages(response.meta?.last_page || response.last_page || 1)
    } catch (error) {
      console.error('Error loading keluarga data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load all warga for form
  const loadAllWarga = async () => {
    try {
      console.log('📥 Loading all warga...')
      const response = await wargaService.getAll({ per_page: 1000 })
      console.log('✅ Warga loaded:', response.data?.length || 0)
      if (response.data && response.data.length > 0) {
        console.log('📋 Sample warga structure:', response.data[0])
      }
      setAllWarga(response.data || [])
    } catch (error) {
      console.error('❌ Error loading warga:', error)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    loadKeluargaData()
    loadAllWarga()
  }, [currentPage, searchTerm, selectedJorong, selectedRT, selectedRW])
  
  // Filter warga based on inputted No KK (not from selected kepala keluarga)
  useEffect(() => {
    console.log('🔍 Filtering warga by No KK:', formData.no_kk)
    console.log('📊 Total allWarga:', allWarga.length)
    
    if (formData.no_kk && formData.no_kk.length > 0) {
      // Check sample warga structure
      if (allWarga.length > 0) {
        console.log('📋 Sample warga:', allWarga[0])
      }
      
      const filtered = allWarga.filter(w => {
        // Debug: log comparison
        const match = w.no_kk === formData.no_kk
        if (match) {
          console.log('✅ Match found:', w.nama_lengkap || w.nama, 'No KK:', w.no_kk)
        }
        return match
      })
      
      console.log('✅ Filtered warga count:', filtered.length)
      setFilteredWarga(filtered)
      
      // Auto-reset kepala keluarga if No KK changed and doesn't match anymore
      if (selectedKepalaKeluarga && selectedKepalaKeluarga.no_kk !== formData.no_kk) {
        console.log('🔄 Resetting kepala keluarga due to No KK change')
        setSelectedKepalaKeluarga(null)
        setFormData(prev => ({...prev, kepala_keluarga_id: ''}))
        setAdditionalMembers([]) // Also clear additional members
      }
    } else {
      setFilteredWarga([])
    }
  }, [formData.no_kk, allWarga, selectedKepalaKeluarga])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1)
    loadKeluargaData()
  }

  const FamilyTreeVisualizer = ({ anggota }: { anggota: any[] }) => {
    if (!anggota || anggota.length === 0) {
      return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-center">
          <p className="text-muted-foreground">Belum ada data anggota keluarga</p>
        </div>
      )
    }

    // Fungsi untuk menghitung umur dari tanggal lahir
    const calculateAge = (dateOfBirth: string) => {
      if (!dateOfBirth) return 0
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

    // Untuk sementara, kita ambil semua anggota karena belum ada field hubungan_keluarga di pivot
    const kepalaKeluarga = anggota[0] // Asumsi anggota pertama adalah kepala keluarga
    const anggotaLain = anggota.slice(1)

    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="flex flex-col items-center space-y-6">
          {/* Orang Tua */}
          <div className="flex items-center gap-8">
            {kepalaKeluarga && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {kepalaKeluarga.nama?.charAt(0) || 'KK'}
                </div>
                <div className="mt-2 text-center">
                  <p className="font-medium text-sm">{kepalaKeluarga.nama || 'Kepala Keluarga'}</p>
                  <p className="text-xs text-muted-foreground">Kepala Keluarga</p>
                  <p className="text-xs text-muted-foreground">{calculateAge(kepalaKeluarga.tanggal_lahir)} tahun</p>
                </div>
              </div>
            )}
          </div>

          {/* Garis ke anggota lain */}
          {anggotaLain.length > 0 && (
            <div className="w-0.5 h-8 bg-gray-400"></div>
          )}

          {/* Anggota keluarga lain */}
          {anggotaLain.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 justify-center">
              {anggotaLain.map((member: any, index: number) => (
                <div key={member.id || index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${member.jenis_kelamin === 'L' ? 'bg-green-500' : 'bg-purple-500'} rounded-full flex items-center justify-center text-white font-bold`}>
                    {member.nama?.charAt(0) || 'A'}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-medium text-xs">{member.nama || 'Anggota'}</p>
                    <p className="text-xs text-muted-foreground">{calculateAge(member.tanggal_lahir)} tahun</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const AnggotaKeluargaForm = ({ kk }: { kk: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nik-anggota">NIK</Label>
          <Input id="nik-anggota" placeholder="16 digit NIK" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nama-anggota">Nama Lengkap</Label>
          <Input id="nama-anggota" placeholder="Nama lengkap" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hubungan">Hubungan dengan Kepala Keluarga</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih hubungan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
              <SelectItem value="Istri">Istri</SelectItem>
              <SelectItem value="Suami">Suami</SelectItem>
              <SelectItem value="Anak">Anak</SelectItem>
              <SelectItem value="Cucu">Cucu</SelectItem>
              <SelectItem value="Orang Tua">Orang Tua</SelectItem>
              <SelectItem value="Mertua">Mertua</SelectItem>
              <SelectItem value="Menantu">Menantu</SelectItem>
              <SelectItem value="Saudara">Saudara</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jenis-kelamin-anggota">Jenis Kelamin</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Anggota
        </Button>
        <Button variant="outline" onClick={() => setIsAnggotaDialogOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  )

  // Handler functions for KeluargaForm callbacks
  const handleFormDataChange = (data: any) => {
    setFormData(data)
  }

  const handleKepalaKeluargaSelect = (warga: any) => {
    setSelectedKepalaKeluarga(warga)
  }

  const handleAdditionalMembersUpdate = (members: Array<{warga_id: string, hubungan: string}>) => {
    setAdditionalMembers(members)
  }

  const handleFormSubmit = async () => {
    try {
      setFormError('')
      
      if (!formData.no_kk || !formData.kepala_keluarga_id) {
        setFormError('No KK dan Kepala Keluarga wajib diisi!')
        return
      }

      const submitData = {
        ...formData,
        additional_members: additionalMembers.filter(m => m.warga_id && m.hubungan)
      }

      await keluargaService.create(submitData)
      alert('Keluarga berhasil dibuat!')
      setIsAddDialogOpen(false)
      loadKeluargaData()
      
      // Reset form
      setFormData({
        no_kk: '',
        kepala_keluarga_id: '',
        alamat: '',
        rt: '',
        rw: '',
        jorong: ''
      })
      setSelectedKepalaKeluarga(null)
      setAdditionalMembers([])
      setFormError('')
    } catch (error: any) {
      console.error('Error creating keluarga:', error)
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        setFormError(error.response.data.message)
      } else if (error.response?.data?.errors?.no_kk) {
        setFormError(error.response.data.errors.no_kk[0] || 'No KK sudah terdaftar')
      } else {
        setFormError('Gagal membuat keluarga: ' + (error.message || 'Terjadi kesalahan'))
      }
    }
  }

  const handleFormCancel = () => {
    setIsAddDialogOpen(false)
    setFormError('')
    setAdditionalMembers([])
    setFormData({
      no_kk: '',
      kepala_keluarga_id: '',
      alamat: '',
      rt: '',
      rw: '',
      jorong: ''
    })
    setSelectedKepalaKeluarga(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Data Keluarga</h1>
          <p className="text-muted-foreground">Kelola data kartu keluarga dan anggota keluarga</p>
        </div>
        {userRole !== 'warga' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat KK Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Buat Kartu Keluarga Baru</DialogTitle>
                  <DialogDescription>
                    Isi data untuk membuat kartu keluarga baru
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 pr-2">
                  <KeluargaFormComponent
                    formData={formData}
                    allWarga={allWarga}
                    filteredWarga={filteredWarga}
                    selectedKepalaKeluarga={selectedKepalaKeluarga}
                    additionalMembers={additionalMembers}
                    formError={formError}
                    onFormDataChange={handleFormDataChange}
                    onKepalaKeluargaChange={handleKepalaKeluargaSelect}
                    onAdditionalMembersChange={handleAdditionalMembersUpdate}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan No. KK, kepala keluarga, atau alamat..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="jorong">Jorong</Label>
                <Select value={selectedJorong} onValueChange={setSelectedJorong}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jorong" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jorong</SelectItem>
                    <SelectItem value="Koto Baru">Koto Baru</SelectItem>
                    <SelectItem value="Koto Lama">Koto Lama</SelectItem>
                    <SelectItem value="Ladang Padi">Ladang Padi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="rt">RT</Label>
                <Select value={selectedRT} onValueChange={setSelectedRT}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih RT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua RT</SelectItem>
                    <SelectItem value="01">RT 01</SelectItem>
                    <SelectItem value="02">RT 02</SelectItem>
                    <SelectItem value="03">RT 03</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="rw">RW</Label>
                <Select value={selectedRW} onValueChange={setSelectedRW}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih RW" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua RW</SelectItem>
                    <SelectItem value="01">RW 01</SelectItem>
                    <SelectItem value="02">RW 02</SelectItem>
                    <SelectItem value="03">RW 03</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loading && (
                <div className="flex items-end">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Daftar Keluarga</TabsTrigger>
          <TabsTrigger value="tree">Pohon Keluarga</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total KK</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keluargaData.length}</div>
                <p className="text-xs text-muted-foreground">Kartu keluarga terdaftar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keluargaData.reduce((total, kk) => total + kk.jumlahAnggota, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Anggota keluarga</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Anggota</CardTitle>
                <UsersRound className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keluargaData.length > 0 
                    ? (keluargaData.reduce((total, kk) => total + kk.jumlahAnggota, 0) / keluargaData.length).toFixed(1)
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Orang per keluarga</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kartu Keluarga</CardTitle>
              <CardDescription>
                Menampilkan {keluargaData.length} keluarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>No. KK</TableHead>
                      <TableHead>Kepala Keluarga</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>RT/RW</TableHead>
                      <TableHead>Jorong</TableHead>
                      <TableHead className="text-center">Jumlah Anggota</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        </TableRow>
                      ))
                    ) : keluargaData.map((keluarga: any, index: number) => (
                      <TableRow key={keluarga.id}>
                        <TableCell className="text-center font-medium">{((currentPage - 1) * 15) + index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{keluarga.no_kk}</TableCell>
                        <TableCell className="font-medium">{keluarga.kepala_keluarga?.nama || 'Belum ada kepala keluarga'}</TableCell>
                        <TableCell>{keluarga.alamat || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{keluarga.rt || '-'} / {keluarga.rw || '-'}</TableCell>
                        <TableCell>{keluarga.jorong || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {keluarga.anggotas?.length || keluarga.anggotas_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                console.log('� Navigating to detail page for keluarga:', keluarga.id)
                                if (onNavigateToDetail) {
                                  onNavigateToDetail(keluarga.id)
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {userRole !== 'warga' && (
                              <>
                                <Dialog open={isAnggotaDialogOpen} onOpenChange={setIsAnggotaDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
                                      <DialogDescription>
                                        Tambahkan anggota baru untuk KK: {keluarga.no_kk}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <AnggotaKeluargaForm kk={keluarga} />
                                  </DialogContent>
                                </Dialog>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Kartu Keluarga</DialogTitle>
                                      <DialogDescription>
                                        Edit data kartu keluarga
                                      </DialogDescription>
                                    </DialogHeader>
                                    <KeluargaFormComponent
                                      keluarga={keluarga}
                                      formData={formData}
                                      allWarga={allWarga}
                                      filteredWarga={filteredWarga}
                                      selectedKepalaKeluarga={selectedKepalaKeluarga}
                                      additionalMembers={additionalMembers}
                                      formError={formError}
                                      onFormDataChange={handleFormDataChange}
                                      onKepalaKeluargaChange={handleKepalaKeluargaSelect}
                                      onAdditionalMembersChange={handleAdditionalMembersUpdate}
                                      onSubmit={handleFormSubmit}
                                      onCancel={handleFormCancel}
                                    />
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination inside table card */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages} ({keluargaData.length} data)
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    {/* Previous Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* Next Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <div className="grid gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : keluargaData.map((keluarga: any) => (
              <Card key={keluarga.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TreePine className="h-5 w-5" />
                    Keluarga {keluarga.kepala_keluarga?.nama || 'Belum ada kepala keluarga'}
                  </CardTitle>
                  <CardDescription>
                    No. KK: {keluarga.no_kk} • {[keluarga.alamat, keluarga.rt && `RT ${keluarga.rt}`, keluarga.rw && `RW ${keluarga.rw}`, keluarga.jorong].filter(Boolean).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FamilyTreeVisualizer anggota={keluarga.anggotas || []} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}