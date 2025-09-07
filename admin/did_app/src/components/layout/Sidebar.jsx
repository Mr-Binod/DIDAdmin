'use client';

import { useAdminRequestStore, useIsSuperAdminStore } from '@/Store/useAdminStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, use } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { isSuperAdmin } = useIsSuperAdminStore();
  const { requests, setRequests } = useAdminRequestStore();
  const itemsPerPage = 10; // 페이지당 항목 수



  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminsInfo', isSuperAdmin],
    queryFn: async () => {
      const adminRequests = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `/admin/pendingadmins`);
      console.log(adminRequests.data, "admin list for pending count");
      setRequests(adminRequests.data.data);
      // const pendingAdmins = admins.filter(admin => !admin.approved && !admin.rejected);
      setPendingCount(adminRequests.length);
      return adminRequests;
    },
  });



  useEffect(() => {
    console.log(requests)
  }, [requests])


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const superAdminMenus = [
    { href: '/admin/dashboard', label: '대시보드', icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" /></svg>) },
    {
      href: '/admin/request',
      label: '관리자 목록',
      badge: pendingCount > 0 ? pendingCount : null,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M412-168q45-91 120-121.5T660-320q23 0 45 4t43 10q24-38 38-82t14-92q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 45 11.5 86t34.5 76q41-20 85-31t89-11q32 0 61.5 5.5T500-340q-23 12-43.5 28T418-278q-12-2-20.5-2H380q-32 0-63.5 7T256-252q32 32 71.5 53.5T412-168Zm68 88q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM380-420q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T440-560q0-25-17.5-42.5T380-620q-25 0-42.5 17.5T320-560q0 25 17.5 42.5T380-500Zm280 120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-480Z" /></svg>)
    },
    // { href: '/admin/list', label: '관리자 목록', icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M412-168q45-91 120-121.5T660-320q23 0 45 4t43 10q24-38 38-82t14-92q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 45 11.5 86t34.5 76q41-20 85-31t89-11q32 0 61.5 5.5T500-340q-23 12-43.5 28T418-278q-12-2-20.5-2H380q-32 0-63.5 7T256-252q32 32 71.5 53.5T412-168Zm68 88q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM380-420q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T440-560q0-25-17.5-42.5T380-620q-25 0-42.5 17.5T320-560q0 25 17.5 42.5T380-500Zm280 120q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-480Z" /></svg>) },
    { href: '/admin/certificates/request', label: '수료증 요청 관리', icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m387-412 35-114-92-74h114l36-112 36 112h114l-93 74 35 114-92-71-93 71ZM240-40v-309q-38-42-59-96t-21-115q0-134 93-227t227-93q134 0 227 93t93 227q0 61-21 115t-59 96v309l-240-80-240 80Zm240-280q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70ZM320-159l160-41 160 41v-124q-35 20-75.5 31.5T480-240q-44 0-84.5-11.5T320-283v124Zm160-62Z" /></svg>) },
    { href: '/admin/userhistory', label: '사용자 목록' , icon : (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-246q54-53 125.5-83.5T480-360q83 0 154.5 30.5T760-246v-514H200v514Zm280-194q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm69-80h422q-44-39-99.5-59.5T480-280q-56 0-112.5 20.5T269-200Zm211-320q-25 0-42.5-17.5T420-580q0-25 17.5-42.5T480-640q25 0 42.5 17.5T540-580q0 25-17.5 42.5T480-520Zm0 17Z"/></svg>)},
    { href: '/admin/users', label: '수료증 통계 이력', icon : (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M420-360h120l-23-129q20-10 31.5-29t11.5-42q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 23 11.5 42t31.5 29l-23 129Zm60 280q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"/></svg>) },
    { href: '/admin/profile', label: '내 정보', icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></svg>) },
    { href: '/admin/edit', label: '정보 수정', icon: (<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z" /></svg>) }
  ];

  const adminMenus = [
    { href: '/admin/dashboard', label: '대시보드' },
    { href: '/admin/certificates/request', label: '수료증 요청 목록' },
    { href: '/admin/users', label: '수료증 통계 이력' },
    { href: '/admin/userhistory', label: '사용자 목록' },
    { href: '/admin/profile', label: '내 정보' },
    { href: '/admin/edit', label: '정보 수정' }
  ];

  const menus = isSuperAdmin ? superAdminMenus : adminMenus;

  return (
    <div  >
      {/* 모바일 햄버거 메뉴 버튼 */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-whiteback border  shadow-sm hover:bg-gray-50"
        aria-label="메뉴 열기"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
          <div className="w-5 h-0.5 bg-gray-600"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
        </div>
      </button>

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-80 lg:w-64 
          bg-grayblack 
          overflow-y-auto flex-shrink-0 
          top-0 left-0 z-40
           rounded-tl-[21px] rounded-bl-[21px]
           m-3 py-4
          h-[calc(100vh-24px))]
        `}
      >
        {/* 상단 로고 */}
        <div className="flex items-center  font-noto-serif px-6 h-16 ">
          <Image src="/images/logo.png" alt="logo" width={60} height={10}></Image>
          <Link href="/admin/dashboard">
            <span className="text-2xl inli font-bold text-whiteback tracking-tight">
              Sealium
            </span>
          </Link>
        </div>

        {/* 모바일 헤더 */}
        <div className="lg:hidden flex items-center justify-between p-4  ">
          <Link href="/admin/dashboard">
            <span className="text-xl font-bold font-noto-serif text-whiteback tracking-tight">
              Sealium
            </span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="메뉴 닫기"
          >
            <div className="w-6 h-6 relative">
              <div className="absolute top-1/2 left-1/2 w-5 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
              <div className="absolute top-1/2 left-1/2 w-5 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
            </div>
          </button>
        </div>

        {/* 관리자 정보 (모바일에서만 표시) */}
        {admin && (
          <div className="lg:hidden p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="font-semibold text-sm">
                  {admin.userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{admin.userName}</p>
                <p className="text-xs text-gray-500">
                  {isSuperAdmin ? '슈퍼 관리자' : '관리자'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 네비게이션 */}
        <nav className="p-4 py-10">
          <ul className="space-y-2">
            {menus.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={handleMenuClick}>
                  <div
                    className={`
              flex items-center gap-3 px-8 py-3 text-md rounded-lg transition-colors 
              ${isActive(item.href)
                        ? 'bg-whiteback text-black font-medium'
                        : 'text-whiteback hover:bg-gray-100 hover:text-gray-900'
                      }
            `}
                  >
                    {/* Icon here */}
                    {item.icon && (
                      <span className="flex-shrink-0  ">{item.icon}</span>
                    )}

                    {/* Label */}
                    <span>{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>


        {/* 하단 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-16">
          <button
            onClick={() => {
              localStorage.removeItem('currentAdmin');
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center px-4 py-3 cursor-pointer font-medium text-whiteback   rounded-lg hover:bg-whiteback hover:text-black transition-colors"
          >
            <div className="relative">
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
            로그아웃
          </button>
        </div>
      </aside>
    </div>
  );
}