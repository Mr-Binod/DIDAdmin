"use client";
import React, { useState, useEffect, useMemo, Fragment } from "react";
import LoadingSpinner from "../../../components/UI/Spinner";
import Modal from "../../../components/UI/Modal";
import Input from "../../../components/UI/Input";
import axios from "axios";
import Button from "../../../components/UI/Button";
import { MultiXAxisLineChart } from "../../../components/Charts/Piechart";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const CopyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);


export default function LoginHistoryPage() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [copiedDid, setCopiedDid] = useState(null);
  const [activeOrder, setActiveOrder] = useState("newest");
  const [activeFilter, setActiveFilter] = useState("newest");
  const [rawData, setRawData] = useState([]);
  const [newUsersData, setNewUsersData] = useState([]);
  const [todayVisitorsData, setTodayVisitorsData] = useState([]);
  const [chartData, setChartData] = useState({ dates: [], counts: [] });
  const itemsPerPage = 10;

  useEffect(() => {
    // loadRecords();
    const loaduserData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/users`);
        console.log(data.data, 'userData');
        // The useEffect below will handle sorting, so we can set the raw records here.
        setRecords(data.data || []);
      } catch (error) {
        console.error("Failed to load user data:", error);
        setResultMessage("사용자 기록을 불러오는 중 오류가 발생했습니다.");
        setShowResultModal(true);
      } finally {
        setLoading(false);
      }
    };
    loaduserData();
  }, []);

  useEffect(() => {
    let filtered = [...records];

    // 검색 (DID 또는 이름 기반)
    if (searchTerm.trim()) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rec) =>
          rec.didAddress?.toLowerCase().includes(lowercasedSearchTerm) ||
          rec.userName?.toLowerCase().includes(lowercasedSearchTerm) ||
          rec.userId?.toLowerCase().includes(lowercasedSearchTerm) ||
          rec.birthDate?.toLowerCase().includes(lowercasedSearchTerm) ||
          rec.didAddress?.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      // else if (sortBy === "nameAsc") {
      //   return a.name.localeCompare(b.name, "ko");
      // } else if (sortBy === "nameDesc") {
      //   return b.name.localeCompare(a.name, "ko");
      // }
      return 0;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1); // 검색이나 정렬 바뀔 때 첫 페이지로
  }, [records, searchTerm, sortBy]);


  useEffect(() => {
    if (!newUsersData || newUsersData.length === 0) return
    console.log(newUsersData, 'multiplex111');
    // This effect runs whenever the rawData prop changes
    const dates = Object.keys(newUsersData).sort();
    const counts = dates.map(date => newUsersData[date]);
    setChartData({ dates, counts });
  }, [newUsersData]);

  useEffect(() => {
    if (!todayVisitorsData || todayVisitorsData.length === 0) return
    console.log(todayVisitorsData, 'multiplex222');
    // This effect runs whenever the rawData prop changes
    const dates = Object.keys(todayVisitorsData).sort();
    const counts = dates.map(date => todayVisitorsData[date]);
    setChartData({ dates, counts });
  }, [todayVisitorsData]);

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
  const option2 = {
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

  // 통계
  const stats = useMemo(() => {

    const total = records.length;
    const today = new Date().toISOString().split("T")[0];
    console.log(today, 'today', records, 'records')
    const newUsers = records.filter((rec) => rec.createdAt.split("T")[0] >= today).length;
    const todayVisitors = records.filter((rec) => rec.updatedAt.split("T")[0] >= today).length;

    console.log(todayVisitors, 'todayVisitors')
    if (total === 0) return { total: 0, totalIssuedVCs: 0, totalVerifiedVCs: 0 }
    const totalIssuedVCs = records?.reduce(
      (sum, rec) => sum + (rec.issuedVCs || 0),
      0
    );
    const totalVerifiedVCs = records?.reduce(
      (sum, rec) => sum + (rec.verifiedVCs || 0),
      0
    );
    return { total, totalIssuedVCs, totalVerifiedVCs, newUsers, todayVisitors };
  }, [records]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const reducedNewUsers = records.reduce((acc, rec) => {
      if (rec.createdAt) {
        const date = rec.createdAt.split("T")[0];
        if (date >= today) {
          acc[date] = (acc[date] || 0) + 1;
        }
      }
      return acc;
    }, {});
    const reducedTodayVisitors = records.reduce((acc, rec) => {
      if (rec.updatedAt) {
        const date = rec.updatedAt.split("T")[0];
        if (date >= today) {
          acc[date] = (acc[date] || 0) + 1;
        }
      }
      return acc;
    }, {});
    console.log(reducedNewUsers, 'reducedNewUsers', reducedTodayVisitors, 'reducedTodayVisitors')
    setNewUsersData(reducedNewUsers);
    setTodayVisitorsData(reducedTodayVisitors);
  }, [records])

  const handleCopy = (did) => {
    navigator.clipboard.writeText(did);
    setCopiedDid(did);
    setTimeout(() => setCopiedDid(null), 2000); // Reset after 2 seconds
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultMessage("");
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // 페이지네이션된 데이터
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="w-[calc(100wd - 64px)] bg-deepnavy overflow-hidden pb-10">
      <div className="min-h-screen ml-64 p-6 sm:p-6">
        <div className="max-w-8xl space-y-6 px-12 mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-8 ">
            <h1 className="text-2xl sm:text-3xl font-bold text-whiteback mb-2">사용자 목록 확인</h1>
            <p className="text-whiteback ">사용자의 개인 정보 확인할수 있습니다.</p>
          </div>

          {/* 통계 카드 - 대기중 요청만 표시 */}
          <div className=" rounded-2xl text-textIcons bg-darkergray gap-4 p-6 mb-6">
            <h2 className="text-lg font-bold  mb-6">
              수료증 요청
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 px-15 gap-30'>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">전체 사용자</div>
                <div className="text-3xl  font-medium ">{stats.total}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">일일 가입 사용자</div>
                <div className="text-3xl  font-medium ">{stats.newUsers || 0}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">일일 방문 사용자</div>
                <div className="text-3xl  font-medium ">{stats.todayVisitors || 0}</div>
              </div>

            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <div className=" rounded-2xl " >
              {/* <MultiXAxisLineChart rawData={MultiChartData } style={{ height: "100%", width: "100%" }} /> */}
              <div className="p-6 bg-darkergray rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">일일 가입 사용자</h2>
                <ReactECharts option={option} style={{ height: 300 }} />
              </div>
            </div>
            <div className=" rounded-2xl " >
              {/* <MultiXAxisLineChart rawData={MultiChartData } style={{ height: "100%", width: "100%" }} /> */}
              <div className="p-6 bg-darkergray rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">일일 방문 사용자 차트</h2>
                <ReactECharts option={option2} style={{ height: 300 }} />
              </div>
            </div>
            {/* <div>
              <MultiXAxisLineChart rawData={newUsersData} title={'일일 가입 사용자'} />
            </div>
            <div>
              <MultiXAxisLineChart rawData={todayVisitorsData} title={'일일 방문 사용자'} />
            </div> */}
          </div>
          {/* 검색 및 필터 */}
          <div className="bg-darkergray rounded-2xl min-h-200 shadow-sm border border-gray-200">
            {/* <div className=" rounded-xl border border-gray-200 shadow-sm mb-6"> */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-textIcons">사용자 목록</h3>
              </div>
              {/* 검색 및 액션 */}
              <div className='relative mb-8'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="이름, 아이디, 생년월일, DID 공개키로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full h-15 pl-10 pr-10 text-md py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400   focus:border-transparent "
                /></div>
              <div className="flex flex-wrap gap-2 items-center justify-around">

                <div className="flex gap-2 items-center ">
                  <h4 className=" font-medium  ">정렬 기준: </h4>
                  <button
                    onClick={(e) => { setSortBy('newest'); setActiveOrder('newest') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeOrder === 'newest'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >
                    최신순
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setSortBy('oldest'); setActiveOrder('oldest') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeOrder === 'oldest'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >
                    오래된순
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>

                </div>
                <div className="w-200"></div>
              </div>

            </div>
            <div className="  min-h-150 p-6 flex flex-col justify-between rounded-lg shadow-lg text-textIcons overflow-hidden">
              <div className='space-y-3'>
                {loading ? (
                  <div className="p-12 text-center">
                    <LoadingSpinner message="요청 목록 로딩 중..." />
                  </div>
                ) : paginatedRequests.length === 0 ? (
                  <div className="p-12 text-center ">
                    <p className="text-lg mb-2">처리할 요청이 없습니다</p>
                    <p className="">선택한 조건에 맞는 요청이 없습니다.</p>
                  </div>
                ) : (
                  <Fragment >
                    <div className="hidden  md:grid grid-cols-[80px_130px_130px_130px_130px_1fr_1fr_130px] gap-4 text-center px-6 py-3 bg-gray-50 rounded-t-lg  font-medium  uppercase tracking-wider">

                      <div className="col-span-1">번호</div>
                      <div className="col-span-1">이름</div>
                      <div className="col-span-1">닉네임</div>
                      <div className="col-span-1">아이디</div>
                      <div className="col-span-1">생년월일</div>
                      <div className="col-span-1">주소</div>
                      <div className="col-span-1">사용자 DID</div>
                      <div className="col-span-1">가입 날짜</div>
                    </div>
                    <div className="space-y-2 text-center divide-gray-200">
                      {paginatedRequests.map((request, index) => (
                        <div key={request.userId} className="bg-white px-6 rounded-lg py-4 text-sm hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-[80px_130px_130px_130px_130px_1fr_1fr_130px] text-center gap-4 items-center">
                            {/* Mobile View */}
                            <div>{((currentPage - 1) * itemsPerPage) + index + 1}</div>
                            <div className="md:hidden space-y-3">
                              <div className="flex items-center justify-between">
                                <img src={request.imgPath || '/images/default-avatar.png'} className="w-9 h-9 rounded-full object-cover" alt={`${request.userName} profile`} />
                                <div className="font-medium ">{request.userName}</div>
                                <span className=''>
                                  사용자 ID : {request.userId}
                                </span>
                              </div>
                              <div className=" ">회사명 : {request.company}</div>
                              <div className=" ">요청일 : {formatDate(request.createdAt)}</div>
                              <div className="flex gap-2 pt-2">
                                <Button onClick={() => handleAction(request, 'approve')} className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded ">승인</Button>
                                <Button onClick={() => handleAction(request, 'reject')} className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded ">거절</Button>
                              </div>
                            </div>

                            {/* Desktop View */}
                            <div className="flex items-center gap-2">
                              <img src={request.imgPath || '/images/default-avatar.png'} className="w-9 h-9 rounded-full object-cover" alt={`${request.userName} profile`} />
                              <span className="hidden md:block col-span-1  font-medium ">{request.userName}</span>
                            </div>
                            <div className=" ">{request.nickName}</div>
                            <div className="hidden md:block col-span-1">
                              <span >
                                {request.userId}
                              </span>
                            </div>
                            <div className="hidden md:block col-span-1  ">{(request.birthDate)}</div>
                            <div className="hidden md:block col-span-1  ">{(request.address)}</div>
                            <div className="hidden  md:flex col-span-1 w-[calc(100%-40px)] justify-center overflow-ellipsis overflow-hidden ">
                              <span className="truncate ">
                                {request.didAddress}
                              </span>
                              <button onClick={() => handleCopy(request.didAddress)} className="cursor-pointer hover:text-blue-600 transition-colors">
                                {copiedDid === request.didAddress ? (
                                  <span className="text-xs text-blue-600">Copied!</span>
                                ) : (
                                  <CopyIcon className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="hidden md:block col-span-1  ">{(request.createdAt).split('T')[0]}</div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </Fragment>
                )}
              </div>
              <div>
                {/* 페이지네이션 */}
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
                )}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
