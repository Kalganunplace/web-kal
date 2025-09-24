"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import BottomSheet from "@/components/ui/bottom-sheet"
import { Loader2, ChevronLeft, ChevronRight, Megaphone, Star, Calendar, Eye } from "lucide-react"
import { toast } from "sonner"

import { termsService, type Announcement } from "@/lib/terms-service"

export default function AnnouncementList() {
  const router = useRouter()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setIsLoading(true)
        const announcementsData = await termsService.getActiveAnnouncements()
        setAnnouncements(announcementsData)
      } catch (error) {
        console.error('공지사항 로드 실패:', error)
        toast.error('공지사항을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnnouncements()
  }, [])

  // 공지사항 상세 보기
  const viewAnnouncementDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setSelectedAnnouncement(null)
  }

  // 공지사항 타입별 색상 및 아이콘
  const getAnnouncementStyle = (type: string, isImportant: boolean) => {
    if (isImportant) {
      return {
        badgeColor: 'bg-red-100 text-red-800',
        icon: <Star className="w-4 h-4 text-red-500" />,
        label: '중요'
      }
    }

    switch (type) {
      case 'notice':
        return {
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: <Megaphone className="w-4 h-4 text-blue-500" />,
          label: '공지'
        }
      case 'event':
        return {
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: <Star className="w-4 h-4 text-purple-500" />,
          label: '이벤트'
        }
      case 'maintenance':
        return {
          badgeColor: 'bg-orange-100 text-orange-800',
          icon: <Calendar className="w-4 h-4 text-orange-500" />,
          label: '점검'
        }
      default:
        return {
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: <Megaphone className="w-4 h-4 text-gray-500" />,
          label: '일반'
        }
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return '오늘'
    } else if (diffInDays === 1) {
      return '어제'
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
    }
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <h1 className="text-lg font-medium">공지사항</h1>
            <div className="w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {announcements.length > 0 ? (
              <>
                {/* 안내 메시지 */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Megaphone className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">공지사항</h2>
                  <p className="text-sm text-gray-600">
                    칼가는곳의 새로운 소식을 확인하세요
                  </p>
                </div>

                {/* 공지사항 목록 */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {announcements.map((announcement) => {
                    const style = getAnnouncementStyle(announcement.type, announcement.is_important)
                    
                    return (
                      <Card 
                        key={announcement.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          announcement.is_important 
                            ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => viewAnnouncementDetail(announcement)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {style.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${style.badgeColor} text-xs`}>
                                  {style.label}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(announcement.created_at)}
                                </span>
                                {announcement.is_important && (
                                  <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              <h4 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                                {announcement.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {announcement.content.replace(/\*\*|🔪|🚚|💝|🗓️|📦|⚠️|✨|❌|🔄/g, '').trim()}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            ) : (
              // 공지사항이 없을 때
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">공지사항이 없습니다</h3>
                <p className="text-sm text-gray-600 mb-6">
                  새로운 공지사항이 있으면<br />
                  이곳에서 확인하실 수 있어요
                </p>
                <Button 
                  variant="outline"
                  onClick={() => router.back()}
                >
                  돌아가기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 공지사항 상세 바텀시트 */}
      <BottomSheet isOpen={isBottomSheetOpen} onClose={handleCloseBottomSheet}>
        {selectedAnnouncement && (() => {
          const style = getAnnouncementStyle(selectedAnnouncement.type, selectedAnnouncement.is_important)
          return (
            <div className="p-6 space-y-4">
              {/* 공지사항 헤더 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {style.icon}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className={style.badgeColor}>
                    {style.label}
                  </Badge>
                  {selectedAnnouncement.is_important && (
                    <Badge className="bg-red-500 text-white">
                      중요
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {termsService.formatDateTime(selectedAnnouncement.created_at)}
                </p>
              </div>

              {/* 공지사항 내용 */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </div>
              </div>

              {/* 기간 정보 */}
              {(selectedAnnouncement.start_date || selectedAnnouncement.end_date) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    적용 기간
                  </h4>
                  <div className="text-sm text-blue-700">
                    {selectedAnnouncement.start_date && (
                      <p>시작: {termsService.formatDateTime(selectedAnnouncement.start_date)}</p>
                    )}
                    {selectedAnnouncement.end_date && (
                      <p>종료: {termsService.formatDateTime(selectedAnnouncement.end_date)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 닫기 버튼 */}
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3"
                onClick={handleCloseBottomSheet}
              >
                확인
              </Button>
            </div>
          )
        })()}
      </BottomSheet>
    </>
  )
}