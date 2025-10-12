'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Link,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  position: string;
  title?: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BANNER_POSITIONS = [
  {
    value: 'home_main',
    label: '홈 메인 배너',
    description: '홈 화면 상단의 큰 메인 배너 (권장 크기: 1080x1080px)',
    size: '정사각형 (1:1)'
  },
  {
    value: 'home_sub_event',
    label: '홈 서브 배너 - 이벤트',
    description: '홈 화면 중간의 이벤트 배너 (권장 크기: 1080x400px)',
    size: '가로형 (33:12)'
  },
  {
    value: 'home_sub_subscription',
    label: '홈 서브 배너 - 구독',
    description: '홈 화면 중간의 구독 배너 (권장 크기: 1080x400px)',
    size: '가로형 (33:12)'
  },
  {
    value: 'price_list',
    label: '가격표 배너',
    description: '가격표 페이지 상단 배너 (권장 크기: 1080x400px)',
    size: '가로형'
  },
];

export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState('');

  const [formData, setFormData] = useState({
    position: 'home_main',
    title: '',
    image_url: '',
    link_url: '',
    display_order: '0',
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    setPreviewUrl(formData.image_url);
  }, [formData.image_url]);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners');
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '배너를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({
        title: '오류',
        description: '이미지 URL을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';
      const body = editingBanner
        ? { id: editingBanner.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          display_order: parseInt(formData.display_order),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: editingBanner ? '배너가 수정되었습니다.' : '배너가 추가되었습니다.',
        });
        fetchBanners();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '작업을 완료하는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/banners?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: '배너가 삭제되었습니다.',
        });
        fetchBanners();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      position: banner.position,
      title: banner.title || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      display_order: banner.display_order.toString(),
      is_active: banner.is_active,
    });
    setIsDialogOpen(true);
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          is_active: !banner.is_active,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: '성공',
          description: banner.is_active ? '배너가 비활성화되었습니다.' : '배너가 활성화되었습니다.',
        });
        fetchBanners();
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast({
        title: '오류',
        description: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)',
        variant: 'destructive',
      });
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '오류',
        description: '파일 크기는 5MB를 초과할 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'banners');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, image_url: data.data.url });
        setPreviewUrl(data.data.url);
        setUploadedFilePath(data.data.path);
        toast({
          title: '성공',
          description: '이미지가 업로드되었습니다.',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: `업로드 실패: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      position: 'home_main',
      title: '',
      image_url: '',
      link_url: '',
      display_order: '0',
      is_active: true,
    });
    setPreviewUrl('');
    setUploadedFilePath('');
  };

  const filteredBanners = banners.filter((banner) => {
    return filterPosition === 'all' || banner.position === filterPosition;
  });

  const getPositionLabel = (position: string) => {
    const pos = BANNER_POSITIONS.find(p => p.value === position);
    return pos ? pos.label : position;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">배너 관리</h1>
          <p className="text-gray-600 mt-1">홈페이지 배너를 관리합니다.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              새 배너 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBanner ? '배너 수정' : '새 배너 추가'}</DialogTitle>
              <DialogDescription>
                배너 정보를 입력하세요. 이미지는 URL 형식으로 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>배너 위치</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANNER_POSITIONS.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        <div>
                          <div className="font-medium">{pos.label}</div>
                          <div className="text-xs text-gray-500">{pos.size}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.position && (
                  <p className="text-xs text-gray-500 mt-2">
                    {BANNER_POSITIONS.find(p => p.value === formData.position)?.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>표시 순서</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">숫자가 작을수록 먼저 표시됩니다</p>
                </div>
                <div>
                  <Label>활성화</Label>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>배너 제목 (선택)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 신규 가입 이벤트"
                />
              </div>

              <div>
                <Label>이미지 업로드</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        업로드 중...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF, WEBP 파일만 가능 (최대 5MB)
                  </p>
                </div>
              </div>

              <div className="relative">
                <Label>또는 이미지 URL 직접 입력</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  disabled={uploading}
                />
              </div>

              {previewUrl && (
                <div>
                  <Label>이미지 미리보기</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="배너 미리보기"
                      className="w-full h-48 object-cover"
                      onError={() => setPreviewUrl('')}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>링크 URL (선택)</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://example.com/event"
                />
                <p className="text-xs text-gray-500 mt-1">배너 클릭 시 이동할 URL (비워두면 클릭 불가)</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
                {editingBanner ? '수정' : '추가'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 위치</SelectItem>
                {BANNER_POSITIONS.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">미리보기</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>링크</TableHead>
                <TableHead className="text-center">순서</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden">
                      {banner.image_url ? (
                        <img 
                          src={banner.image_url} 
                          alt={banner.title || '배너'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{banner.title || '제목 없음'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPositionLabel(banner.position)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {banner.link_url ? (
                      <div className="flex items-center gap-1">
                        <Link className="h-3 w-3" />
                        <span className="text-sm text-gray-500 truncate max-w-[150px]">
                          {banner.link_url}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{banner.display_order}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(banner)}
                    >
                      {banner.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}