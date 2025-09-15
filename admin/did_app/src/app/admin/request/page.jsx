"use client";
import React, { useState, useEffect, useMemo, Fragment } from "react";
import Button from "../../../components/UI/Button";
import Modal from "../../../components/UI/Modal";
import LoadingSpinner from "../../../components/UI/Spinner";
import Input from "../../../components/UI/Input";
import { useAdminRequestStore, useIsSuperAdminStore, useStatusFilterStore, } from "../../../Store/useAdminStore";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import Processing from "../../../components/UI/Processing";

// 요청 상태별 배지 스타일
const getStatusBadge = (approved, rejected) => {
  if (approved) {
    return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
  }
  if (rejected) {
    return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
  }
  return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
};

const getStatusText = (approved, rejected) => {
  if (approved) return "승인됨";
  if (rejected) return "거절됨";
  return "승인 대기";
};

export default function AdminRequestPage() {
  // const [requests, setRequests] = useState([]);
  const { requests, setRequests } = useAdminRequestStore();
  const { isSuperAdmin } = useIsSuperAdminStore();
  const { statusFilter, setStatusFilter } = useStatusFilterStore();

  const [processing, setProcessing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [load, setLoad] = useState(false);
  const [verified, setVerified] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [activeOrder, setActiveOrder] = useState("newest");
  const [activeFilter, setActiveFilter] = useState("pending");
  //  const [showProcessModal, setShowProcessModal] = useState(false);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (statusFilter !== 'approved') return;
    const HandleApproved = async () => {
      const { data } = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/admin/admins')
      console.log(data, 'adminadmins');
      console.log(statusFilter, 'statusfilter');
      setRequests(data.data)
    }
    HandleApproved()
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter !== 'rejected') return;
    const HandleApproved = async () => {
      const { data } = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + '/admin/rejectedadmins')
      console.log(data, 'rejectedadmins');
      setRequests(data.data)
    }
    HandleApproved()
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter !== 'pending') return;
    // This assumes there is a `useQuery` hook (likely in a parent component or custom hook)
    // with the queryKey ['adminsInfo', isSuperAdmin] that fetches the list of admins.
    // The query's fetch function should ideally use the `statusFilter` from the Zustand store
    // to fetch the correct list (pending, approved, or rejected).
    // Invalidating the query will trigger a refetch with the new filter.
    queryClient.invalidateQueries({ queryKey: ['adminsInfo'] });
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    let tempRequests = [...requests];

    // 검색 필터
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      tempRequests = tempRequests.filter(request =>
        (request.userName?.toLowerCase().includes(lowercasedTerm)) ||
        (request.userId?.toLowerCase().includes(lowercasedTerm)) ||
        (request.company?.toLowerCase().includes(lowercasedTerm))
      );
    }

    // 정렬
    tempRequests.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "name") {
        return (a.userName || "").localeCompare(b.userName || "");
      }
      return 0;
    });

    return tempRequests;
  }, [requests, searchTerm, sortBy]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  // 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortBy]);

  // 통계 상태
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });


  // 통계 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await axios.get('https://api.sealiumback.store/admin/getalladminstotalnum');
        const total = data.Totaladmins + data.TotalPendingAdmins + data.TotalRejectedAdmins;
        const pending = data.TotalPendingAdmins;
        const approved = data.Totaladmins;
        const rejected = data.TotalRejectedAdmins;
        console.log(data, total, pending, approved, rejected);
        setStats({ total, pending, approved, rejected });
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Fallback to local data if API fails
        const total = requests.length;
        const pending = requests.filter(r => !r.approved && !r.rejected).length;
        const approved = requests.filter(r => r.approved).length;
        const rejected = requests.filter(r => r.rejected).length;
        setStats({ total, pending, approved, rejected });
      }
    };

    loadStats();
    // const total = requests.length;
    // const pending = requests.filter(r => !r.approved && !r.rejected).length;
    // const approved = requests.filter(r => r.approved).length;
    // const rejected = requests.filter(r => r.rejected).length;
    // setStats({ total, pending, approved, rejected });
  }, [requests]);

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    // setActionType("");
    setSelectedRequest(null);
    setRejectionReason(""); // 거절 사유 초기화
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultMessage("");
  };

  const handleAction = (request, action) => {
    console.log(action, request, 'request')
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    console.log(actionType, 'actionty')
  }, [actionType])

  const confirmAction = async () => {
    setLoad(true);
    if (!selectedRequest || !actionType) return;
    const { birthDate, imgPath, nickName, password, userId, userName } = selectedRequest;
    // 거절 시 사유가 입력되지 않으면 경고
    // console.log(actionType, 'actiontype')
    // if (actionType === "reject" && !rejectionReason.trim()) {
    //   // alert("거절 사유를 입력해주세요.");
    //   setLoad(false);
    //   queryClient.invalidateQueries({ queryKey: ['adminsInfo', isSuperAdmin] });

    //   return;
    // }
    setProcessing(selectedRequest.userId);
    try {
      console.log(selectedRequest, "selectedRequest before approve/reject");
      let updateRequest;
      if (actionType === "approve") {
        updateRequest = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + "/admin", { birthDate, imgPath, nickName, password, userId, userName });
        setLoad(false);
        setVerified(true);
        setTimeout(() => {
          setVerified(false);
        }, 1000);
        queryClient.invalidateQueries({ queryKey: ['adminsInfo'] });
        return
      } else if (actionType === "reject") {
        updateRequest = await axios.delete(process.env.NEXT_PUBLIC_BASE_URL + `/admin/rejectadmin`, { data: { userId } });
        setVerified(true);
        setLoad(false);
        setTimeout(() => {
          setVerified(false);
        }, 2000);
        queryClient.invalidateQueries({ queryKey: ['adminsInfo'] });
        return
      }
      console.log(updateRequest, "updateRequest after approve/reject");
      // Invalidate the specific query with the correct key
      queryClient.invalidateQueries({ queryKey: ['adminsInfo'] });
      setLoad(false);
      setIserror(true);
      setTimeout(() => {
        setIserror(false);
      }, 1000);
    } catch (error) {
      console.error("처리 중 오류:", error);
      setResultMessage("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowResultModal(true);
    } finally {
      setProcessing(null);
      setShowConfirmModal(false);
      setSelectedRequest(null);
      // setActionType("");
      setRejectionReason("");
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-[calc(100wd - 64px)] bg-deepnavy overflow-hidden pb-10">
      <div className="min-h-screen ml-64 p-6 sm:p-6">
        <div className="max-w-8xl space-y-6 px-12 mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-8 ">
            <h1 className="text-2xl sm:text-3xl font-bold text-whiteback mb-2">관리자 가입 요청 관리</h1>
            <p className="text-whiteback ">관리자 가입 요청을 승인 또는 거절할 수 있습니다.</p>
          </div>

          {/* 통계 카드 - 대기중 요청만 표시 */}
          <div className=" rounded-2xl text-textIcons bg-darkergray gap-4 p-6 mb-6">
            <h2 className="text-lg font-bold  mb-6">
              관리자 가입 요청
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-5 px-15 gap-10'>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">가입 처리완료</div>
                <div className="text-3xl  font-medium ">{stats.approved + stats.rejected}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">전체 가입 요청</div>
                <div className="text-3xl  font-medium ">{stats.total}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">대기중 요청</div>
                <div className="text-3xl  font-medium ">{stats.pending}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">승인 완료</div>
                <div className="text-3xl   font-medium ">{stats.approved}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">거절 완료</div>
                <div className="text-3xl   font-medium ">{stats.rejected}</div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-darkergray rounded-2xl min-h-200 shadow-sm border border-gray-200">
            {/* <div className=" rounded-xl border border-gray-200 shadow-sm mb-6"> */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-textIcons">가입 요청 관리</h3>
              </div>
              {/* 검색 및 액션 */}
              <div className='relative mb-8'>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="이름, 아이디로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full h-15 pl-10 pr-10 text-md py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400   focus:border-transparent "
                /></div>
              <div className="flex flex-wrap gap-2 items-center justify-around">
                <div className='flex items-center gap-2'>
                  <h4 className=" font-medium text-gray-700 ">상태별 필터 : </h4>
                  <button
                    onClick={(e) => { setStatusFilter('pending'); setActiveFilter('pending') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'pending'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >가입 대기중
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setStatusFilter('approved'); setActiveFilter('approved') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'approved'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >가입 승인
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setStatusFilter('rejected'); setActiveFilter('rejected') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'rejected'
                      ? 'bg-red-900 text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-red-900 border border-gray-200 hover:text-whiteback'
                      }`}
                  >가입 거절
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <h4 className=" font-medium text-gray-700 ">시간별 필터: </h4>
                  <button
                    onClick={(e) => { setSortBy('desc'); setActiveOrder('newest') }}
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
              </div>
              {/* 확장 필터 */}
              {/* {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block  font-medium text-gray-700 mb-2">사용자</label>
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">전체 사용자</option>
                        {users.map((user) => (
                          <option key={user} value={user}>
                            {user}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block  font-medium text-gray-700 mb-2">시작일</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block  font-medium text-gray-700 mb-2">종료일</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )} */}
            </div>
            <div className="  min-h-150 p-6 flex flex-col justify-between rounded-lg shadow overflow-hidden">
              <div className='space-y-3'>
                {false ? (
                  <div className="p-12 text-center">
                    <LoadingSpinner message="요청 목록 로딩 중..." />
                  </div>
                ) : paginatedRequests.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-lg mb-2">처리할 요청이 없습니다</p>
                    <p className="">선택한 조건에 맞는 요청이 없습니다.</p>
                  </div>
                ) : (
                  <Fragment  >
                    <div className="hidden md:grid grid-cols-[80px_150px_150px_1fr_80px_1fr_1fr_1fr] gap-4 text-center px-6 py-3 bg-gray-50 rounded-t-lg  font-medium text-textIcons uppercase tracking-wider">

                      <div className="col-span-1">번호</div>
                      <div className="col-span-1">이름</div>
                      <div className="col-span-1">아이디</div>
                      <div className="col-span-1">생년월일</div>
                      <div className="col-span-1">등급</div>
                      <div className="col-span-1">회사명</div>
                      <div className="col-span-1">요청일시</div>
                      <div className="col-span-1">상태</div>
                    </div>
                    <div className="divide-y space-y-2 divide-gray-200">
                      {paginatedRequests.map((request, index) => (
                        <div key={request.userId} className="bg-white  text-textIcons font-medium px-6 rounded-lg py-4 text-sm hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-1  md:grid-cols-[80px_150px_150px_1fr_80px_1fr_1fr_1fr] text-center gap-4 items-center">
                            {/* Mobile View */}
                            <div>{((currentPage - 1) * itemsPerPage) + index + 1}</div>
                            <div className="md:hidden space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-medium ">{request.userName}</div>
                                <span className=''>
                                  사용자 ID : {request.userId}
                                </span>
                              </div>
                              <div className=" ">회사명 : {request.company}</div>
                              <div className=" ">요청일 : {formatDate(request.createdAt)}</div>
                              <div className="flex gap-2 pt-2">
                                <Button onClick={() => handleAction(request, 'approve')} className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-sm ">승인</Button>
                                <Button onClick={() => handleAction(request, 'reject')} className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded-sm ">거절</Button>
                              </div>
                            </div>

                            {/* Desktop View */}
                            <div className="flex items-center  gap-2 col-span-1">
                              <img src={request.imgPath} className="w-10 h-10 rounded-full object-cover" alt="" />
                              <span className="hidden md:block col-span-1  font-medium ">{request.userName}</span>

                            </div>
                            <div className=" text-gray-800">{request.userId}</div>
                            <div className="hidden md:block col-span-1">
                              <span >
                                {request.birthDate}
                              </span>
                            </div>
                            <div className="hidden md:block col-span-1  ">{request.grade === 2 ? <div>슈퍼 관리자</div> : <div>일반 관리자</div>}</div>
                            <div className="hidden md:block col-span-1  ">경일게임IT 아카데미</div>
                            <div className="hidden md:block col-span-1  ">{formatDate(request.createdAt)}</div>
                            <div className="hidden md:flex col-span-1 justify-center gap-2">
                              {statusFilter !== "rejected" ? <span >
                                {statusFilter === "approved" ? <div className="  text-white  py-2 px-6 bg-green-800 rounded-md">승인 완료
                                </div> : <div className="flex items-center gap-4 justify-center">
                                  <Button
                                    onClick={() => handleAction(request, 'approve')}
                                    // disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                                    className="bg-green-800 text-whiteback hover:bg-green-700 px-6 py-2 cursor-pointer"
                                  >
                                    승인
                                  </Button>
                                  <Button
                                    onClick={() => handleAction(request, 'reject')}
                                    // disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                                    className="bg-red-900 text-whiteback  hover:bg-red-700 px-6 py-2 cursor-pointer "
                                  >
                                    거절
                                  </Button>
                                </div>}
                              </span> : <span className=" text-whiteback py-2 px-6 bg-red-900 rounded-md">
                                거절 완료
                              </span>
                              }
                            </div>
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

      <Modal isOpen={showConfirmModal} onClose={closeConfirmModal}>
        <div className=" w-full min-h-50 flex flex-col flex-wrap justify-around mx-auto">
          <h3 className="text-lg  font-semibold mb-4">
            {actionType === "approve" ? "가입 승인" : "가입 거절"}
          </h3>
          <div className="text-lg mb-8">
            {selectedRequest && (
              actionType === "approve"
                ? <div className="text-center font-medium"><div>"{selectedRequest.userName}"님의 관리자 가입을</div><div>승인하시겠습니까?</div></div>
                : <div className="text-center font-medium"><div>"{selectedRequest.userName}"님의 관리자 가입을</div><div>거절하시겠습니까?</div></div>
            )}
          </div>
          {/* 거절 시 사유 입력 필드 */}
          {/* {actionType === "reject" && (
            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block  font-medium text-gray-700 mb-2">
                거절 사유 *
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/500자
              </p>
            </div>
          )} */}
          <div className="w-full flex text-whiteback justify-around gap-2">
            <button
              onClick={closeConfirmModal}
              className="bg-gray-800  cursor-pointer hover:bg-gray-700 px-12 py-2 rounded"
            >
              취소
            </button>
            <button
              onClick={confirmAction}
              // disabled={actionType === "reject" && !rejectionReason.trim()}
              className={`px-12 cursor-pointer py-2 rounded text-white ${actionType === "approve"
                ? "bg-green-700 hover:bg-green-600"
                // : actionType === "reject" && !rejectionReason.trim()
                //   ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700"
                }`}
            >
              {actionType === "approve" ? "승인" : "거절"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 결과 모달 */}
      <Modal isOpen={showResultModal} onClose={closeResultModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">알림</h3>
          <div className="text-gray-600 mb-6 whitespace-pre-line">{resultMessage}</div>
          <div className="flex justify-end">
            <button
              onClick={closeResultModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>


      {/* 경고 모달 */}
      {/* <Modal isOpen={showResultModal} onClose={closeResultModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">알림</h3>
          <p className="text-gray-700 mb-6 text-center whitespace-pre-line">{resultMessage}</p>

          <button
            onClick={closeResultModal}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </Modal> */}
      {verified && <Processing ImageName={"/images/verified.gif"} failed={false} />}
      {load && <Processing ImageName={"/images/Processing.gif"} failed={false} className="mb-8" />}
      {iserror && <Processing ImageName={"/images/failed.png"} failed={true} className="mb-8" />}
    </div>
  );

  // return (
  //   <div className=" w-[calc(100wd - 64px) ] bg-lightbackblue overflow-hidden  pb-10  " >
  //     <div className="min-h-screen ml-64 p-4 sm:p-6">
  //       <div className="max-w-8xl px-12 mx-auto">
  //         {/* 헤더 */}
  //         <div className="mb-6">
  //           <h1 className="text-2xl sm:text-3xl font-bold mb-2">관리자 가입 요청 관리</h1>
  //           <p className="text-gray-600">관리자 가입 요청을 승인 또는 거절할 수 있습니다.</p>
  //         </div>

  //         {/* 통계 카드 */}
  //         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

  //           <div className="bg-white p-4 text-center rounded-lg shadow">
  //             <h3 className=" font-medium text-gray-500">전체 가입 요청</h3>
  //             <p className="text-2xl font-bold text-yellow-600">{stats.total}</p>
  //           </div>
  //           <div className="bg-white p-4 text-center rounded-lg shadow">
  //             <h3 className=" font-medium text-gray-500">승인 대기</h3>
  //             <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
  //           </div>
  //           <div className="bg-white p-4 text-center rounded-lg shadow">
  //             <h3 className=" font-medium text-gray-500">승인됨</h3>
  //             <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
  //           </div>
  //           <div className="bg-white p-4 text-center rounded-lg shadow">
  //             <h3 className=" font-medium text-gray-500">거절됨</h3>
  //             <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
  //           </div>
  //         </div>

  //         {/* 필터 및 검색 */}
  //         <div className="bg-white p-4  px-10 rounded-lg shadow mb-6">
  //           <div className="flex flex-col sm:flex-row gap-10">
  //             <div className="flex-1">
  //               <Input
  //                 placeholder="관리자명, 아이디, 회사명으로 검색..."
  //                 value={searchTerm}
  //                 onChange={(e) => setSearchTerm(e.target.value)}
  //                 className="h-10"
  //               />
  //             </div>
  //             <div className="flex gap-10">
  //               <select
  //                 value={statusFilter}
  //                 onChange={(e) => setStatusFilter(e.target.value)}
  //                 className="border border-gray-300 text-center rounded-lg w-50"
  //               >
  //                 {/* <option value="all">전체 상태</option> */}
  //                 <option value="pending"  >승인 대기</option>
  //                 <option value="approved">승인됨</option>
  //                 <option value="rejected">거절됨</option>
  //               </select>
  //               <select
  //                 value={sortBy}
  //                 onChange={(e) => setSortBy(e.target.value)}
  //                 className="border border-gray-300 w-50 text-center rounded-lg  "
  //               >
  //                 <option value="newest">최신순</option>
  //                 <option value="oldest">오래된순</option>
  //                 <option value="name">이름순</option>
  //                 {/* <option value="company">회사순</option> */}
  //               </select>
  //             </div>
  //           </div>
  //         </div>

  //         {/* 요청 목록 */}
  //         <div className="bg-white rounded-lg shadow overflow-hidden">
  //           {filteredRequests.length === 0 ? (
  //             <div className="p-12 text-center text-gray-500">
  //               <p className="text-lg mb-2">가입 요청이 없습니다</p>
  //               <p className="">새로운 관리자 가입 요청을 기다리고 있습니다.</p>
  //             </div>
  //           ) : (
  //             <div>
  //               {/* 헤더 */}
  //               <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
  //                 <div className="grid grid-cols-1 md:grid-cols-[80px_150px_150px_1fr_80px_1fr_1fr_1fr] gap-4 text-left  font-bold text-gray-500 uppercase tracking-wider">
  //                   <div className="text-center w-[80px]">번호</div>
  //                   <div className="text-center ">이름</div>
  //                   <div className="text-center ">아이디</div>
  //                   <div className="text-center ">생년월일</div>
  //                   <div className="text-center ">등급</div>
  //                   <div className="hidden md:block text-center">회사명</div>
  //                   <div className="hidden md:block text-center">요청일시</div>
  //                   <div className="hidden md:block text-center">상태</div>
  //                 </div>
  //               </div>

  //               {/* 목록 */}
  //               <div className="divide-y divide-gray-200">
  //                 {paginatedRequests.map((request, index) => (
  //                   <div key={request.userId} className="px-6 text-sm py-4 hover:bg-gray-50">
  //                     <div className="grid grid-cols-1 md:grid-cols-[80px_150px_150px_1fr_80px_1fr_1fr_1fr] gap-4">
  //                       {/* 관리자 정보 */}
  //                       <div className=" text-center font-medium text-gray-900">
  //                         {(currentPage - 1) * itemsPerPage + index + 1}
  //                       </div>
  //                       <div>
  //                         <div className=" text-center font-medium text-gray-900">
  //                           {request.userName}
  //                         </div>

  //                         {/* 모바일에서 추가 정보 표시 */}
  //                         <div className="md:hidden mt-2 space-y-2">

  //                           <div className="text-xs text-gray-600">
  //                             회사: {request.company}
  //                           </div>
  //                           <div className="text-xs text-gray-600">
  //                             요청일: {formatDate(request.createdAt)}
  //                           </div>
  //                           <div className="flex items-center justify-between">
  //                             <span className={getStatusBadge(request.grade)}>
  //                               {getStatusText(request.approved, request.rejected)}
  //                             </span>
  //                             {/* 거절 사유 버튼 (모바일) */}
  //                             {/* {statusFilter === "rejected" && (
  //                               <button
  //                                 onClick={() => {
  //                                   setResultMessage(`거절 사유:\n${request.rejectionReason}`);
  //                                   setShowResultModal(true);
  //                                 }}
  //                                 className="text-xs text-red-600 hover:text-red-800 underline"
  //                               >
  //                                 사유 보기
  //                               </button>
  //                             )} */}
  //                           </div>
  //                           {/* 작업 버튼 (모바일) */}
  //                           <div className="flex gap-2">
  //                             <>
  //                               <Button
  //                                 onClick={() => handleAction(request, "approve")}
  //                                 disabled={processing === request.userId}
  //                                 className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs"
  //                               >
  //                                 {processing === request.userId ? (
  //                                   <LoadingSpinner size="xs" />
  //                                 ) : (
  //                                   "승인"
  //                                 )}
  //                               </Button>
  //                               <Button
  //                                 onClick={() => handleAction(request, "reject")}
  //                                 disabled={processing === request.userId}
  //                                 className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs"
  //                               >
  //                                 거절
  //                               </Button>
  //                             </>

  //                           </div>
  //                         </div>
  //                       </div>

  //                       {/* 회사명 - 데스크탑에서만 표시 */}
  //                       <div className="hidden md:block">
  //                         <div className=" text-center text-gray-900">{request.userId}</div>
  //                       </div>
  //                       <div className="hidden md:block">
  //                         <div className=" text-center text-gray-900">{request.birthDate}</div>
  //                       </div>
  //                       <div className="hidden md:block">
  //                         <div className=" text-center text-gray-900">{request.grade === 2 ? <div>슈퍼 관리자</div> : <div>일반 관리자</div>}</div>
  //                       </div>
  //                       <div className="hidden md:block">
  //                         <div className=" text-gray-900 text-center">경일게임IT 아카데미</div>
  //                       </div>

  //                       {/* 요청일시 - 데스크탑에서만 표시 */}
  //                       <div className="hidden text-center md:block">
  //                         <div className=" text-gray-900">
  //                           {formatDate(request.createdAt)}
  //                         </div>
  //                       </div>

  //                       {/* 상태 - 데스크탑에서만 표시 */}
  //                       <div className="hidden text-center md:block">
  //                         <div  >
  //                           {statusFilter !== "rejected" ? <span >
  //                             {statusFilter === "approved" ? <span className=" w-fit  text-white  p-2 px-8 bg-green-600 rounded-2xl">승인
  //                             </span> : <div className="flex items-center gap-4 justify-center">
  //                               <Button
  //                                 onClick={() => handleAction(request, "approve")}
  //                                 disabled={processing === request.userId}
  //                                 className="bg-green-100 text-green-800 hover:bg-green-200 px-6 py-2 rounded cursor-pointer"
  //                               >
  //                                 {processing === request.userId ? (
  //                                   <LoadingSpinner />
  //                                 ) : (
  //                                   "승인"
  //                                 )}
  //                               </Button>
  //                               <Button
  //                                 onClick={() => handleAction(request, "reject")}
  //                                 disabled={processing === request.userId}
  //                                 className="bg-red-100 text-red-800 hover:bg-red-200 px-6 py-2 rounded cursor-pointer "
  //                               >
  //                                 거절
  //                               </Button>
  //                             </div>}
  //                           </span> : <span className=" text-red-600 py-2 px-8 bg-amber-100 rounded-2xl">
  //                             거절
  //                           </span>
  //                           }
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //           )}
  //         </div>

  //         {/* 페이지네이션 컨트롤 */}
  //         {totalPages && (
  //           <div className="mt-12 text-sm flex flex-col  items-center">
  //             <div className="flex justify-center items-center gap-2">
  //               <button
  //                 onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
  //                 disabled={currentPage === 1}
  //                 className="px-4 py-2  rounded-lg disabled:opacity-50 text-black cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 "
  //               >
  //                 이전
  //               </button>

  //               <div className="flex gap-1">
  //                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
  //                   let pageNum;
  //                   if (totalPages <= 5) {
  //                     pageNum = i + 1;
  //                   } else if (currentPage <= 3) {
  //                     pageNum = i + 1;
  //                   } else if (currentPage >= totalPages - 2) {
  //                     pageNum = totalPages - 4 + i;
  //                   } else {
  //                     pageNum = currentPage - 2 + i;
  //                   }

  //                   return (
  //                     <button
  //                       key={pageNum}
  //                       onClick={() => setCurrentPage(pageNum)}
  //                       className={`px-4 py-2 border border-borderbackblue rounded-lg cursor-pointer ${currentPage === pageNum
  //                         ? 'bg-borderbackblue text-white '
  //                         : ' hover:bg-gray-50'
  //                         }`}
  //                     >
  //                       {pageNum}
  //                     </button>
  //                   );
  //                 })}
  //               </div>

  //               <button
  //                 onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
  //                 disabled={currentPage === totalPages}
  //                 className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 "
  //               >
  //                 다음
  //               </button>
  //             </div>

  //           </div>
  //         )}
  //       </div>

  //       {/* 확인 모달 */}
  // <Modal isOpen={showConfirmModal} onClose={closeConfirmModal}>
  //   <div className=" w-max mx-auto">
  //     <h3 className="text-lg  font-semibold mb-4">
  //       {actionType === "approve" ? "가입 승인" : "가입 거절"}
  //     </h3>
  //     <p className="text-gray-600 mb-8">
  //       {selectedRequest && (
  //         actionType === "approve"
  //           ? `${selectedRequest.userName}님의 관리자 가입을 승인하시겠습니까?`
  //           : `${selectedRequest.userName}님의 관리자 가입을 거절하시겠습니까?`
  //       )}
  //     </p>

  //     {/* 거절 시 사유 입력 필드 */}
  //     {actionType === "reject" && (
  //       <div className="mb-6">
  //         <label htmlFor="rejectionReason" className="block  font-medium text-gray-700 mb-2">
  //           거절 사유 *
  //         </label>
  //         <textarea
  //           id="rejectionReason"
  //           value={rejectionReason}
  //           onChange={(e) => setRejectionReason(e.target.value)}
  //           placeholder="거절 사유를 입력해주세요..."
  //           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  resize-none"
  //           rows={3}
  //           maxLength={500}
  //         />
  //         <p className="text-xs text-gray-500 mt-1">
  //           {rejectionReason.length}/500자
  //         </p>
  //       </div>
  //     )}

  //     <div className="w-full flex justify-around gap-2">
  //       <button
  //         onClick={closeConfirmModal}
  //         className="bg-gray-300 text-gray-700 cursor-pointer hover:bg-gray-400 px-12 py-2 rounded"
  //       >
  //         취소
  //       </button>
  //       <button
  //         onClick={confirmAction}
  //         disabled={actionType === "reject" && !rejectionReason.trim()}
  //         className={`px-12 cursor-pointer py-2 rounded text-white ${actionType === "approve"
  //           ? "bg-green-600 hover:bg-green-700"
  //           : actionType === "reject" && !rejectionReason.trim()
  //             ? "bg-gray-400 cursor-not-allowed"
  //             : "bg-red-600 hover:bg-red-700"
  //           }`}
  //       >
  //         {actionType === "approve" ? "승인" : "거절"}
  //       </button>
  //     </div>
  //   </div>
  // </Modal>

  // {/* 결과 모달 */}
  // <Modal isOpen={showResultModal} onClose={closeResultModal}>
  //   <div className="p-6">
  //     <h3 className="text-lg font-semibold mb-4">알림</h3>
  //     <div className="text-gray-600 mb-6 whitespace-pre-line">{resultMessage}</div>
  //     <div className="flex justify-end">
  //       <button
  //         onClick={closeResultModal}
  //         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
  //       >
  //         확인
  //       </button>
  //     </div>
  //   </div>
  // </Modal>
  //     </div>
  //     {verified && <Processing ImageName={"/images/verified.gif"} failed={false} />}
  //     {load && <Processing ImageName={"/images/Processing.gif"} failed={false} className="mb-8" />}
  //     {iserror && <Processing ImageName={"/images/failed.png"} failed={true} className="mb-8" />}
  //   </div>
  // );
}