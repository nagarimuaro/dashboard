import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
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
  Settings
} from "lucide-react"

interface UserManagementProps {
  userRole: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga'
}

export function UserManagement({ userRole }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data users
  const usersData = [
    {
      id: "USR001",
      nama: "Ahmad Fauzi",
      email: "ahmad.fauzi@nagari.id",
      username: "ahmad.fauzi",
      role: "admin_nagari",
      status: "aktif",
      lastLogin: "2024-01-20 09:30",
      dateCreated: "2024-01-01",
      permissions: ["dashboard", "data_warga", "data_keluarga", "surat", "template", "keuangan", "arsip"],
      nagari: "Koto Baru",
      phone: "081234567890"
    },
    {
      id: "USR002", 
      nama: "Siti Nurhaliza",
      email: "siti.nurhaliza@nagari.id",
      username: "siti.nurhaliza",
      role: "staff_nagari",
      status: "aktif",
      lastLogin: "2024-01-20 08:15",
      dateCreated: "2024-01-05",
      permissions: ["dashboard", "data_warga", "data_keluarga", "surat"],
      nagari: "Koto Baru",
      phone: "081234567891"
    },
    {
      id: "USR003",
      nama: "Dewi Sartika",
      email: "dewi.sartika@nagari.id",
      username: "dewi.sartika",
      role: "staff_nagari",
      status: "aktif",
      lastLogin: "2024-01-19 16:45",
      dateCreated: "2024-01-10",
      permissions: ["dashboard", "surat", "kelola_permohonan"],
      nagari: "Koto Baru",
      phone: "081234567892"
    },
    {
      id: "USR004",
      nama: "Hasan Basri",
      email: "hasan.basri@nagari.id",
      username: "hasan.basri",
      role: "staff_nagari",
      status: "nonaktif",
      lastLogin: "2024-01-15 14:20",
      dateCreated: "2023-12-15",
      permissions: ["dashboard", "gis", "pengaduan"],
      nagari: "Koto Baru",
      phone: "081234567893"
    },
    {
      id: "USR005",
      nama: "Super Admin",
      email: "admin@sistem.nagari.id",
      username: "superadmin",
      role: "admin_global",
      status: "aktif",
      lastLogin: "2024-01-20 10:00",
      dateCreated: "2023-01-01",
      permissions: ["all"],
      nagari: "All",
      phone: "081234567894"
    }
  ]

  // Role permissions mapping
  const rolePermissions = {
    admin_global: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan",
      "template", "keuangan", "gis", "pengaduan", "arsip", "user_management", "settings"
    ],
    admin_nagari: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan",
      "template", "keuangan", "gis", "pengaduan", "arsip", "user_management"
    ],
    staff_nagari: [
      "dashboard", "data_warga", "data_keluarga", "surat", "kelola_permohonan"
    ],
    warga: [
      "dashboard", "surat"
    ]
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin_global':
        return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
      case 'admin_nagari':
        return <Badge variant="default"><UserCog className="h-3 w-3 mr-1" />Admin Nagari</Badge>
      case 'staff_nagari':
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Staff</Badge>
      case 'warga':
        return <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Warga</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>
      case 'nonaktif':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Nonaktif</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const UserForm = ({ user }: { user?: any }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input id="nama" placeholder="Nama lengkap" defaultValue={user?.nama} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@domain.com" defaultValue={user?.email} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Username" defaultValue={user?.username} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. HP</Label>
          <Input id="phone" placeholder="081234567890" defaultValue={user?.phone} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select defaultValue={user?.role}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              {userRole === 'admin_global' && (
                <SelectItem value="admin_global">Super Admin</SelectItem>
              )}
              <SelectItem value="admin_nagari">Admin Nagari</SelectItem>
              <SelectItem value="staff_nagari">Staff Nagari</SelectItem>
              <SelectItem value="warga">Warga</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={user?.status || "aktif"}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!user && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <Input id="confirm-password" type="password" placeholder="Konfirmasi password" />
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
            { key: "surat", label: "Surat" },
            { key: "kelola_permohonan", label: "Kelola Permohonan" },
            { key: "template", label: "Template" },
            { key: "keuangan", label: "Keuangan" },
            { key: "gis", label: "GIS" },
            { key: "pengaduan", label: "Pengaduan" },
            { key: "arsip", label: "Arsip" },
            { key: "user_management", label: "User Management" },
            { key: "settings", label: "Settings" }
          ].map((perm) => (
            <div key={perm.key} className="flex items-center space-x-2">
              <Switch 
                id={perm.key} 
                defaultChecked={user?.permissions?.includes(perm.key) || false}
              />
              <Label htmlFor={perm.key} className="text-sm">{perm.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          {user ? "Update User" : "Tambah User"}
        </Button>
        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  )

  const UserDetail = ({ user }: { user: any }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{user.nama}</h3>
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
                <span className="font-medium">{user.nama}</span>
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
                <span>{user.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nagari:</span>
                <span>{user.nagari}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dibuat:</span>
                <span>{user.dateCreated}</span>
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
              <span className="font-medium">{user.lastLogin}</span>
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
            {user.permissions.includes("all") ? (
              <Badge variant="destructive" className="justify-center">All Permissions</Badge>
            ) : (
              user.permissions.map((perm: string) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground">Kelola user dan hak akses sistem</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <UserForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                <div className="text-2xl font-bold">{usersData.length}</div>
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
                  {usersData.filter(u => u.status === 'aktif').length}
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
                  {usersData.filter(u => u.role.includes('admin')).length}
                </div>
                <p className="text-xs text-muted-foreground">Admin & Super Admin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff</CardTitle>
                <User className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {usersData.filter(u => u.role === 'staff_nagari').length}
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
                Menampilkan {filteredUsers.length} dari {usersData.length} user
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            <p className="font-medium">{user.nama}</p>
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
                            {user.lastLogin}
                          </div>
                        </TableCell>
                        <TableCell>{user.nagari}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                  <DialogDescription>
                                    Update informasi dan permissions user
                                  </DialogDescription>
                                </DialogHeader>
                                <UserForm user={user} />
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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