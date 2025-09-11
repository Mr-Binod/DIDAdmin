const { format } = require("path");






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
              <div className="text-3xl  font-medium ">{stats.approved + stats.rejected || 0}</div>
            </div>
            <div className="bg-darkergray p-4 rounded-xl  text-center border border-gray-200 shadow-2xl">
              <div className="mb-6 text-lg font-medium ">오늘 방문자</div>
              <div className="text-3xl  font-medium ">{stats.pending || 0}</div>
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
                placeholder="수료증명, 사용자명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full h-15 pl-10 pr-10 text-md py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400   focus:border-transparent "
              /></div>
            <div className="flex flex-wrap gap-2 items-center justify-around">
              <div className='flex items-center gap-2'>
                <h4 className=" font-medium text-gray-700 ">정렬 기준 : </h4>
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
                >승인 완료
                  {/* 전체 ({getFilterCount('all')}) */}
                </button>
                <button
                  onClick={(e) => { setStatusFilter('rejected'); setActiveFilter('rejected') }}
                  className={`px-4 py-3 cursor-pointer text-sm font-medium rounded-lg transition-colors ${activeFilter === 'rejected'
                    ? 'bg-deepnavy text-whiteback shadow-xl'
                    : 'bg-lightbackblue text-textIcons hover:bg-deepnavy border border-gray-200 hover:text-whiteback'
                    }`}
                >폐기 요청 ({stats.revokeCount || 0})
                  {/* 전체 ({getFilterCount('all')}) */}
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <h4 className=" font-medium text-gray-700 ">정렬 기준: </h4>
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
            </div>

          </div>
          <div className="  min-h-150 p-6 flex flex-col justify-between rounded-lg shadow overflow-hidden">
            <div className='space-y-3'>
              {isLoading ? (
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
                  <div className="hidden md:grid grid-cols-[80px_150px_150px_fr_1fr_1fr_1fr] gap-4 text-center px-6 py-3 bg-gray-50 rounded-t-lg  font-medium text-gray-500 uppercase tracking-wider">

                    <div className="col-span-1">번호</div>
                    <div className="col-span-1">이름</div>
                    <div className="col-span-1">닉네임</div>
                    <div className="col-span-1">아이디</div>
                    <div className="col-span-1">생년월일</div>
                    <div className="col-span-1">주소</div>
                    <div className="col-span-1 text-left">사용자 DID</div>
                  </div>
                  <div className="divide-y  divide-gray-200">
                    {paginatedRequests.map((request, index) => (
                      <div key={request.userId} className="bg-white px-6 rounded-lg py-4 text-sm hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-[80px_150px_150px_fr_1fr_1fr_1fr] text-center gap-4 items-center">
                          {/* Mobile View */}
                          <div>{((currentPage - 1) * itemsPerPage) + index + 1}</div>
                          <div className="md:hidden space-y-3">
                            <div className="flex items-center justify-between">
                              <img src={request.imgPath || '/images/default-avatar.png'} className="w-9 h-9 rounded-full object-cover" alt={`${rec.userName} profile`} />
                              <div className="font-medium text-gray-900">{request.userName}</div>
                              <span className=''>
                                사용자 ID : {request.userId}
                              </span>
                            </div>
                            <div className=" text-gray-800">회사명 : {request.company}</div>
                            <div className=" text-gray-500">요청일 : {formatDate(request.createdAt)}</div>
                            <div className="flex gap-2 pt-2">
                              <Button onClick={() => handleAction(request, 'approve')} className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded ">승인</Button>
                              <Button onClick={() => handleAction(request, 'reject')} className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded ">거절</Button>
                            </div>
                          </div>

                          {/* Desktop View */}
                          <div className="flex items-center gap-2">
                            <img src={request.imgPath || '/images/default-avatar.png'} className="w-9 h-9 rounded-full object-cover" alt={`${rec.userName} profile`} />
                            <span className="hidden md:block col-span-1  font-medium text-gray-900">{request.userName}</span>
                          </div>
                          <div className=" text-gray-800">{request.nickName}</div>
                          <div className="hidden md:block col-span-1">
                            <span >
                              {request.userId}
                            </span>
                          </div>
                          <div className="hidden md:block col-span-1  text-gray-500">{formatDate(request.birthDate)}</div>
                          <div className="hidden md:block col-span-1  text-gray-500">{formatDate(request.address)}</div>
                          <div className="hidden md:block col-span-1  text-gray-500">
                            <span className="truncate">
                              {formatDate(request.didAddress)}
                            </span>
                            <button onClick={() => handleCopy(rec.didAddress)} className="text-gray-400 hover:text-blue-600 transition-colors">
                              {copiedDid === request.didAddress ? (
                                <span className="text-xs text-blue-600">Copied!</span>
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {/* <div className="hidden md:flex col-span-1 justify-center gap-2">
                            <Button
                              onClick={() => handleAction(request, 'approve')}
                              disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                              className="bg-green-100 text-green-800 hover:bg-green-200 px-6 py-2 cursor-pointer rounded-lg"
                            >
                              승인
                            </Button>
                            <Button
                              onClick={() => handleAction(request, 'reject')}
                              disabled={processRequestMutation.isPending && requestToProcess?.id === request.id}
                              className="bg-red-100 text-red-800 hover:bg-red-200 px-6 py-2 cursor-pointer rounded-lg"
                            >
                              거절
                            </Button>
                          </div> */}
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
                    className="px-4 cursor-pointer py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 "
                  >
                    다음
                  </button>
                </div>
              )}</div>
          </div>
        </div>
      </div>
    </div>

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

    {/* {verified && <Processing ImageName={"/images/verified.gif"} failed={false} />}
    {load && <Processing ImageName={"/images/Processing.gif"} failed={false} className="mb-8" />}
    {iserror && <Processing ImageName={"/images/failed.png"} failed={true} className="mb-8" />} */}
  </div>
);