'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  Users2
} from 'lucide-react';
import { groupAPI } from '@/lib/api';
import { format } from 'date-fns';

interface Group {
  id: string;
  name: string;
  code: string;
  leader: string;
  leaderEmail: string;
  leaderPhone: string;
  maxPilgrim: number;
  pilgrimsCount: number;
  notes?: string;
  createdAt?: Date;
}

export function GroupsManagement() {
  const t = useTranslations();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    leader: '',
    leaderEmail: '',
    leaderPhone: '',
    leaderPassword: '',
    maxPilgrim: 50,
    notes: '',
  });

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await groupAPI.getAll();
      const data: Group[] = Array.isArray(response)
        ? response.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            code: item.code || '',
            leader: item.managerName || '',
            leaderEmail: item.managerEmail || '',
            leaderPhone: item.managerPhone || '',
            maxPilgrim: item.maxPilgrim ?? 50,
            pilgrimsCount: item.pilgrimsCount ?? 0,
            notes: item.notes ?? '',
            createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          }))
        : [];
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups', err);
      setError(t('settings.groups.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!formData.name || !formData.code || !formData.leader || !formData.leaderEmail || !formData.leaderPhone || !formData.leaderPassword) {
      alert(t('settings.groups.validation.requiredFields'));
      return;
    }
    if (!formData.maxPilgrim || formData.maxPilgrim < 1) {
      alert(t('settings.groups.validation.maxPilgrimRequired'));
      return;
    }
    try {
      await groupAPI.create({
        name: formData.name,
        code: formData.code,
        managerName: formData.leader,
        managerEmail: formData.leaderEmail,
        managerPhone: formData.leaderPhone,
        managerPassword: formData.leaderPassword,
        maxPilgrim: formData.maxPilgrim,
        notes: formData.notes,
      });
      setShowAddDialog(false);
      resetForm();
      await loadGroups();
    } catch (err) {
      console.error('Failed to create group', err);
      alert(t('settings.groups.saveError'));
    }
  };

  const handleEdit = async () => {
    if (!selectedGroup) return;
    if (!formData.name || !formData.code || !formData.leader || !formData.leaderEmail || !formData.leaderPhone) {
      alert(t('settings.groups.validation.requiredFields'));
      return;
    }
    if (!formData.maxPilgrim || formData.maxPilgrim < 1) {
      alert(t('settings.groups.validation.maxPilgrimRequired'));
      return;
    }
    try {
      await groupAPI.update(Number(selectedGroup.id), {
        name: formData.name,
        code: formData.code,
        managerName: formData.leader,
        managerEmail: formData.leaderEmail,
        managerPhone: formData.leaderPhone,
        managerPassword: formData.leaderPassword || undefined,
        maxPilgrim: formData.maxPilgrim,
        notes: formData.notes,
      });
      setShowEditDialog(false);
      setSelectedGroup(null);
      resetForm();
      await loadGroups();
    } catch (err) {
      console.error('Failed to update group', err);
      alert(t('settings.groups.saveError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    if (selectedGroup.pilgrimsCount > 0) {
      alert(t('settings.groups.cannotDelete'));
      setShowDeleteConfirm(false);
      return;
    }
    try {
      await groupAPI.delete(Number(selectedGroup.id));
      setShowDeleteConfirm(false);
      setShowEditDialog(false);
      setSelectedGroup(null);
      await loadGroups();
    } catch (err) {
      console.error('Failed to delete group', err);
      alert(t('settings.groups.deleteError'));
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      leader: '',
      leaderEmail: '',
      leaderPhone: '',
      leaderPassword: '',
      maxPilgrim: 50,
      notes: '',
    });
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      leader: group.leader,
      leaderEmail: group.leaderEmail,
      leaderPhone: group.leaderPhone,
      leaderPassword: '',
      maxPilgrim: group.maxPilgrim,
      notes: group.notes || '',
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          <span>{t('settings.groups.title')}</span>
        </h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          {t('settings.groups.addGroup')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={t('settings.groups.searchPlaceholder')}
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
              <TableHead>{t('settings.groups.groupName')}</TableHead>
              <TableHead>{t('settings.groups.groupCode')}</TableHead>
              <TableHead>{t('settings.groups.leader')}</TableHead>
              <TableHead>{t('settings.groups.leaderEmail')}</TableHead>
              <TableHead>{t('settings.groups.leaderPhone')}</TableHead>
              <TableHead className="text-center">{t('settings.groups.pilgrimsCount')}</TableHead>
              <TableHead>{t('settings.groups.notes')}</TableHead>
              <TableHead>{t('settings.groups.createdAt')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  {t('settings.groups.noGroups')}
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{group.name || '-'}</TableCell>
                  <TableCell>{group.code || '-'}</TableCell>
                  <TableCell>{group.leader || '-'}</TableCell>
                  <TableCell>{group.leaderEmail || '-'}</TableCell>
                  <TableCell dir="ltr">{group.leaderPhone || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{group.pilgrimsCount}</Badge>
                  </TableCell>
                  <TableCell>{group.notes || '-'}</TableCell>
                  <TableCell>{group.createdAt ? format(group.createdAt, 'yyyy-MM-dd') : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(group)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('common.edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isLoading && (
        <div className="border rounded-lg p-6 text-center text-sm text-gray-500">
          {t('settings.groups.loading')}
        </div>
      )}

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {filteredGroups.length === 0 && (
          <div className="border rounded-lg p-4 text-sm text-gray-500 text-center">
            {t('settings.groups.noGroups')}
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{group.name || '-'}</p>
                <p className="text-xs text-gray-500">{group.code || '-'}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                <Edit className="h-4 w-4 mr-1" />
                {t('common.edit')}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <span className="font-medium">{t('settings.groups.leader')}</span>
              <span>{group.leader || '-'}</span>
              <span className="font-medium">{t('settings.groups.leaderEmail')}</span>
              <span>{group.leaderEmail || '-'}</span>
              <span className="font-medium">{t('settings.groups.leaderPhone')}</span>
              <span dir="ltr">{group.leaderPhone || '-'}</span>
              <span className="font-medium">{t('settings.groups.pilgrimsCount')}</span>
              <span>{group.pilgrimsCount}</span>
              <span className="font-medium">{t('settings.groups.notes')}</span>
              <span>{group.notes || '-'}</span>
              <span className="font-medium">{t('settings.groups.createdAt')}</span>
              <span>{group.createdAt ? format(group.createdAt, 'yyyy-MM-dd') : '-'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Group Dialog */}
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
            <DialogTitle>{t('settings.groups.addNewGroup')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.groupName')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('settings.groups.enterGroupName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.groupCode')}</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="GRP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderName')}</label>
                <Input
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  placeholder={t('settings.groups.enterLeaderName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderEmail')}</label>
                <Input
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({ ...formData, leaderEmail: e.target.value })}
                  placeholder="leader@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderPhone')}</label>
                <Input
                  value={formData.leaderPhone}
                  onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                  placeholder="+9665XXXXXXXX"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderPassword')}</label>
                <Input
                  value={formData.leaderPassword}
                  onChange={(e) => setFormData({ ...formData, leaderPassword: e.target.value })}
                  placeholder="********"
                  type="password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.maxPilgrim')}</label>
                <Input
                  value={formData.maxPilgrim}
                  onChange={(e) => setFormData({ ...formData, maxPilgrim: Number(e.target.value) || 0 })}
                  placeholder="50"
                  type="number"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.groups.notes')} ({t('settings.groups.optional')})</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('settings.groups.enterNotes')}
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

      {/* Edit Group Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false);
          setSelectedGroup(null);
          resetForm();
        }
      }}>
        <DialogContent onClose={() => {
          setShowEditDialog(false);
          setSelectedGroup(null);
          resetForm();
        }}>
          <DialogHeader>
            <DialogTitle>{t('settings.groups.editGroup')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.groupName')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('settings.groups.enterGroupName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.groupCode')}</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="GRP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderName')}</label>
                <Input
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  placeholder={t('settings.groups.enterLeaderName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderEmail')}</label>
                <Input
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({ ...formData, leaderEmail: e.target.value })}
                  placeholder="leader@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderPhone')}</label>
                <Input
                  value={formData.leaderPhone}
                  onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                  placeholder="+9665XXXXXXXX"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.leaderPasswordOptional')}</label>
                <Input
                  value={formData.leaderPassword}
                  onChange={(e) => setFormData({ ...formData, leaderPassword: e.target.value })}
                  placeholder={t('settings.groups.leavePasswordBlank')}
                  type="password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('settings.groups.maxPilgrim')}</label>
                <Input
                  value={formData.maxPilgrim}
                  onChange={(e) => setFormData({ ...formData, maxPilgrim: Number(e.target.value) || 0 })}
                  placeholder="50"
                  type="number"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('settings.groups.notes')}</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('settings.groups.enterNotes')}
              />
            </div>
            <DialogFooter className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleDeleteClick}
                disabled={selectedGroup?.pilgrimsCount ? selectedGroup.pilgrimsCount > 0 : false}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 ml-1" />
                {t('settings.groups.deleteGroup')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setSelectedGroup(null);
                  resetForm();
                }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleEdit}>
                  {t('settings.groups.saveChanges')}
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
              {t('settings.groups.confirmDelete')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.groups.deleteWarning').replace('{name}', selectedGroup?.name || '')}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                {t('settings.groups.deleteNote')}
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
              {t('settings.groups.deletePermanently')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
