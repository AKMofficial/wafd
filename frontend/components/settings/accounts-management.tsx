'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
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
  Settings2
} from 'lucide-react';

interface Account {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator';
  lastLogin?: Date;
  createdAt: Date;
}

export function AccountsManagement() {
  const t = useTranslations();
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      username: 'admin',
      fullName: 'مدير النظام',
      email: 'admin@hajj.com',
      role: 'admin',
      lastLogin: new Date('2024-01-15T10:30:00'),
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      username: 'supervisor1',
      fullName: 'أحمد محمد',
      email: 'ahmad@hajj.com',
      role: 'supervisor',
      lastLogin: new Date('2024-01-14T15:20:00'),
      createdAt: new Date('2023-06-15'),
    },
    {
      id: '3',
      username: 'operator1',
      fullName: 'فاطمة علي',
      email: 'fatima@hajj.com',
      role: 'operator',
      lastLogin: new Date('2024-01-15T08:00:00'),
      createdAt: new Date('2023-09-20'),
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'supervisor' | 'operator',
  });

  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newAccount: Account = {
      id: (accounts.length + 1).toString(),
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      role: formData.role,
      createdAt: new Date(),
    };
    setAccounts([...accounts, newAccount]);
    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedAccount) {
      setAccounts(accounts.map(acc =>
        acc.id === selectedAccount.id
          ? { ...acc, ...formData }
          : acc
      ));
      setShowEditDialog(false);
      setSelectedAccount(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedAccount) {
      setAccounts(accounts.filter(acc => acc.id !== selectedAccount.id));
      setShowDeleteConfirm(false);
      setShowEditDialog(false);
      setSelectedAccount(null);
    }
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };


  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      role: 'operator',
    });
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      password: '',
      role: account.role,
    });
    setShowEditDialog(true);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: t('settings.accounts.roles.admin'),
      supervisor: t('settings.accounts.roles.supervisor'),
      operator: t('settings.accounts.roles.operator'),
    };
    return labels[role as keyof typeof labels] || role;
  };

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
              <TableHead className="w-[160px]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{t('settings.accounts.username')}</span>
                </div>
              </TableHead>
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
                  <Settings2 className="h-4 w-4" />
                  <span>{t('common.actions')}</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  {t('settings.accounts.noAccounts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border-gray-200">
                      {account.username}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{account.fullName}</TableCell>
                  <TableCell className="text-center">{account.email}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(account)}
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
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('settings.accounts.username')}</span>
                </div>
              </TableHead>
              <TableHead className="text-xs px-2 py-2">
                <div className="flex items-center gap-1">
                  <UserCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('settings.accounts.fullName')}</span>
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
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8 text-xs">
                  {t('settings.accounts.noAccounts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-gray-50">
                  <TableCell className="text-xs px-2 py-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-700 border-gray-200 whitespace-nowrap">
                      {account.username}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs px-2 py-2 min-w-[120px]">
                    <span className="truncate max-w-[150px] block">{account.fullName}</span>
                  </TableCell>
                  <TableCell className="text-center px-2 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEditDialog(account)}
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
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.username')}</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('settings.accounts.enterUsername')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.fullName')}</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.password')}</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('settings.accounts.enterPassword')}
              />
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
          setSelectedAccount(null);
          resetForm();
        }
      }}>
        <DialogContent onClose={() => {
          setShowEditDialog(false);
          setSelectedAccount(null);
          resetForm();
        }}>
          <DialogHeader>
            <DialogTitle>{t('settings.accounts.editAccount')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.username')}</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('settings.accounts.enterUsername')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.fullName')}</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
              <label className="block text-sm font-medium mb-1">{t('settings.accounts.password')} ({t('settings.accounts.passwordHint')})</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('settings.accounts.enterNewPassword')}
              />
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
                  setSelectedAccount(null);
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
              {t('settings.accounts.deleteWarning').replace('{name}', selectedAccount?.fullName || '')}
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