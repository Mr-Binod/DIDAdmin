"use client";
import React, { useState, useEffect, useMemo } from "react";
import LoadingSpinner from "../../../components/UI/Spinner";
import Modal from "../../../components/UI/Modal";
import Input from "../../../components/UI/Input";
import axios from "axios";


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

  useEffect(() => {
    // loadRecords();
    const loaduserData = async () => {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/user/users`);
      console.log(data.data, 'userData');
      const sortedData = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setRecords(sortedData);
    }
    loaduserData()
  }, []);

  useEffect(() => {
    let filtered = [...records];

    // 검색 (DID 또는 이름 기반)
    // if (searchTerm.trim()) {
    //   filtered = filtered.filter(
    //     (rec) =>
    //       rec.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //       rec.name.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
    // }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="로그인 기록을 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-8xl ml-64 px-12 mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">사용자 활동 기록</h1>
          <p className="text-gray-600">
            로그인 이력과 VC 발급/검증 현황을 확인할 수 있습니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">전체 로그인 기록</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">발급된 VC</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.totalIssuedVCs}
            </p>
          </div>
          {/* <div className="bg-white p-4 rounded-lg shadow">
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
                placeholder="이름 또는 DID 계정으로 검색..."
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
                <div className="grid grid-cols-1 md:grid-cols-[80px_100px_150px_250px_1fr_1fr] text-center gap-4  text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>번호</div>
                  <div>사진</div>
                  <div>사용자 ID</div>
                  <div>사용자 이름</div>
                  <div>사용자 DID</div>
                  {/* <div className="hidden md:block">로그인 일시</div> */}
                  <div className="hidden md:block text-center">생년월일</div>
                </div>
              </div>

              {/* 리스트 */}
              <div className="divide-y divide-gray-200">
                {paginatedRecords.map((rec, index) => (
                  <div key={rec.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="items-center grid grid-cols-1 text-center  md:grid-cols-[80px_100px_150px_250px_1fr_1fr] gap-4">
                      <div>{(currentPage - 1) * itemsPerPage + index + 1}</div>
                      <div className="hidden md:flex justify-center md:block  text-sm text-gray-900">
                        <img src={rec.imgPath} className="w-8 h-8 rounded-lg" alt="" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {rec.userId}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {rec.userName}
                      </div>
                      <div className="text-sm   text-gray-900 mx-auto overflow-ellipsis overflow-hidden">{rec.didAddress}</div>

                      {/* <div className="hidden md:block text-sm ">
                        {rec.verifiedVCs}
                      </div> */}
                      <div className="hidden md:block text-sm   ">
                        {rec.birthDate}
                      </div>

                      {/* 모바일 전용 */}
                      <div className="md:hidden mt-2 space-y-1 text-xs text-gray-600">
                        <div>DID: {rec.did}</div>
                        <div>로그인: {formatDate(rec.loginAt)}</div>
                        <div>발급 VC: {rec.issuedVCs}</div>
                        <div>검증 VC: {rec.verifiedVCs}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="flex justify-center items-center gap-2 py-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  이전
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} /{" "}
                  {Math.ceil(filteredRecords.length / itemsPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(
                        p + 1,
                        Math.ceil(filteredRecords.length / itemsPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(filteredRecords.length / itemsPerPage)
                  }
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  다음
                </button>
              </div>
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
