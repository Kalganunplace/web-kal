"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, User, Phone, Mail, MapPin } from "lucide-react"

export default function MemberInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: "칼가는곳",
    phone: "010-1234-5678",
    email: "user@example.com",
    address: "대구광역시 중구 동성로 123",
  })

  const handleSave = () => {
    setIsEditing(false)
    // 저장 로직
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-lg font-medium">회원 정보</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="text-orange-500 text-sm">
            {isEditing ? "취소" : "수정"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{userInfo.name} 님</h2>
            <p className="text-sm text-gray-500">일반 회원</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-800">{userInfo.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-800">{userInfo.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-800">{userInfo.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.address}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-800">{userInfo.address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isEditing && (
            <Button onClick={handleSave} className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white">
              저장하기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
