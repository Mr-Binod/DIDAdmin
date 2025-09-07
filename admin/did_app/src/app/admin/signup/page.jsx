"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import ProgressBar from "@/components/UI/ProgressBar";
import LoadingSpinner from "@/components/UI/Spinner";
import Image from "next/image";
import CompletePopup from "@/components/UI/CompletePopup";
import axios from "axios";


// 입력 상태에 따른 스타일 반환
const getInputStatus = (value, isValid, hasError = false) => {
  if (!value) return "";
  // if (hasError) return "border-red-300 ";
  // return isValid ? " " : "border-red-300 ";
};

export default function AdminSignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [lastCheckedId, setLastCheckedId] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isPopup, setIsPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [file, setFile] = useState(null);
  const [dob, setDob] = useState(null);
  const [nickname, setNickname] = useState("");

  // 폼 데이터 임시 저장 (새로고침 대응)
  useEffect(() => {
    const savedData = localStorage.getItem("admin_signup_temp");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setUserName(data.userName || "");
        setUserId(data.userId || "");
        setCompany(data.company || "");
        setCurrentStep(data.currentStep || 1);
      } catch (error) {
        console.error("임시 데이터 로드 실패:", error);
      }
    }
  }, []);

  // 폼 데이터 임시 저장
  useEffect(() => {
    const tempData = {
      userName, userId, company, currentStep
    };
    localStorage.setItem("admin_signup_temp", JSON.stringify(tempData));
  }, [userName, userId, company, currentStep]);

  // 아이디가 변경되면 중복체크 상태 초기화
  useEffect(() => {
    if (userId !== lastCheckedId) {
      setIsIdChecked(false);
      setIdCheckStatus("");
    }
  }, [userId, lastCheckedId]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (currentStep < 3) {
          let isCurrentStepValid = false;
          
          if (currentStep === 1) {
            const userNameRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;
            const userIdRegex = /^[a-zA-Z0-9]{4,20}$/;
            
            isCurrentStepValid = userName.trim().length >= 2 && 
                   userName.trim().length <= 20 &&
                   userName === userName.trim() &&
                   userNameRegex.test(userName.trim()) &&
                   !/(.)\1{2,}/.test(userName.trim()) &&
                   userId.trim().length >= 4 && 
                   userId.trim().length <= 20 &&
                   userId === userId.trim() &&
                   userIdRegex.test(userId.trim()) &&
                   !/(.)\1{2,}/.test(userId.trim()) &&
                   isIdChecked &&
                   idCheckStatus === "available" &&
                   userId === lastCheckedId;
          } else if (currentStep === 2) {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>?]).{8,}$/;
            const passwordValid = regex.test(password);
            isCurrentStepValid = passwordValid && password === confirm;
          }
          
          if (isCurrentStepValid) {
            setCurrentStep(currentStep + 1);
          } else {
            handleNext();
          }
        } else if (currentStep === 3 && !isPopup) {
          handleSubmit();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, userName, userId, password, confirm, company, isIdChecked, idCheckStatus, lastCheckedId]);

  const pwdValid = useMemo(() => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>?]).{8,}$/;
    return regex.test(password);
  }, [password]);

  const pwdOk = useMemo(() => pwdValid && password === confirm, [pwdValid, password, confirm]);

  // 아이디 중복 체크 함수
  const checkIdAvailability = useCallback(async () => {
    const trimmedId = userId.trim();
    
    if (!trimmedId || trimmedId.length < 4) {
      showErrorModal("아이디를 4자 이상 입력해주세요.");
      return;
    }

    if (trimmedId.length > 20) {
      showErrorModal("아이디는 20자 이하로 입력해주세요.");
      return;
    }

    const idRegex = /^[a-zA-Z0-9]+$/;
    if (!idRegex.test(trimmedId)) {
      showErrorModal("아이디는 영문자와 숫자만 사용 가능합니다.");
      return;
    }

    if (/(.)\1{2,}/.test(trimmedId)) {
      showErrorModal("아이디에 같은 문자를 3번 이상 연속 사용할 수 없습니다.");
      return;
    }

    setIdCheckStatus("checking");
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      // const isAvailable = !admins.some((admin) => admin.userId === trimmedId);
      console.log(process.env.NEXT_PUBLIC_BASE_URL + `/admins/${trimmedId}`);
      const admin = await axios.get(process.env.NEXT_PUBLIC_BASE_URL + `/admin/find/${trimmedId}`);
      console.log(admin, 'admin');  

      
  
      if (admin.data.state !== 200) {
        setIdCheckStatus("available");
        setIsIdChecked(true);
        setLastCheckedId(trimmedId);
        showErrorModal("사용 가능한 아이디입니다!");
      } else {
        setIdCheckStatus("unavailable");
        setIsIdChecked(false);    
        showErrorModal("이미 사용 중인 아이디입니다.");
      }
    } catch (error) {
      setIdCheckStatus("");
      setIsIdChecked(false);
      showErrorModal("중복체크 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 각 단계별 완료 조건
  const step1Valid = useMemo(() => {
    const userNameRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;
    const userIdRegex = /^[a-zA-Z0-9]{4,20}$/;
    
    return userName.trim().length >= 2 && 
           userName.trim().length <= 20 &&
           userName === userName.trim() &&
           userNameRegex.test(userName.trim()) &&
           !/(.)\1{2,}/.test(userName.trim()) &&
           userId.trim().length >= 4 && 
           userId.trim().length <= 20 &&
           userId === userId.trim() &&
           userIdRegex.test(userId.trim()) &&
           !/(.)\1{2,}/.test(userId.trim()) &&
           isIdChecked &&
           idCheckStatus === "available" &&
           userId === lastCheckedId;
  }, [userName, userId, isIdChecked, idCheckStatus, lastCheckedId]);

  const step2Valid = useMemo(() => pwdOk, [pwdOk]);

  const step3Valid = useMemo(() => {
    return company.trim().length > 0;
  }, [company]);

  // 모달 관련 함수들
  const showErrorModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  // 다음 단계로
  const handleNext = () => {
    if (currentStep === 1) {
      if (!step1Valid) {
        if (!userName.trim()) {
          showErrorModal("관리자명을 입력해주세요.");
          return;
        }
        if (userName !== userName.trim()) {
          showErrorModal("관리자명의 앞뒤 공백을 제거해주세요.");
          return;
        }
        if (userName.trim().length < 2) {
          showErrorModal("관리자명은 2자 이상 입력해주세요.");
          return;
        }
        if (userName.trim().length > 20) {
          showErrorModal("관리자명은 20자 이하로 입력해주세요.");
          return;
        }
        const userNameRegex = /^[가-힣a-zA-Z0-9]{2,20}$/;
        if (!userNameRegex.test(userName.trim())) {
          showErrorModal("관리자명은 한글, 영문, 숫자만 사용 가능합니다.");
          return;
        }
        if (/(.)\1{2,}/.test(userName.trim())) {
          showErrorModal("관리자명에 같은 문자를 3번 이상 연속 사용할 수 없습니다.");
          return;
        }
        if (!userId.trim()) {
          showErrorModal("아이디를 입력해주세요.");
          return;
        }
        if (!isIdChecked) {
          showErrorModal("아이디 중복체크를 완료해주세요.");
          return;
        }
        if (userId !== lastCheckedId) {
          showErrorModal("아이디가 변경되었습니다. 중복체크를 다시 진행해주세요.");
          return;
        }
        if (idCheckStatus !== "available") {
          showErrorModal("사용 가능한 아이디를 입력해주세요.");
          return;
        }
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      console.log(dob, 'dob');
      if (!step2Valid) {
        if (!password.trim()) {
          showErrorModal("비밀번호를 입력해주세요.");
          return;
        }
        if (!pwdValid) {
          showErrorModal("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
          return;
        }
        if (!pwdOk) {
          showErrorModal("비밀번호가 일치하지 않습니다.");
          return;
        }
        if(!dob){
          showErrorModal("생년월일을 입력해주세요.");
          return;
        }
        return;
      }
      setCurrentStep(3);
    }
  };

  // 이전 단계로
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 회원가입 완료
  const handleSubmit = async () => {
    if (!step3Valid) {
      if (!company.trim()) {
        showErrorModal("회사명을 입력해주세요.");
        return;
      }
      return;
    }

    setLoading(true);
    setRetryCount(0);

    const attemptSignup = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // const newAdmin = {
        //   userId: userId.trim(),
        //   userName: userName.trim(),
        //   password,
        //   company: company.trim(),
        //   grade: "1", // 기본값으로 레벨 1 설정
        //   approved: false, // 슈퍼관리자 승인 대기 상태
        //   createdAt: new Date().toISOString()
        // };

        const formdata = new FormData();
        formdata.append('file', file);
        formdata.append('userId', userId);
        formdata.append('userName', userName);
        formdata.append('nickName', nickname);
        formdata.append('password', password);
        formdata.append('birthDate', dob);

      
        // localStorage.setItem("admins", JSON.stringify([...admins, newAdmin]));
        
        // 임시 데이터 삭제
        // localStorage.removeItem("admin_signup_temp");
        const response = await axios.post(process.env.NEXT_PUBLIC_BASE_URL + "/admin/request", formdata);
        console.log(response);
        setPopupMessage("관리자 회원가입이 완료되었습니다! 슈퍼관리자의 승인을 기다려주세요.");
        setIsPopup(true);
        // setTimeout(() => {
        //   window.location.href = "/";
        // }, 2000);

      } catch (error) {
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          showErrorModal(`오류가 발생했습니다. 다시 시도헤주세요`);
          // setTimeout(attemptSignup, 1000);
        } else {
          showErrorModal("회원가입 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
        }
      } finally {
        setLoading(false);
      }
    };

    await attemptSignup();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    setFile(file);    
  };

  return (
    <main className="min-h-screen bg-[url('/images/intro.png')] bg-cover bg-center  px-3 py-30 sm:px-4 sm:py-15 sm:flex sm:items-center sm:justify-center">
      <h1 className='text-3xl z-100 font-bold  absolute top-3 left-0 lg:left-10'>
        <Image src="/images/logo.png" alt="logo" width={70} height={50} className='inline-block  cursor-pointer' />
        <Link href="/" className='font-noto-serif '>Sealium</Link></h1>
      <div className="opacity-100 bg-sky-100  w-full max-w-sm mx-auto sm:max-w-md lg:max-w-3xl rounded-2xl  shadow-lg p-6 sm:p-8 lg:px-20 ">
        <div className="text-center mb-2 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">관리자 회원가입</h1>
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={3} />

        <div className="min-h-[320px] sm:min-h-[350px]">
          {/* 1단계: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">기본 정보</h2>
                <p className="text-xs sm:text-sm ">관리자명과 아이디를 입력해주세요</p>
              </div>
                 <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium mb-2" htmlFor="userId">아이디</label>
                <div className="flex gap-2 mb-4">
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="영문/숫자 4-20자"
                    className={`h-10 text-base flex-1 ${getInputStatus(userId, isIdChecked && idCheckStatus === "available" && userId === lastCheckedId, userId && (userId !== userId.trim() || idCheckStatus === "unavailable"))}`}
                    aria-label="아이디 입력"
                  />
                  <Button
                    type="button"
                    onClick={checkIdAvailability}
                    disabled={!userId.trim() || userId.trim().length < 4 || loading || idCheckStatus === "checking"}
                    className="bg-cyan-600 text-white cursor-pointer hover:bg-cyan-500 px-4 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap h-10"
                    aria-label="아이디 중복체크"
                  >
                    {idCheckStatus === "checking" ? (
                      <LoadingSpinner message="확인중" size="sm" color="white" />
                    ) : (
                      "중복체크"
                    )}
                  </Button>
                </div>
                <div className="mt-1">
                  {userId && userId !== userId.trim() && (
                    <p className="text-xs text-red-600" role="alert">앞뒤 공백을 제거해주세요</p>
                  )}
                  {userId && userId.trim().length > 0 && userId.trim().length < 4 && (
                    <p className="text-xs text-red-600" role="alert">4자 이상 입력해주세요</p>
                  )}
                  {isIdChecked && idCheckStatus === "available" && userId === lastCheckedId && (
                    <p className="text-xs text-green-600">사용 가능한 아이디입니다</p>
                  )}
                  {idCheckStatus === "unavailable" && (
                    <p className="text-xs text-red-600" role="alert">이미 사용 중인 아이디입니다</p>
                  )}
                  {userId !== lastCheckedId && isIdChecked && (
                    <p className="text-xs text-orange-600" role="alert">아이디가 변경되었습니다. 중복체크를 다시 진행해주세요</p>
                  )}
                </div>
              </div>

              
              <div className="mb-4 sm:mb-6" >
                <label className="block text-sm font-medium mb-2" htmlFor="userName">이름</label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="한글, 영문"
                  className={`box-border h-10 text-base ${getInputStatus(userName, userName.trim().length >= 2 && userName.trim().length <= 20 && /^[가-힣a-zA-Z0-9]{2,20}$/.test(userName.trim()) && !/(.)\1{2,}/.test(userName.trim()), userName && (userName !== userName.trim() || userName.trim().length < 2 || userName.trim().length > 20 || !/^[가-힣a-zA-Z0-9]{2,20}$/.test(userName.trim()) || /(.)\1{2,}/.test(userName.trim())))}`}
                  aria-label="관리자명 입력"
                />
                {userName && userName !== userName.trim() && (
                  <p className="text-xs text-red-600 mt-1" role="alert">앞뒤 공백을 제거해주세요</p>
                )}
                {userName.trim() && userName.trim().length > 0 && userName.trim().length < 2 && (
                  <p className="text-xs text-red-600 mt-1" role="alert">2자 이상 입력해주세요</p>
                )}
                {userName.trim() && userName.trim().length > 20 && (
                  <p className="text-xs text-red-600 mt-1" role="alert">20자 이하로 입력해주세요</p>
                )}
                {userName.trim() && userName.trim().length >= 2 && userName.trim().length <= 20 && !/^[가-힣a-zA-Z0-9]{2,20}$/.test(userName.trim()) && (
                  <p className="text-xs text-red-600 mt-1" role="alert">한글, 영문, 숫자만 사용 가능합니다</p>
                )}
                {userName.trim() && /(.)\1{2,}/.test(userName.trim()) && (
                  <p className="text-xs text-red-600 mt-1" role="alert">같은 문자를 3번 이상 연속 사용할 수 없습니다</p>
                )}
                {userName.trim() && userName.trim().length >= 2 && userName.trim().length <= 20 && /^[가-힣a-zA-Z0-9]{2,20}$/.test(userName.trim()) && !/(.)\1{2,}/.test(userName.trim()) && (
                  <p className="text-xs text-green-600 mt-1">사용 가능한 관리자명입니다</p>
                )}
              </div>
          <div>
            <div className="mb-4 sm:mb-6">
                <label htmlFor="" className="block text-sm font-medium mb-2">닉네임</label>
                 <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="한글, 영문"
                    className= "h-10 text-base flex-1"
                    
                  />
              </div>

          <label htmlFor="" className="block text-sm font-medium mb-2 ">사진 올려주세요</label>
          <label htmlFor="fileInput" className=" block text-sm font-medium mb-2 w-full border border-gray-400 rounded-lg cursor-pointer py-2 text-center" >{file ? file.name : 'choose file'}</label>
          <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
          </div>
          </div>
          )}
          {/* 2단계: 보안 정보 */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">보안 정보</h2>
                <p className="text-xs sm:text-sm text-gray-600">안전한 비밀번호를 설정해주세요</p>
              </div>
              <div>
                <label htmlFor="" className="block text-md font-medium mb-2">생년월일</label>
                <Input
                  className="h-10 text-base w-full"
                  id="birth"
                  type="date"
                  onChange={(e) => setDob(e.target.value)}
                  value={dob || ""}
                  />
              </div>
              <div>
                <label className="block text-md font-medium mb-2" htmlFor="password">비밀번호</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                    className={`h-10 text-base pr-10 ${getInputStatus(password, pwdValid)}`}
                    aria-label="비밀번호 입력"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? "숨기기" : "보기"}
                  </button>
                </div>
                <div className="mt-1">
                  {password.length > 0 && !pwdValid && (
                    <p className="text-xs text-red-600" role="alert">영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요</p>
                  )}
                  {pwdValid && (
                    <p className="text-xs text-green-600">안전한 비밀번호입니다</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-md font-medium mb-2" htmlFor="confirm-password">비밀번호 확인</label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className={`h-10 text-base pr-10 ${getInputStatus(confirm, password === confirm && confirm.length > 0, confirm.length > 0 && password !== confirm)}`}
                    aria-label="비밀번호 확인"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                    aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showConfirmPassword ? "숨기기" : "보기"}
                  </button>
                </div>
                <div className="mt-1">
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-xs text-red-600" role="alert">비밀번호가 일치하지 않습니다</p>
                  )}
                  {confirm.length > 0 && password === confirm && (
                    <p className="text-xs text-green-600">비밀번호가 일치합니다</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3단계: 회사 정보 */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">회사 정보</h2>
                <p className="text-xs sm:text-sm text-gray-600">직위 정보를 입력해주세요</p>
              </div>

              <div>
                <label className="block text-md font-bold mb-2 " htmlFor="company">직위</label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="소속 회사명을 입력해주세요"
                  className={`h-10 text-base ${getInputStatus(company, company.trim().length > 0)}`}
                  aria-label="회사명 입력"
                />
                {company.trim() && (
                  <p className="text-xs text-green-600 mt-1">직위 입력되었습니다</p>
                )}
              </div>

              {/* 입력 정보 확인 */}
              <div className="  bg-cyan-50 p-4 rounded-xl mt-6">
                <h3 className="font-medium mb-3">입력하신 정보 확인</h3>
                <div className="lg:space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium block lg:inline-block w-70 ">관리자명: {userName}</span><span className="font-medium ">사진:{file.name} </span> </p>
                  <p><span className="font-medium block lg:inline-block w-70">아이디: {userId}</span><span className="font-medium ">생년원일: {dob}</span> </p>
                  <p><span className="font-medium block lg:inline-block w-70">직위: {company}</span><span className="font-medium "></span> </p>
                  <p><span className="font-medium block lg:inline-block w-70">회사명: 경일게임IT 아카데미</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between mt-12 lg:mt-16">
          {currentStep > 1 ? (
            <Button
              onClick={handlePrev}
              className="bg-gray-500 text-white cursor-pointer hover:bg-gray-400 px-6 py-2 rounded-lg transition-colors"
              aria-label="이전 단계로"
            >
              이전
            </Button>
          ) : (
            <Link 
              href="/" 
              className=" hover:underline text-blue-600  inline-block text-center transition-colors"
              aria-label="관리자 로그인 페이지로 이동"
            >
              로그인하기
            </Link>
          )}

          {currentStep < 3 ? (
            currentStep === 1 ? <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !step1Valid) ||
                !nickname ||
                !file ||
                // !dob ||
                loading
              }
              className="bg-green-600 text-white cursor-pointer hover:bg-green-500 px-6 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              aria-label="다음 단계로"
            >
              {loading ? <LoadingSpinner message="확인 중..." /> : "다음"}
            </Button> : <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !step1Valid) ||
                (currentStep === 2 && !step2Valid) ||
                !file ||
                !dob ||
                loading
              }
              className="bg-green-600 text-white cursor-pointer hover:bg-green-500 px-6 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              aria-label="다음 단계로"
            >
              {loading ? <LoadingSpinner message="확인 중..." /> : "다음"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!step3Valid || loading}
              className="bg-green-600 text-white cursor-pointer hover:bg-green-500 px-6 py-2 rounded-lg disabled:bg-gray-00 disabled:cursor-not-allowed transition-colors min-w-[100px]"
              aria-label="회원가입 완료"
            >
              {loading ? <LoadingSpinner message="가입 중..." /> : "가입 완료"}
            </Button>
          )}
        </div>
      </div>

      {/* 모달 */}
      <Modal 
        isOpen={showModal} 
        message={modalMessage} 
        onClose={closeModal}
        aria-label="알림 모달"
      />
      {isPopup && 
        <CompletePopup isOpen={isPopup} message={popupMessage} onclose={() => setIsPopup(false)}/>}
    </main>
  );
}