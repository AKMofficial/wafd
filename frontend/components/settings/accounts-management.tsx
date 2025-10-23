'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  User,
  UserCircle,
  Mail,
  Settings2,
  Loader2
} from 'lucide-react';
import { CreateUserDto, UpdateUserDto, User as UserType } from '@/types/user';
import { toast } from '@/components/ui/toast';

export function AccountsManagement() {
  const t = useTranslations();
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useSettingsStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Supervisor' as 'Admin' | 'Supervisor' | 'Pilgrim',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    try {
      await createUser(formData as CreateUserDto);
      toast.success(t('common.success'), t('settings.accounts.userAdded'));
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.error'), error instanceof Error ? error.message : t('settings.accounts.addFailed'));
    }
  };

  const handleEdit = async () => {
    if (selectedUser) {
      try {
        const updateData: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(selectedUser.id.toString(), updateData);
        toast.success(t('common.success'), t('settings.accounts.userUpdated'));
        setShowEditDialog(false);
        setSelectedUser(null);
        resetForm();
      } catch (error) {
        toast.error(t('common.error'), error instanceof Error ? error.message : t('settings.accounts.updateFailed'));
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id.toString());
        toast.success(t('common.success'), t('settings.accounts.userDeleted'));
        setShowDeleteConfirm(false);
        setShowEditDialog(false);
        setSelectedUser(null);
      } catch (error) {
        toast.error(t('common.error'), error instanceof Error ? error.message : t('settings.accounts.deleteFailed'));
      }
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Supervisor',
    });
  };

  const openEditDialog = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      Admin: t('settings.accounts.roles.admin'),
      Supervisor: t('settings.accounts.roles.supervisor'),
      Pilgrim: t('settings.accounts.roles.operator'),
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          <span>{t('settings.accounts.title')}</span>
        </h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          {t('settings.accounts.addAccount')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={t('settings.accounts.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>{t('settings.accounts.fullName')}</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{t('settings.accounts.email')}</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('settings.accounts.role')}</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span>{t('common.actions')}</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  {t('settings.accounts.noAccounts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-center">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        {t('common.edit')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden rounded-lg border overflow-x-auto">
        <Table className="min-w-[400px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs px-2 py-2">
                <div className="flex items-center gap-1">
                  <UserCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('settings.accounts.fullName')}</span>
                </div>
              </TableHead>
              <TableHead className="text-xs px-2 py-2">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('settings.accounts.role')}</span>
                </div>
              </TableHead>
              <TableHead className="text-center text-xs px-2 py-2">
                <div className="flex items-center justify-center gap-1">
                  <Settings2 className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('common.edit')}</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8 text-xs">
                  {t('settings.accounts.noAccounts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="text-xs px-2 py-2 min-w-[120px]">
                    <span className="truncate max-w-[150px] block">{user.name}</span>
                  </TableCell>
                  <TableCell className="text-xs px-2 py-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-700 border-gray-200 whitespace-nowrap">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center px-2 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          resetForm();
        }
      }}>
        <DialogContent onClose={() => {
          setShowAddDialog(false);
          resetForm();
        }}>
          <DialogHeader>
            <DialogTitle>{t('settings.accounts.addNewAccount')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.fullName')}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('settings.accounts.enterFullName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.email')}</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('settings.accounts.enterEmail')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.phone')}</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.password')}</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('settings.accounts.enterPassword')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.role')}</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'Admin' | 'Supervisor' | 'Pilgrim' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t('settings.accounts.roles.admin')}</SelectItem>
                  <SelectItem value="Supervisor">{t('settings.accounts.roles.supervisor')}</SelectItem>
                  <SelectItem value="Pilgrim">{t('settings.accounts.roles.operator')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAdd}>
                {t('common.add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false);
          setSelectedUser(null);
          resetForm();
        }
      }}>
        <DialogContent onClose={() => {
          setShowEditDialog(false);
          setSelectedUser(null);
          resetForm();
        }}>
          <DialogHeader>
            <DialogTitle>{t('settings.accounts.editAccount')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.fullName')}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('settings.accounts.enterFullName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.email')}</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('settings.accounts.enterEmail')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.phone')}</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.password')} ({t('settings.accounts.passwordHint')})</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('settings.accounts.enterNewPassword')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.role')}</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'Admin' | 'Supervisor' | 'Pilgrim' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">{t('settings.accounts.roles.admin')}</SelectItem>
                  <SelectItem value="Supervisor">{t('settings.accounts.roles.supervisor')}</SelectItem>
                  <SelectItem value="Pilgrim">{t('settings.accounts.roles.operator')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleDeleteClick}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 ml-1" />
                {t('settings.accounts.deleteAccount')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                  resetForm();
                }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleEdit}>
                  {t('common.saveChanges')}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t('settings.accounts.confirmDelete')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.accounts.deleteWarning').replace('{name}', selectedUser?.name || '')}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                {t('settings.accounts.deleteNote')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 ml-1" />
              {t('settings.accounts.deletePermanently')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}