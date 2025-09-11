"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminInfoStore, useIsSuperAdminStore } from "../../../Store/useAdminStore";
import { useQuery } from "@tanstack/react-query";
import DonutPieChart from "../../../components/Charts/Piechart";
// import MultiXAxisLineChart from "../../../components/Charts/MultipleXchart";
import axios from "axios";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// 메인 대시보드 컴포넌트
export default function DashboardContent() {

  const router = useRouter();
  // const [admin, setAdmin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [approvedCount, setApprovedCount] = useState([]);
  const [totalStats, setTotalStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    issueCount: 0,
    revokeCount: 0,
  })
  const [alltotalStats, setAllTotalStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    issueCount: 0,
    revokeCount: 0,
  })

  const [stats, setStats] = useState({
    // 슈퍼관리자용 통계
    totalInstitutions: 0,
    totalAdmins: 0,
    pendingAdmins: 0,
    totalCertificates: 0,
    // 일반관리자용 통계
    todayIssued: 0,
    monthlyIssued: 0,
    myCertificates: 0,
    pendingRequests: 0,
  });
  // https://dev.codedesign.ai/app/builder?project=certificationadminixvi3crh6z#home
  const [recentProcessed, setRecentProcessed] = useState([]);
  const [filteredProcessed, setFilteredProcessed] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [currentPage, setCurrentPage] = useState(1); // 페이지네이션을 위한 현재 페이지 상태
  const [pagiIndex, setPagiIndex] = useState(0);
  const [rawData, setMultiChartData] = useState([]);

  const itemsPerPage = 10; // 페이지당 항목 수
  const { admin } = useAdminInfoStore();
  const { isSuperAdmin, setIsSuperAdmin } = useIsSuperAdminStore();

  const [chartData, setChartData] = useState({ dates: [], counts: [] });
  useEffect(() => {
    if (!rawData || rawData.length === 0) return
    console.log(rawData, 'multiplex');
    // This effect runs whenever the rawData prop changes
    const dates = Object.keys(rawData).sort();
    const counts = dates.map(date => rawData[date]);
    setChartData({ dates, counts });
  }, [rawData]);

  const option = {
    // ... (rest of your chart options)

    xAxis: {
      type: "category",
      data: chartData.dates // Use your processed date array
    },
    yAxis: {
      type: "value",
      name: "총 수료증 개수"
    },
    series: [
      {
        name: "Certificates Issued",
        type: "line",
        smooth: true,
        data: chartData.counts // Use your processed counts array
      }
    ]
  };


  useEffect(() => {
    console.log("Admin state updated:", admin);
    const TotalUserAndAdminsData = async () => {
      const TotalUserAndAdmins = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "/admin/gettotaluna")
      console.log(TotalUserAndAdmins.data.TotalAdmins, 'TotalUserAndAdmins')
      setTotalAdmins(TotalUserAndAdmins.data.TotalAdmins)
      setTotalUsers(TotalUserAndAdmins.data.TotalUsers)
    }
    TotalUserAndAdminsData()
    setIsSuperAdmin(admin?.grade === 2);
  }, [admin]);

  // 필터링 및 검색 로직
  useEffect(() => {
    let filtered = recentProcessed;

    // 상태 필터 적용
    if (activeFilter === 'approved') {
      filtered = filtered.filter(req =>
        req.status === 'approved'
      );
    } else if (activeFilter === 'rejected') {
      filtered = filtered.filter(req => req.status === 'rejected');
    } else if (activeFilter === 'revoked') {
      filtered = filtered.filter(req =>
        req.status === 'approved' && req.request === 'revoke'
      );
    }

    // 날짜 필터 적용
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(req => {
        const processedDate = new Date(req.createdAt);

        if (dateFilter === 'today') {
          return processedDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return processedDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 30);
          return processedDate >= monthAgo;
        }
        return true;
      });
    }

    // 검색어 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.userName?.toLowerCase().includes(query) ||
        req.certificateName?.toLowerCase().includes(query) ||
        req.reason?.toLowerCase().includes(query)
      );
    }

    setFilteredProcessed(filtered);
    setCurrentPage(1); // 필터링/검색 시 페이지를 1로 리셋
  }, [recentProcessed, activeFilter, searchQuery, dateFilter]);

  useEffect(() => {

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const newtoday = new Date(today).toLocaleDateString('ko-KR');
    const newDailyFiltered = recentProcessed.filter(req => {
      const processedDate = new Date(req.createdAt).toLocaleDateString('ko-KR');
      console.log(req, 'processedDate', newtoday.toString(), processedDate)
      const d1 = new Date(processedDate)
      const d2 = new Date(newtoday)
      console.log(d1 >= d2, 'd1,d2')
      // if(processedDate >= today) return 
      return d1 >= d2;
    })

    console.log(newDailyFiltered, 'newDailyFiltered')
    const approvedCount = newDailyFiltered.filter(req => req.status === 'approved')
    const pendingCount = newDailyFiltered.filter(req => req.status === 'pending').length;
    const issueCount = newDailyFiltered.filter(req => req.status === 'pending' && req.request === 'issue').length;
    const revokeCount = newDailyFiltered.filter(req => req.status === 'pending' && req.request === 'revoke').length;

    const AllapprovedCount = recentProcessed.filter(req => req.status === 'approved')
    const AllpendingCount = recentProcessed.filter(req => req.status === 'pending').length;
    const AllissueCount = recentProcessed.filter(req => req.status === 'pending' && req.request === 'issue').length;
    const AllrevokeCount = recentProcessed.filter(req => req.status === 'pending' && req.request === 'revoke').length;

    setTotalStats((prev) => ({
      ...prev,
      approvedCount: approvedCount.length,
      pendingCount,
      issueCount,
      revokeCount
    }))

    setAllTotalStats((prev) => ({
      ...prev,
      approvedCount: AllapprovedCount.length,
      pendingCount: AllpendingCount,
      issueCount: AllissueCount,
      revokeCount: AllrevokeCount
    }))
  }, [recentProcessed])

  useEffect(() => {
    const ApprovedCount = async () => {

      const approvedVcData = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "/admin/vcrequestlogs")
      console.log('record', approvedCount)
      console.log(approvedVcData.data.data, 'approvedVcData')
      const processedData = approvedVcData.data.data.reduce((acc, record) => {
        if (record.createdAt) {
          const date = new Date(record.createdAt);

          // Create a key in YYYY-MM-DD format
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');

          const dayKey = `${year}-${month}-${day}`;
          // Increment the count for the specific day
          if (!acc[dayKey]) {
            acc[dayKey] = 0;
          }
          acc[dayKey]++;
        }
        return acc;
      }, {});
      setMultiChartData(processedData);
    }
    ApprovedCount()
  }, [])

  //   // const processedRequests = JSON.parse(localStorage.getItem('admin_processed_requests') || '[]');
  //   const { data: {data : processedRequests}} = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "/admin/getallvcinfo")

  //   console.log(processedRequests, 'processedRequests')

  //   const sortedRequests = processedRequests.approvedVc
  //     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  //   setRecentProcessed(sortedRequests.approvedVc);
  // };

  useEffect(() => {
    const getProcessedRequests = async () => {
      const { data: { data: processedRequests } } = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + "/admin/getallvcinfo")
      console.log(processedRequests, 'processedRequests')
      const sortedRequests = processedRequests
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort descending for recent items first
      setRecentProcessed(sortedRequests);
      console.log(sortedRequests, 'sortedRequests')
    }
    getProcessedRequests()
    // loadDashboardStats()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    router.push("/admin");
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleDateFilterClick = (filter) => {
    setDateFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // 날짜 필터별 개수 계산
  const getDateFilterCount = (filter) => {
    if (filter === 'all') return recentProcessed.length;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return recentProcessed.filter(req => {
      const processedDate = new Date(req.processedAt || req.requestedAt);

      if (filter === 'today') {
        return processedDate >= today;
      } else if (filter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return processedDate >= weekAgo;
      } else if (filter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return processedDate >= monthAgo;
      }
      return false;
    }).length;
  };

  const getFilterCount = (filter) => {
    // console.log(recentProcessed, 'recentProcessed')
    if (filter === 'all') return recentProcessed.length;
    if (filter === 'approved') return recentProcessed.filter(req =>
      req.status === 'approved'
    ).length;
    if (filter === 'rejected') return recentProcessed.filter(req => req.status === 'rejected' && req.request === 'issue').length;
    if (filter === 'revoked') return recentProcessed.filter(req =>
      req.status === 'approved' && req.request === 'revoke'
    ).length;
    return 0;
  };

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredProcessed.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedItems = filteredProcessed.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }



  // const isSuperAdmin = admin.grade === 2;


  return (
    <div className="flex min-h-screen rounded-2xl text-textIcon bg-deepnavy">
      <div className="flex-1 ml-64 p-6 flex flex-col">
        <main className="flex-1 overflow-y-auto px-4 lg:px-12 lg:py-0 py-6 max-w-8xl mx-auto w-full">
          {/* 환영 메시지 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-darkergray mb-2">
              환영합니다, {admin?.name || admin?.userName || "관리자"}님
            </h1>
            <p className="text-sm sm:text-base text-darkergray">
              {isSuperAdmin
                ? "수료증 발급 기관과 관리자를 관리하는 슈퍼관리자 대시보드입니다."
                : "수료증 발급 및 관리를 위한 관리자 대시보드입니다."}
            </p>
          </div>

          {/* 메인 그리드 */}
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className=" rounded-2xl shadow-sm border bg-darkergray text-textIcons border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                내 관리 현황
              </h2>

              {isSuperAdmin ? (
                <div className="grid grid-cols-2 md:grid-cols-3 h-30  lg:grid-cols-6 gap-4">

                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl">
                    <p className=" mb-6  text-lg font-medium">전체 관리자</p>
                    <p className="text-3xl font-medium ">{totalAdmins || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">전체 사용자</p>
                    <p className="text-3xl font-medium ">{totalUsers || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl">
                    <p className=" mb-6  text-lg font-medium">전체 수료증</p>
                    <p className="text-3xl font-medium">{alltotalStats.approvedCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">전체 요청</p>
                    <p className="text-3xl font-medium ">{alltotalStats.pendingCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl  ">
                    <p className=" mb-6  text-lg font-medium">발급 요청</p>
                    <p className="text-3xl font-medium ">{alltotalStats.issueCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">폐기 요청</p>
                    <p className="text-3xl font-medium ">{alltotalStats.revokeCount || 0}</p>
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">전체 사용자</p>
                    <p className="text-3xl font-medium ">{totalUsers || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl">
                    <p className="text-sm mb-1 font-medium">전체 수료증</p>
                    <p className="text-3xl font-medium">{totalStats.approvedCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">전체 요청</p>
                    <p className="text-3xl font-medium ">{totalStats.pendingCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl  ">
                    <p className=" mb-6  text-lg font-medium">발급 요청</p>
                    <p className="text-3xl font-medium ">{totalStats.issueCount || 0}</p>
                  </div>
                  <div className="text-center bg-darkergray p-4 shadow-2xl rounded-xl ">
                    <p className=" mb-6  text-lg font-medium">폐기 요청</p>
                    <p className="text-3xl font-medium ">{totalStats.revokeCount || 0}</p>
                  </div>

                </div>
              )}
            </div>
            <div className="flex  justify-between gap-6 ">
              <div className="w-[1100px] rounded-2xl " >
                {/* <MultiXAxisLineChart rawData={MultiChartData } style={{ height: "100%", width: "100%" }} /> */}
                <div className="p-6 bg-darkergray rounded-xl shadow-md">
                  <h2 className="text-lg font-semibold mb-4">일일 수료증 발급 현황</h2>
                  <ReactECharts option={option} style={{ height: 400 }} />
                </div>
              </div>
              <div className="w-[350px] h-[300px] md:h-[400px]  rounded-2xl">
                <DonutPieChart totalCert={totalStats.approvedCount} totalRequest={totalStats.pendingCount} issueRequest={totalStats.issueCount} revokeRequest={totalStats.revokeCount} style={{ height: "100%", width: "100%" }} />
              </div>
            </div>
            {/* 최근 처리한 수료증 내역 */}
            <div className="bg-darkergray rounded-2xl min-h-200 shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-textIcons">최근 처리 내역</h3>
                </div>
                {/* 검색바 */}
                <div className="mb-8">
                  <div className="relative ">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="사용자명, 수료증명 검색..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="block w-full h-15 pl-10 pr-10 text-md py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400   focus:border-transparent "
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {/* 필터 섹션 */}
                <div className="space-y-3  flex justify-around">
                  {/* 상태 필터 버튼들 */}
                  <div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <h4 className=" font-medium text-gray-700 ">상태별 필터 : </h4>
                      <button
                        onClick={() => handleFilterClick('all')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'all'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        전체 ({getFilterCount('all')})
                      </button>
                      <button
                        onClick={() => handleFilterClick('approved')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'approved'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        승인된 수료증 ({getFilterCount('approved')})
                      </button>
                      <button
                        onClick={() => handleFilterClick('rejected')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'rejected'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        거절된 수료증 ({getFilterCount('rejected')})
                      </button>
                      <button
                        onClick={() => handleFilterClick('revoked')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'revoked'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        폐기한 수료증 ({getFilterCount('revoked')})
                      </button>
                    </div>
                  </div>
                  {/* 날짜 필터 버튼들 */}
                  <div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <h4 className="font-medium text-gray-700 ">기간별 필터 : </h4>
                      <button
                        onClick={() => handleDateFilterClick('all')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${dateFilter === 'all'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        전체 기간 ({getDateFilterCount('all')})
                      </button>
                      <button
                        onClick={() => handleDateFilterClick('today')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${dateFilter === 'today'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        오늘 ({getDateFilterCount('today')})
                      </button>
                      <button
                        onClick={() => handleDateFilterClick('week')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${dateFilter === 'week'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        지난 7일 ({getDateFilterCount('week')})
                      </button>
                      <button
                        onClick={() => handleDateFilterClick('month')}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${dateFilter === 'month'
                          ? 'bg-deepnavy text-whiteback shadow-xl'
                          : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                          }`}
                      >
                        지난 30일 ({getDateFilterCount('month')})
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {filteredProcessed.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {searchQuery ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {searchQuery ?
                      `"${searchQuery}"에 대한 검색 결과가 없습니다` :
                      activeFilter === 'all' ? '아직 처리한 요청이 없습니다' :
                        activeFilter === 'approved' ? '승인된 발급 요청이 없습니다' :
                          activeFilter === 'rejected' ? '거절된 요청이 없습니다' :
                            '폐기한 수료증이 없습니다'
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    {searchQuery ?
                      '다른 검색어로 시도해보세요' :
                      '수료증 요청을 처리하면 여기에 표시됩니다'
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      검색 초기화
                    </button>
                  )}
                </div>
              ) : (

                <div className="  min-h-150 p-6 flex flex-col justify-between rounded-lg shadow overflow-hidden">
                  <div>
                    <div className="space-y-3 p-4 md:p-6">
                      {/* 헤더 - 데스크톱에서만 표시 */}
                      <div className="hidden md:grid grid-cols-[80px_150px_150px_1fr_1fr_1fr_1fr] text-center gap-4 px-6 py-3 bg-gray-50 rounded-lg  font-medium text-textIcons uppercase tracking-wider">
                        <div>번호</div>
                        <div>사용자 ID</div>
                        <div>요청 유형</div>
                        <div>과정명</div>
                        <div>내용</div>
                        <div>처리일</div>
                        <div>상태</div>

                      </div>

                      {/* 데이터 행들 */}
                      {paginatedItems.map((request, index) => (
                        <div key={request._id || (startIndex + index)} className="bg-white border  border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">

                          {/* 모바일 레이아웃 */}
                          <div className="md:hidden space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {/* <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {request.userName?.charAt(0) || request.userId?.charAt(0) || 'U'}
                                </span>
                              </div> */}
                                <div className="text-sm font-medium text-gray-900">
                                  {highlightText(request.userName || request.userId, searchQuery)}
                                </div>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${request.action === 'approved' ? 'bg-green-100 text-green-700'
                                : request.action === 'rejected' ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {request.action === 'approved'
                                  ? (request.requestType === 'revoke' ? '폐기됨' : '승인됨')
                                  : request.action === 'rejected' ? '거절됨' : '처리됨'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="">유형: </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${request.requestType === 'issue'
                                  ? 'bg-blue-100 text-blue-700'
                                  : request.requestType === 'revoke'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {request.requestType === 'issue' ? '신규발급'
                                    : request.requestType === 'revoke' ? '폐기요청'
                                      : '재발급'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">처리일: </span>
                                <span className="text-gray-900">
                                  {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-gray-500">과정명: </span>
                                <span className="text-gray-900">
                                  {highlightText(request.certificateName, searchQuery)}
                                </span>
                              </div>
                              {request.reason && (
                                <div className="text-sm">
                                  <span className="text-gray-500">사유: </span>
                                  <span className="text-gray-700">
                                    {highlightText(request.reason, searchQuery)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 데스크톱 레이아웃 */}
                          <div className="hidden  text-center md:grid grid-cols-[80px_150px_150px_1fr_1fr_1fr_1fr] gap-4 items-center">
                            <div>{startIndex + index + 1}</div>
                            {/* <div className="flex items-center space-x-3"> */}
                            {/* <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {request.userName?.charAt(0) || request.userId?.charAt(0) || 'U'}
                              </span>
                            </div> */}
                            {/* </div> */}
                            <div className="text-sm  font-medium text-gray-900">
                              {highlightText(request.userName || request.userId, searchQuery)}
                            </div>

                            <div>
                              <span className={`inline-flex px-4 py-2 text-xs text-whiteback font-medium rounded ${request.request === 'issue'
                                ? 'bg-borderbackblue '
                                : request.request === 'revoke'
                                  ? 'bg-red-800 '
                                  : 'bg-yellow-700 '
                                }`}>
                                {request.request === 'issue' ? '발급요청'
                                  : request.request === 'revoke' ? '폐기요청'
                                    : '발급 완료'}
                              </span>
                            </div>

                            <div className="text-sm text-gray-900 truncate">
                              {highlightText(request.certificateName, searchQuery)}
                            </div>

                            <div className="text-sm text-gray-500 truncate">
                              {request.description || "-"}
                            </div>

                            <div className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                            </div>

                            <div>
                              <span className={`inline-flex px-6 py-2 w-25 text-center text-xs text-whiteback font-medium rounded ${request.status === 'approved' ? 'bg-deepnavy '
                                : request.status === 'rejected' ? 'bg-red-900 '
                                  : 'bg-yellow-900 '
                                }`}>
                                {request.status === 'approved'
                                  ? (request.request === 'revoke' ? '폐기 완료' : '승인 완료')
                                  : request.status === 'rejected' ? '거절 완료' : '처리 중'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {totalPages && (
                    <div className=" mt-12 mb-15 flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 cursor-pointer py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 "
                      >
                        이전
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 border border-borderbackblue rounded-lg cursor-pointer ${currentPage === pageNum
                                ? 'bg-borderbackblue text-white '
                                : ' hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 cursor-pointer py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 "
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
