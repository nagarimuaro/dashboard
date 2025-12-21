import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Switch } from "./ui/switch"
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  User,
  Users,
  Key,
  UserCog,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Loader2,
  AlertCircle
} from "lucide-react"
import { userService } from "../services/userService"
import { Alert, AlertDescription } from "./ui/alert"

interface UserManagementProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

interface UserData {
  id: string | number
  nama: string
  name?: string
  email: string
  username?: string
  role: string | number
  role_id?: number
  status: string
  lastLogin?: string
  last_login_at?: string
  dateCreated?: string
  created_at?: string
  permissions?: string[]
  permissions_list?: string[] // From API response
  nagari?: string
  tenant_id?: number
  phone?: string
  pivot?: {
    role_id?: number
  }
}

interface FormData {
  nama: string
  email: string
  username: string
  phone: string
  role: string
  status: string
  password: string
  password_confirmation: string
  permissions: string[]
}

const initialFormData: FormData = {
  nama: '',
  email: '',
  username: '',
  phone: '',
  role: 'staff_nagari',
  status: 'aktif',
  password: '',
  password_confirmation: '',
  permissions: ['dashboard']
}

export function UserManagement({ userRole }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  
  // API State
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [passwordData, setPasswordData] = useState({ password: '', password_confirmation: '' })
  const [pagination, setPagination] = useState({ page: 1, perPage: 15, total: 0 })

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {
        page: pagination.page,
        per_page: pagination.perPage
      }
      if (searchTerm) params.search = searchTerm
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await userService.getAll(params)
      
      if (response.success || response.data) {
        const userData = response.data?.data || response.data || []
        setUsers(Array.isArray(userData) ? userData : [])
        if (response.data?.meta) {
          setPagination(prev => ({
            ...prev,
            total: response.data.meta.total || 0
          }))
        }
      } else {
        setError(response.message || 'Gagal mengambil data user')
      }
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Gagal mengambil data user')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.perPage, searchTerm, roleFilter, statusFilter])

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle form input change
  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle permission toggle
  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }))
  }

  // Role ID mapping (sesuai dengan database backend)
  const roleIdMapping: Record<string, number> = {
    'admin_nagari': 1,
    'admin_global': 1, // map to Admin Nagari for now
    'staff_nagari': 2, // Operator
    'warga': 3, // Kader/Warga
  }

  // Reverse mapping for display
  const roleFromId = (roleId: number): string => {
    switch (roleId) {
      case 1: return 'admin_nagari'
      case 2: return 'staff_nagari'
      case 3: return 'warga'
      default: return 'staff_nagari'
    }
  }

  // Create user
  const handleCreateUser = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: formData.nama,
        email: formData.email,
        password: formData.password,
        role_id: roleIdMapping[formData.role] || 2, // Default to Operator
        permissions: formData.permissions, // Send permissions array
      }

      const response = await userService.create(payload)
      
      if (response.success || response.data || response.status === 'success') {
        setSuccessMessage('User berhasil ditambahkan!')
        setIsAddDialogOpen(false)
        setFormData(initialFormData)
        fetchUsers()
      } else {
        setError(response.message || 'Gagal menambahkan user')
      }
    } catch (err: any) {
      console.error('Error creating user:', err)
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(', ')
        setError(errorMessages)
      } else {
        setError(err.message || 'Gagal menambahkan user')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, any> = {
        name: formData.nama,
        email: formData.email,
        role_id: roleIdMapping[formData.role] || 2,
        permissions: formData.permissions, // Send permissions array
      }

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password
      }

      const response = await userService.update(selectedUser.id, payload)
      
      if (response.success || response.data || response.status === 'success') {
        setSuccessMessage('User berhasil diupdate!')
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setFormData(initialFormData)
        fetchUsers()
      } else {
        setError(response.message || 'Gagal mengupdate user')
      }
    } catch (err: any) {
      console.error('Error updating user:', err)
      if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(', ')
        setError(errorMessages)
      } else {
        setError(err.message || 'Gagal mengupdate user')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await userService.delete(selectedUser.id)
      
      if (response.success || response.status === 200 || response.status === 204) {
        setSuccessMessage('User berhasil dihapus!')
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(response.message || 'Gagal menghapus user')
      }
    } catch (err: any) {
      console.error('Error deleting user:', err)
      setError(err.message || 'Gagal menghapus user')
    } finally {
      setSubmitting(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (!selectedUser) return
    setSubmitting(true)
    setError(null)
    try {
      const response = await userService.changePassword(selectedUser.id, passwordData)
      
      if (response.success || response.data) {
        setSuccessMessage('Password berhasil diubah!')
        setIsPasswordDialogOpen(false)
        setPasswordData({ password: '', password_confirmation: '' })
        setSelectedUser(null)
      } else {
        setError(response.message || 'Gagal mengubah password')
      }
    } catch (err: any) {
      console.error('Error changing password:', err)
      setError(err.message || 'Gagal mengubah password')
    } finally {
      setSubmitting(false)
    }
  }

  // Open edit dialog with user data
  const openEditDialog = (user: UserData) => {
    setSelectedUser(user)
    // Convert role_id or role to string format for form
    let roleValue = 'staff_nagari'
    if (typeof user.role === 'number') {
      roleValue = roleFromId(user.role)
    } else if (typeof user.role === 'string') {
      if (user.role === 'Admin Nagari') roleValue = 'admin_nagari'
      else if (user.role === 'Operator') roleValue = 'staff_nagari'
      else if (user.role === 'Kader') roleValue = 'warga'
      else roleValue = user.role
    }
    
    // Use permissions_list from API or fallback to permissions
    const userPermissions = user.permissions_list || user.permissions || []
    
    setFormData({
      nama: user.nama || user.name || '',
      email: user.email,
      username: user.username || '',
      phone: user.phone || '',
      role: roleValue,
      status: user.status === 'active' ? 'aktif' : (user.status === 'aktif' ? 'aktif' : 'nonaktif'),
      password: '',
      password_confirmation: '',
      permissions: userPermissions
    })
    setIsEditDialogOpen(true)
  }

  // Open delete confirmation
  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Open password dialog
  const openPasswordDialog = (user: UserData) => {
    setSelectedUser(user)
    setPasswordData({ password: '', password_confirmation: '' })
    setIsPasswordDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (user: UserData) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  // Role permissions mapping
  const rolePermissions = {
    admin_global: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan",
      "template", "cms", "keuangan", "gis", "data_sosial", "kader", "pengaduan", 
      "arsip", "user_management", "settings"
    ],
    admin_nagari: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan",
      "template", "cms", "keuangan", "gis", "data_sosial", "kader", "pengaduan", 
      "arsip", "user_management", "settings"
    ],
    staff_nagari: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan"
    ],
    warga: [
      "dashboard", "surat"
    ]
  }

  const getRoleBadge = (role: string | number) => {
    // Handle role_id from backend (number) or role string
    const roleStr = typeof role === 'number' ? roleFromId(role) : role
    
    switch (roleStr) {
      case 'admin_global':
      case 'admin_nagari':
        return <Badge variant="default"><UserCog className="h-3 w-3 mr-1" />Admin Nagari</Badge>
      case 'staff_nagari':
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Operator</Badge>
      case 'warga':
        return <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Kader</Badge>
      default:
        // Handle role name from backend directly
        if (role === 'Admin Nagari' || role === 1) {
          return <Badge variant="default"><UserCog className="h-3 w-3 mr-1" />Admin Nagari</Badge>
        }
        if (role === 'Operator' || role === 2) {
          return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Operator</Badge>
        }
        if (role === 'Kader' || role === 3) {
          return <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Kader</Badge>
        }
        return <Badge variant="outline">{String(role) || 'Unknown'}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    const isActive = status === 'aktif' || status === 'active'
    if (isActive) {
      return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>
    }
    return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Nonaktif</Badge>
  }

  // Helper to get display name
  const getUserDisplayName = (user: UserData) => user.nama || user.name || '-'
  const getUserLastLogin = (user: UserData) => user.lastLogin || user.last_login_at || '-'
  const getUserCreatedAt = (user: UserData) => user.dateCreated || user.created_at || '-'

  // Filter users (client-side for current page)
  const filteredUsers = users

  const UserForm = ({ user, onSubmit, isEdit = false }: { user?: UserData, onSubmit: () => void, isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input 
            id="nama" 
            placeholder="Nama lengkap" 
            value={formData.nama}
            onChange={(e) => handleInputChange('nama', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="email@domain.com" 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            placeholder="Username" 
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. HP</Label>
          <Input 
            id="phone" 
            placeholder="081234567890" 
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role-select">Role</Label>
          <Select value={formData.role} onValueChange={(value: string) => handleInputChange('role', value)}>
            <SelectTrigger id="role-select" aria-label="Pilih role">
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin_nagari">Admin Nagari</SelectItem>
              <SelectItem value="staff_nagari">Operator</SelectItem>
              <SelectItem value="warga">Kader</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-select">Status</Label>
          <Select value={formData.status} onValueChange={(value: string) => handleInputChange('status', value)}>
            <SelectTrigger id="status-select" aria-label="Pilih status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="Konfirmasi password" 
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "data_warga", label: "Data Warga" },
            { key: "data_keluarga", label: "Data Keluarga" },
            { key: "surat", label: "Pelayanan Surat" },
            { key: "kelola_permohonan", label: "Kelola Permohonan" },
            { key: "template", label: "Template Surat" },
            { key: "cms", label: "CMS" },
            { key: "keuangan", label: "Keuangan" },
            { key: "gis", label: "GIS / Peta" },
            { key: "data_sosial", label: "Data Sosial" },
            { key: "kader", label: "Kader Posyandu" },
            { key: "pengaduan", label: "Pengaduan" },
            { key: "arsip", label: "Arsip & Dokumen" },
            { key: "user_management", label: "User Management" },
            { key: "settings", label: "Settings" }
          ].map((perm) => {
            const fieldId = `perm-${isEdit ? 'edit' : 'add'}-${perm.key}`;
            return (
              <div key={perm.key} className="flex items-center space-x-2">
                <Switch 
                  id={fieldId}
                  name={fieldId}
                  checked={formData.permissions.includes(perm.key)}
                  onCheckedChange={(checked: boolean) => handlePermissionToggle(perm.key, checked)}
                  aria-label={perm.label}
                />
                <Label htmlFor={fieldId} className="text-sm cursor-pointer">{perm.label}</Label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update User" : "Tambah User"}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false)
            } else {
              setIsAddDialogOpen(false)
            }
            setFormData(initialFormData)
          }}
        >
          Batal
        </Button>
      </div>
    </div>
  )

  const UserDetail = ({ user }: { user: UserData }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{getUserDisplayName(user)}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {getRoleBadge(user.role)}
            {getStatusBadge(user.status)}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>ID: {user.id}</p>
          <p>Username: {user.username}</p>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Informasi User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{getUserDisplayName(user)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono">{user.username}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No. HP:</span>
                <span>{user.phone || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nagari:</span>
                <span>{user.nagari || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dibuat:</span>
                <span>{getUserCreatedAt(user)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Aktivitas Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login:</span>
              <span className="font-medium">{getUserLastLogin(user)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(user.status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {user.permissions?.includes("all") ? (
              <Badge variant="destructive" className="justify-center">All Permissions</Badge>
            ) : (
              (user.permissions || []).map((perm: string) => (
                <Badge key={perm} variant="outline" className="justify-center">
                  {perm.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">Kelola user dan hak akses sistem</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => {
            setIsAddDialogOpen(open)
            if (!open) setFormData(initialFormData)
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
                <DialogDescription>
                  Buat akun user baru dengan permissions yang sesuai
                </DialogDescription>
              </DialogHeader>
              <UserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open: boolean) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setFormData(initialFormData)
          setSelectedUser(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update informasi dan permissions user
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedUser || undefined} onSubmit={handleUpdateUser} isEdit />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{selectedUser ? getUserDisplayName(selectedUser) : ''}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail User</DialogTitle>
            <DialogDescription>
              Informasi lengkap user dan permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && <UserDetail user={selectedUser} />}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open: boolean) => {
        setIsPasswordDialogOpen(open)
        if (!open) {
          setPasswordData({ password: '', password_confirmation: '' })
          setSelectedUser(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>
              Ubah password untuk user <strong>{selectedUser ? getUserDisplayName(selectedUser) : ''}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="Password baru"
                value={passwordData.password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Konfirmasi Password</Label>
              <Input 
                id="confirm-new-password" 
                type="password" 
                placeholder="Konfirmasi password"
                value={passwordData.password_confirmation}
                onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleChangePassword} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ubah Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Daftar User</TabsTrigger>
          <TabsTrigger value="roles">Role & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Log Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total User</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '-' : users.length}</div>
                <p className="text-xs text-muted-foreground">Semua akun</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Aktif</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '-' : users.filter(u => u.status === 'aktif' || u.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">Dapat login</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '-' : users.filter(u => {
                    const role = u.role || u.role_id || u.pivot?.role_id
                    return role === 1 || role === 'admin_nagari' || role === 'Admin Nagari' || (typeof role === 'string' && role.toLowerCase().includes('admin'))
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Admin Nagari</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operator</CardTitle>
                <User className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? '-' : users.filter(u => {
                    const role = u.role || u.role_id || u.pivot?.role_id
                    return role === 2 || role === 'staff_nagari' || role === 'Operator'
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Staff operasional</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan nama, email, atau username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="admin_global">Super Admin</SelectItem>
                      <SelectItem value="admin_nagari">Admin Nagari</SelectItem>
                      <SelectItem value="staff_nagari">Staff</SelectItem>
                      <SelectItem value="warga">Warga</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar User</CardTitle>
              <CardDescription>
                Menampilkan {filteredUsers.length} user {pagination.total > 0 && `dari total ${pagination.total}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Memuat data...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Tidak ada user ditemukan</p>
                </div>
              ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Nagari</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getUserDisplayName(user)}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getUserLastLogin(user)}
                          </div>
                        </TableCell>
                        <TableCell>{user.nagari || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openViewDialog(user)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openPasswordDialog(user)}
                              title="Ubah Password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              title="Hapus User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions Matrix</CardTitle>
              <CardDescription>
                Mapping hak akses untuk setiap role di sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead className="text-center">Super Admin</TableHead>
                      <TableHead className="text-center">Admin Nagari</TableHead>
                      <TableHead className="text-center">Staff</TableHead>
                      <TableHead className="text-center">Warga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      "Dashboard", "Data Warga", "Data Keluarga", "Surat", "Kelola Permohonan",
                      "Template", "Keuangan", "GIS", "Pengaduan", "Arsip", "User Management", "Settings"
                    ].map((permission) => (
                      <TableRow key={permission}>
                        <TableCell className="font-medium">{permission}</TableCell>
                        <TableCell className="text-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          {!["Settings"].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {["Dashboard", "Data Warga", "Data Keluarga", "Surat", "Kelola Permohonan"].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {["Dashboard", "Surat"].includes(permission) ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Aktivitas User</CardTitle>
              <CardDescription>
                Riwayat login dan aktivitas user sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Ahmad Fauzi", action: "Login", time: "2024-01-20 09:30", ip: "192.168.1.10" },
                  { user: "Siti Nurhaliza", action: "Login", time: "2024-01-20 08:15", ip: "192.168.1.11" },
                  { user: "Dewi Sartika", action: "Logout", time: "2024-01-19 17:00", ip: "192.168.1.12" },
                  { user: "Ahmad Fauzi", action: "Create Surat", time: "2024-01-19 16:45", ip: "192.168.1.10" },
                  { user: "Hasan Basri", action: "Login Failed", time: "2024-01-19 14:20", ip: "192.168.1.13" }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-sm font-medium">{log.user} - {log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.time} • IP: {log.ip}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.action.includes("Failed") ? "Failed" : "Success"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}