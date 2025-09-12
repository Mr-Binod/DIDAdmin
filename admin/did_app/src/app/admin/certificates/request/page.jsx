// src/app/admin/certificate-requests/page.jsx
'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Modal from '../../../../components/UI/Modal';
import LoadingSpinner from "../../../../components/UI/Spinner";
import Input from "../../../../components/UI/Input";
import Button from '../../../../components/UI/Button';
import { useAdminInfoStore } from '../../../../Store/useAdminStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Processing from '../../../../components/UI/Processing';

export default function AdminCertificateRequestsPage() {
  // 헤더용 사용자
  const { admin: user } = useAdminInfoStore();
  const queryClient = useQueryClient();

  // 결과 모달 상태
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  // UI 상태들
  const [requestTypeFilter, setRequestTypeFilter] = useState('all'); // all | issue | revoke
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userFilter, setUserFilter] = useState('all');
  const [load, setLoad] = useState(false);
  const [verified, setVerified] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeOrder, setActiveOrder] = useState('desc');

  const itemsPerPage = 10; // 5개로 고정

  // 처리 모달 상태
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState(null);
  const [processType, setProcessType] = useState(''); // 'approve' | 'reject'
  const [processReason, setProcessReason] = useState('');

  // 데이터 fetching
  const { data: allRequests = [], isLoading, isError } = useQuery({
    queryKey: ['certificateRequests'],
    queryFn: async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/vcrequestlogs`);
      console.log(data, 'certificateRequests')
      return data.data || [];
    },
    refetchOnWindowFocus: true,
  })

  // 요청 처리 Mutation
  const processRequestMutation = useMutation({
    mutationFn: async ({ request, type, reason }) => {
      console.log(`Simulating ${type} for request ID: ${request.id}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (data, variables) => {
      const { request, type } = variables;
      queryClient.invalidateQueries({ queryKey: ['certificateRequests'] });

      const actionText = type === 'approve' ? '승인' : '거절';
      const requestTypeText = getRequestTypeText(request.request);
      setResultMessage(
        `${request.userName}님의 ${request.certificateName} ${requestTypeText} 요청이 ${actionText}되었습니다.`
      );
      setShowResultModal(true);
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

      closeProcessModal();
    },
    onError: (error, variables) => {
      console.error("Error processing request:", error);
      const actionText = variables.type === 'approve' ? '승인' : '거절';
      setResultMessage(`${actionText} 처리 중 오류가 발생했습니다. 다시 시도해주세요.`);
      setShowResultModal(true);
    },
  });

  // 데이터 가공
  const pendingRequests = useMemo(() => {
    return allRequests.filter((req) => req.status === 'pending');
  }, [allRequests]);

  // 현재 탭에 따른 데이터 - 대기중인 요청만 필터링
  const currentRequests = useMemo(() => {
    if (requestTypeFilter === 'all') {
      return pendingRequests;
    } else if (requestTypeFilter === 'issue') {
      return pendingRequests.filter((req) => req.request === 'issue');
    } else {
      return pendingRequests.filter((req) => req.request === 'revoke');
    }
  }, [requestTypeFilter, pendingRequests]);

  // 사용자 목록 (필터용)
  const users = [...new Set(currentRequests.map((req) => req.userName))];

  // 필터링 및 정렬
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = currentRequests;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.certificateName && req.certificateName.toLowerCase().includes(searchLower) ||
        req.certificateId && req.certificateId.toLowerCase().includes(searchLower) ||
        req.userName && req.userName.toLowerCase().includes(searchLower) ||
        req.birthDate?.toLowerCase().includes(searchLower) || 
        req.userId?.toLowerCase().includes(searchLower) 
        
      );
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(req => req.userName === userFilter);
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.createdAt);
        if (dateRange.start && reqDate < new Date(dateRange.start)) return false;
        if (dateRange.end && reqDate > new Date(dateRange.end)) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => {
      const aValue = new Date(a.createdAt);
      const bValue = new Date(b.createdAt);

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [currentRequests, searchTerm, userFilter, dateRange, sortOrder]);

  // 페이지네이션을 위한 데이터 처리
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const paginatedRequests = filteredAndSortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 통계 계산 - 대기중인 요청만 계산
  const stats = useMemo(() => {
    const total = pendingRequests.length;
    const issueCount = pendingRequests.filter((req) => req.request === 'issue').length;
    const revokeCount = pendingRequests.filter((req) => req.request === 'revoke').length;
    return { total, issueCount, revokeCount };
  }, [pendingRequests]);

  useEffect(() => setCurrentPage(1), [requestTypeFilter, searchTerm, sortOrder, userFilter, dateRange]);

  // 요청 타입별 배지 스타일
  const getRequestTypeBadge = (request) => {
    switch (request) {
      case 'issue':
        return 'bg-borderbackblue text-whiteback px-6 py-2 rounded  font-medium';
      case 'revoke':
        return 'bg-red-800 text-whiteback px-6 py-2 rounded  font-medium';
      default:
        return ' px-2 py-1 rounded  font-medium';
    }
  };

  const getRequestTypeText = (request) => {
    switch (request) {
      case 'issue':
        return '발급';
      case 'revoke':
        return '폐기';
      default:
        return '기타';
    }
  };

  // 처리 모달 열기
  const openProcessModal = (request, type) => {
    setRequestToProcess(request);
    setProcessType(type);
    setProcessReason('');
    setShowProcessModal(true);
  };

  // 처리 모달 닫기
  const closeProcessModal = () => {
    setShowProcessModal(false);
    setRequestToProcess(null);
    setProcessType('');
    setProcessReason('');
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultMessage("");
  };

  // 요청 처리 확정 - 처리된 요청은 목록에서 제거하고 대시보드용 기록 저장
  const confirmProcessRequest = async () => {
    if (!requestToProcess) return;
    setLoad(true);
    closeProcessModal()
    try {
      // 거절일 때만 사유 입력 필수
      if (processType === 'reject') {
        if (requestToProcess.request === 'revoke') {
          // setResultMessage('거절 사유를 입력해주세요.');
          // setShowResultModal(true);
          await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/rejectrevoke`, {

            userId: requestToProcess.userId,
            certName: requestToProcess.certificateName

          })
          console.log(requestToProcess, ' requestToProcess', processType)
          setLoad(false);
          setVerified(true)
          setTimeout(() => {
            setVerified(false);
          }, 1000);
          queryClient.invalidateQueries(['certificateRequests']);
          return;
        }

        await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/rejectissue`, {

          userId: requestToProcess.userId,
          certName: requestToProcess.certificateName

        })
        setLoad(false);
        setVerified(true)
        setTimeout(() => {
          setVerified(false);
        }, 1000);
        queryClient.invalidateQueries(['certificateRequests']);
        return
      }
      if (requestToProcess.request === 'revoke') {
        await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/approverevoke`, {

          userId: requestToProcess.userId,
          certName: requestToProcess.certificateName

        })
        setLoad(false);
        setVerified(true)
        setTimeout(() => {
          setVerified(false);
        }, 1000);
        queryClient.invalidateQueries(['certificateRequests']);
        return
      }
      console.log(requestToProcess, ' requestToProcess', processType)
      const { updatedAt, createdAt, ...rest } = requestToProcess;
      rest.status = "approved";
      console.log(rest, user.userId, 'rest')
      const data = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/user/vc/confirm`, {
        ...rest, issuerId: user.userId
      })
      queryClient.invalidateQueries(['certificateRequests']);
      closeProcessModal();

      // processRequestMutation.mutate({
      //   request: requestToProcess,
      //   type: processType,
      //   reason: processReason,
      // });

      setLoad(false);
      setVerified(true)
      setTimeout(() => {
        setVerified(false);
      }, 1000);
    } catch (error) {
      setLoad(false);
      setIserror(true)
      setTimeout(() => {
        setIserror(false);
      }, 1000);
      queryClient.invalidateQueries(['certificateRequests']);
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

  // 스켈레톤 로더
  const RequestSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="h-16 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <LoadingSpinner message="요청 목록을 불러오는 중..." size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-[calc(100wd - 64px)] bg-deepnavy overflow-hidden pb-10">
      <div className="min-h-screen ml-64 p-6 sm:p-6">
        <div className="max-w-8xl space-y-6 px-12 mx-auto">
          {/* 상단 헤더 */}
          <div className="mb-8 ">
            <h1 className="text-2xl sm:text-3xl font-bold text-whiteback mb-2">수료증 요청 관리</h1>
            <p className="text-whiteback ">사용자들의 수료증 발급 및 폐기 요청을 관리하세요.</p>
          </div>

          {/* 통계 카드 - 대기중 요청만 표시 */}
          <div className=" rounded-2xl text-textIcons bg-darkergray gap-4 p-6 mb-6">
            <h2 className="text-lg font-bold  mb-6">
              수료증 요청
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-4 px-15 gap-20'>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">전체 처리됭 요청</div>
                <div className="text-3xl  font-medium ">{stats.total}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">전체 대기중 요청</div>
                <div className="text-3xl  font-medium ">{stats.total}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">발급 대기중</div>
                <div className="text-3xl   font-medium ">{stats.issueCount}</div>
              </div>
              <div className="bg-darkergray p-4 rounded-xl text-center border border-gray-200 shadow-2xl">
                <div className="mb-6 text-lg font-medium ">폐기 대기중</div>
                <div className="text-3xl   font-medium ">{stats.revokeCount}</div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-darkergray rounded-2xl min-h-200 shadow-sm border border-gray-200">
            {/* <div className=" rounded-xl border border-gray-200 shadow-sm mb-6"> */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-textIcons">수료증 관리</h3>
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
                  placeholder="이름, 아이디, 수료증 명, 생년월일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full h-15 pl-10 pr-10 text-md py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400   focus:border-transparent "
                /></div>
              <div className="flex flex-wrap gap-2 items-center justify-around">
                <div className='flex items-center gap-2'>
                  <h4 className=" font-medium  ">상태별 필터 : </h4>
                  <button
                    onClick={(e) => { setRequestTypeFilter('all'); setActiveFilter('all') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'all'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >전체 요청
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setRequestTypeFilter('issue'); setActiveFilter('issue') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'issue'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >발급 요청
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setRequestTypeFilter('revoke'); setActiveFilter('revoke') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'revoke'
                      ? 'bg-red-900 text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-red-900 border border-gray-200 hover:text-whiteback'
                      }`}
                  >폐기 요청
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <h4 className=" font-medium  ">시간별 필터: </h4>
                  <button
                    onClick={(e) => { setSortOrder('desc'); setActiveOrder('desc') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeOrder === 'desc'
                      ? 'bg-deepnavy text-whiteback shadow-xl'
                      : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                      }`}
                  >
                    최신순
                    {/* 전체 ({getFilterCount('all')}) */}
                  </button>
                  <button
                    onClick={(e) => { setSortOrder('asc'); setActiveOrder('asc') }}
                    className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeOrder === 'asc'
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
              {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block  font-medium  mb-2">사용자</label>
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
                      <label className="block  font-medium  mb-2">시작일</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block  font-medium  mb-2">종료일</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="  min-h-150 p-6 flex flex-col justify-between rounded-lg shadow overflow-hidden">
              <div className='space-y-3'>
                {isLoading ? (
                  <div className="p-12 text-center">
                    <LoadingSpinner message="요청 목록 로딩 중..." />
                  </div>
                ) : paginatedRequests.length === 0 ? (
                  <div className="p-12 text-center ">
                    <p className="text-lg mb-2">처리할 요청이 없습니다</p>
                    <p className="">선택한 조건에 맞는 요청이 없습니다.</p>
                  </div>
                ) : (
                  <Fragment  >
                    <div className="hidden md:grid grid-cols-[80px_150px_150px_150px_1fr_1fr_1fr] gap-4 text-center px-6 py-3 bg-gray-50 rounded-t-lg  font-medium text-textIcons uppercase tracking-wider">

                      <div className="col-span-1">번호</div>
                      <div className="col-span-1">요청자 이름</div>
                      <div className="col-span-1">요청자 아이디</div>
                      <div className="col-span-1">요청 유형</div>
                      <div className="col-span-1">수료증명</div>
                      <div className="col-span-1">요청일</div>
                      <div className="col-span-1 text-center">처리</div>
                    </div>
                    <div className="space-y-2  divide-gray-200">
                      {paginatedRequests.map((request, index) => (
                        <div key={request.id} className="bg-white px-6 rounded-lg py-4 text-sm hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-[80px_150px_150px_150px_1fr_1fr_1fr] text-center gap-4 items-center">
                            {/* Mobile View */}
                            <div>{((currentPage - 1) * itemsPerPage) + index + 1}</div>
                            <div className="md:hidden space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-medium ">{request.userName}</div>
                                <span className={getRequestTypeBadge(request.status)}>
                                  {getRequestTypeText(request.status)}
                                </span>
                              </div>

                              <div className=" ">{request.certificateName}</div>
                              <div className=" ">요청일: {formatDate(request.createdAt)}</div>
                              <div className="flex gap-2 pt-2">
                                <Button onClick={() => openProcessModal(request, 'approve')} className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded ">승인</Button>
                                <Button onClick={() => openProcessModal(request, 'reject')} className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded ">거절</Button>
                              </div>
                            </div>

                            {/* Desktop View */}
                            <div className="flex items-center  gap-2 col-span-1">
                              <img src={request.ImagePath} className="w-10 h-10 rounded-full object-cover" alt="" />
                              <span className="hidden md:block col-span-1  font-medium ">{request.userName}</span>

                            </div>
                            <div className=" ">{request.userId}</div>
                            <div className="hidden md:block col-span-1">
                              <span className={getRequestTypeBadge(request.request)}>
                                {getRequestTypeText(request.request)}
                              </span>
                            </div>
                            <div className="hidden md:block col-span-1  ">{request.certificateName}</div>
                            <div className="hidden md:block col-span-1  ">{formatDate(request.createdAt)}</div>
                            <div className="hidden md:flex col-span-1 justify-center gap-2">
                              <Button
                                onClick={() => openProcessModal(request, 'approve')}
                                disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                                className="bg-deepnavy text-whiteback hover:bg-borderbackblue px-6 py-2 cursor-pointer rounded-lg"
                              >
                                승인
                              </Button>
                              <Button
                                onClick={() => openProcessModal(request, 'reject')}
                                disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                                className="bg-red-900 text-whiteback hover:bg-red-700 px-6 py-2 cursor-pointer rounded-lg"
                              >
                                거절
                              </Button>
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

      {/* 처리 확인 모달 */}
      <Modal isOpen={showProcessModal} onClose={closeProcessModal}>
        <div className="p-6 w-full text-textIcons font-medium">
          <h3 className="text-xl font-semibold mb-6 text-center">{`요청 ${processType === 'approve' ? '승인' : '거절'}`}</h3>
          <div className="px-8">
            <div className="mb-4 flex gap-4">
              <p className=" font-medium ">요청자:</p>
              <p className=" ">
                {requestToProcess?.userName}
              </p>
            </div>
            <div className="mb-8 flex gap-4 ">
              <p className=" font-medium ">수료증:</p>
              <p className=" ">{requestToProcess?.certificateName}</p>
            </div>
            <div className="mb-6">
              <p className="text-lg text-center mb-10 ">위 요청을 승인하시겠습니까?</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={closeProcessModal}
              className="flex-1 px-4 py-2 bg-deepnavy text-white  rounded-lg hover:bg-borderbackblue cursor-pointer transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={confirmProcessRequest}
              disabled={processRequestMutation.isPending}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors cursor-pointer font-medium ${processType === 'approve' ? 'bg-green-700 hover:bg-green-600' : 'bg-red-800 hover:bg-red-700'} disabled:bg-gray-400`}
            >
              {processRequestMutation.isPending ? <LoadingSpinner size="sm" showMessage={false} /> : (processType === 'approve' ? '승인 확정' : '거절 확정')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 경고 모달 */}
      <Modal isOpen={showResultModal} onClose={closeResultModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">알림</h3>
          <p className=" mb-6 text-center whitespace-pre-line">{resultMessage}</p>

          <button
            onClick={closeResultModal}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </Modal>
      {verified && <Processing ImageName={"/images/verified.gif"} failed={false} />}
      {load && <Processing ImageName={"/images/Processing.gif"} failed={false} className="mb-8" />}
      {iserror && <Processing ImageName={"/images/failed.png"} failed={true} className="mb-8" />}
    </div>
  );
}