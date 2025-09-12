'use client';

import { useState } from 'react';
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
  Users,
  Search,
  AlertCircle,
  Users2,
  User,
  Phone,
  FileText,
  Settings2
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  code: string;
  leader: string;
  leaderPhone: string;
  pilgrimsCount: number;
  notes?: string;
  createdAt: Date;
}

export function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'مجموعة الرحمة',
      code: 'GRP-001',
      leader: 'محمد أحمد',
      leaderPhone: '+966501234567',
      pilgrimsCount: 45,
      notes: 'مجموعة من منطقة الرياض',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'مجموعة البركة',
      code: 'GRP-002',
      leader: 'عبدالله محمد',
      leaderPhone: '+966507654321',
      pilgrimsCount: 32,
      notes: 'مجموعة من منطقة جدة',
      createdAt: new Date('2024-01-05'),
    },
    {
      id: '3',
      name: 'مجموعة النور',
      code: 'GRP-003',
      leader: 'فاطمة علي',
      leaderPhone: '+966509876543',
      pilgrimsCount: 28,
      notes: 'مجموعة نسائية',
      createdAt: new Date('2024-01-10'),
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    leader: '',
    leaderPhone: '',
    notes: '',
  });

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.leader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const newGroup: Group = {
      id: (groups.length + 1).toString(),
      name: formData.name,
      code: formData.code || `GRP-${String(groups.length + 1).padStart(3, '0')}`,
      leader: formData.leader,
      leaderPhone: formData.leaderPhone,
      pilgrimsCount: 0,
      notes: formData.notes,
      createdAt: new Date(),
    };
    setGroups([...groups, newGroup]);
    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedGroup) {
      setGroups(groups.map(grp =>
        grp.id === selectedGroup.id
          ? { ...grp, ...formData }
          : grp
      ));
      setShowEditDialog(false);
      setSelectedGroup(null);
      resetForm();
    }
  };

  const handleDelete = () => {
    if (selectedGroup) {
      if (selectedGroup.pilgrimsCount > 0) {
        alert('لا يمكن حذف مجموعة بها حجاج. يرجى نقل الحجاج أولاً.');
        setShowDeleteConfirm(false);
        return;
      }
      setGroups(groups.filter(grp => grp.id !== selectedGroup.id));
      setShowDeleteConfirm(false);
      setShowEditDialog(false);
      setSelectedGroup(null);
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
      leaderPhone: '',
      notes: '',
    });
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      leader: group.leader,
      leaderPhone: group.leaderPhone,
      notes: group.notes || '',
    });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          <span>إدارة المجموعات</span>
        </h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مجموعة
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="البحث باسم المجموعة أو المسؤول..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  <span>اسم المجموعة</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  <span>المسؤول</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>رقم الهاتف</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>عدد الحجاج</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>ملاحظات</span>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span>الإجراءات</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  لا توجد مجموعات
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-center">{group.leader}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm" dir="ltr">{group.leaderPhone}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 ml-1" />
                      {group.pilgrimsCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-600">
                    {group.notes || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            <DialogTitle>إضافة مجموعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المجموعة</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المجموعة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المسؤول</label>
              <Input
                value={formData.leader}
                onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                placeholder="أدخل اسم مسؤول المجموعة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم هاتف المسؤول</label>
              <Input
                value={formData.leaderPhone}
                onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                placeholder="+966 5X XXX XXXX"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}>
                إلغاء
              </Button>
              <Button onClick={handleAdd}>
                إضافة
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
            <DialogTitle>تعديل المجموعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المجموعة</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المجموعة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المسؤول</label>
              <Input
                value={formData.leader}
                onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                placeholder="أدخل اسم مسؤول المجموعة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم هاتف المسؤول</label>
              <Input
                value={formData.leaderPhone}
                onChange={(e) => setFormData({ ...formData, leaderPhone: e.target.value })}
                placeholder="+966 5X XXX XXXX"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات"
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
                حذف المجموعة
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setSelectedGroup(null);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleEdit}>
                  حفظ التغييرات
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
              تأكيد حذف المجموعة
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف مجموعة "{selectedGroup?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                سيتم حذف جميع بيانات المجموعة بشكل نهائي.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 ml-1" />
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}