"use client";
import React, { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "../../../components/UI/Spinner";
import Modal from "../../../components/UI/Modal";
import Input from "../../../components/UI/Input";
import axios from "axios";

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

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 에러 모달
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [copiedDid, setCopiedDid] = useState(null);

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
          rec.userName?.toLowerCase().includes(lowercasedSearchTerm)
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

  // 통계
  const stats = useMemo(() => {

    const total = records.length;
    console.log(total, 'total')
    if (total === 0) return { total: 0, totalIssuedVCs: 0, totalVerifiedVCs: 0 }
    const totalIssuedVCs = records?.reduce(
      (sum, rec) => sum + (rec.issuedVCs || 0),
      0
    );
    const totalVerifiedVCs = records?.reduce(
      (sum, rec) => sum + (rec.verifiedVCs || 0),
      0
    );
    return { total, totalIssuedVCs, totalVerifiedVCs };
  }, [records]);

  // const loadRecords = () => {
  //   try {
  //     // setLoading(true);
  //     // 실제 API 대신 더미 데이터 사용
  //     setRecords(dummyLoginHistory);
  //     // setTimeout(() => {
  //     //   setLoading(false);
  //     // }, 500);
  //   } catch (error) {
  //     console.error(error);
  //     setResultMessage("로그인 기록을 불러오는 중 오류가 발생했습니다.");
  //     setShowResultModal(true);
  //     setLoading(false);
  //   }
  // };

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
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="로그인 기록을 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-8xl ml-64 px-12">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">사용자 활동 기록</h1>
          <p className="text-gray-600">
            로그인 이력과 VC 발급/검증 현황을 확인할 수 있습니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-gray-400">
            <h3 className="text-sm font-medium text-gray-500">전체 로그인 기록</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-indigo-500">
            <h3 className="text-sm font-medium text-gray-500">발급된 VC</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.totalIssuedVCs}
            </p>
          </div>
          {/* <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">검증된 VC</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalVerifiedVCs}
            </p>
          </div> */}
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="사용자 이름 또는 DID 주소로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                {/* <option value="nameAsc">이름 오름차순</option>
                <option value="nameDesc">이름 내림차순</option> */}
              </select>
            </div>
          </div>
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">기록이 없습니다</p>
              <p className="text-sm">검색 조건에 맞는 기록이 없습니다.</p>
            </div>
          ) : (
            <div>
              {/* 헤더 */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="hidden md:grid md:grid-cols-[50px_1fr_1fr_2fr_1fr] text-left gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>번호</div>
                  <div>사용자 이름</div>
                  <div>사용자 ID</div>
                  <div>사용자 DID</div>
                  <div className="text-left">생년월일</div>
                </div>
              </div>

              {/* 리스트 */}
              <div className="divide-y divide-gray-200">
                {paginatedRecords.map((rec, index) => (
                  <div key={rec.id} className="px-4 py-4 md:px-6 hover:bg-gray-50 transition-colors duration-150">
                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-[50px_1fr_1fr_2fr_1fr] items-center gap-4 text-sm">
                      <div className="text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</div>
                      <div className="flex items-center gap-3">
                        <img src={rec.imgPath || '/images/default-avatar.png'} className="w-9 h-9 rounded-full object-cover" alt={`${rec.userName} profile`} />
                        <span className="font-medium text-gray-900">{rec.userName}</span>
                      </div>
                      <div className="text-gray-700">{rec.userId}</div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="truncate">{rec.didAddress}</span>
                        <button onClick={() => handleCopy(rec.didAddress)} className="text-gray-400 hover:text-blue-600 transition-colors">
                          {copiedDid === rec.didAddress ? (
                            <span className="text-xs text-blue-600">Copied!</span>
                          ) : (
                            <CopyIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-gray-700">{rec.birthDate}</div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={rec.imgPath || '/images/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" alt={`${rec.userName} profile`} />
                          <div>
                            <p className="font-bold text-gray-900">{rec.userName}</p>
                            <p className="text-xs text-gray-500">{rec.userId}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          #{ (currentPage - 1) * itemsPerPage + index + 1 }
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500">DID Address</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800 truncate">{rec.didAddress}</span>
                            <button onClick={() => handleCopy(rec.didAddress)} className="text-gray-400 hover:text-blue-600">
                              {copiedDid === rec.didAddress ? (
                                <span className="text-xs text-blue-600">Copied!</span>
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-500">생년월일</span>
                          <span className="text-gray-800">{rec.birthDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 - 개선된 버전 */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 py-4 px-6 border-t">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100"
                    >
                      이전
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5 || currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum
                                ? 'bg-blue-600 text-white font-bold'
                                : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 결과 모달 */}
      <Modal isOpen={showResultModal} onClose={closeResultModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">알림</h3>
          <div className="text-gray-600 mb-6 whitespace-pre-line">
            {resultMessage}
          </div>
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
    </div>
  );
}
