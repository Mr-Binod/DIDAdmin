"use client";

import { useAdminInfoStore } from "../../../Store/useAdminStore";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [userInfo, setUserInfo] = useState(null);
  const {admin} = useAdminInfoStore();

  useEffect(() => {
    console.log(admin, "admin"); 
    setUserInfo(admin);
  }, [admin]);

  if (!userInfo) {
    return (
      <div className="p-6">
        <p>관리자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-[calc(100vh-24px)] bg-blueback ">
    <div className="p-6 max-w-4xl  mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-whiteback">내 정보</h1>

      {/* 프로필 카드 */}
      <div className="border border-gray-200  rounded-xl h-180 shadow-xl bg-white p-16">
        {/* 상단 프로필 헤더 */}
        <div className="flex items-center gap-20 mb-16">
          {/* 아바타 */}
          <div className="w-50 h-50 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
            <img src={userInfo.imgPath} className="" alt="" />
          </div>

          {/* 이름 / 아이디 */}
          <div className="">
            <div className="flex items-center gap-5 mb-10 ">
            <div className="font-semibold text-2xl">이름:</div>
            <h2 className="text-4xl font-semibold"> {userInfo.userName}</h2>
            </div>
            <p className="text-gray-600 text-xl">닉네임: @{userInfo.nickName}</p>
          </div>
        </div>

        {/* 정보 리스트 */}
        <div className="space-y-5 text-xl">
          <div className="flex items-center gap-5">
            <span className="w-24 font-semibold text-gray-700 ">userId : </span>
            <span className="text-gray-900">{userInfo.userId}</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="w-24 font-semibold text-gray-700 ">회사명 : </span>
            <span className="text-gray-900">경일게임IT 아카데미</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-semibold w-24 text-gray-700 ">등급 :  </span>
            <span className="text-gray-900">{userInfo.grade === 2 ? "슈퍼 관리자" : "일반 관리자"}</span>
          </div>
          
          <div className="flex items-center  gap-5">
            <span className="font-semibold text-gray-700 w-24">생년월일 : </span>
            <span className="text-gray-900">{userInfo.birthDate}</span>
          </div>
          
          <div className="flex items-center gap-5">
            <span className="font-semibold w-24 text-gray-700">가입일 :</span>
            <span className="text-gray-900">{new Date(userInfo.createdAt).toLocaleString("ko-KR")}</span>
          </div>
          <div className="flex   items-center gap-5">
            <span className="font-semibold w-24  text-gray-700 "> 지갑 계정 : </span>
            <span className="text-gray-900 ">{userInfo.walletAddress}</span>
          </div>
          <div className="flex   items-center gap-5">
            <span className="font-semibold w-24  text-gray-700 "> DID : </span>
            <span className="text-gray-900 ">{userInfo.didAddress}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
