"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import Modal from "@/components/UI/Modal";
import AdminSignupForm from "@/app/admin/signup/page";
import axiox from "axios";
import { useAdminInfoStore } from "@/Store/useAdminStore";
import { useRouter } from "next/navigation";


export default function LoginForm() {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // "error" 또는 "rejection"
  const {admin, setAdmin} = useAdminInfoStore();
  const router = useRouter();
  // 컴포넌트 마운트시 모달 상태 초기화
  useEffect(() => {
    setShowModal(false);
    setModalMessage("");
    setModalType("error");
  }, []);

  // 모달 관련 함수들
  const showErrorModal = (message) => {
    setModalMessage(message);
    setModalType("error");
    setShowModal(true);
  };

  const showRejectionModal = (message) => {
    setModalMessage(message);
    setModalType("rejection");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("error");
  };

  const onSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
  
    // 입력값 검증
    if (!idOrEmail.trim()) {
      showErrorModal("아이디를 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      showErrorModal("비밀번호를 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const adminLogin = await axiox.post(process.env.NEXT_PUBLIC_BASE_URL + "/admin/login", {
        userId: idOrEmail,
        password: password
      })
      console.log(adminLogin, "adminLogin");

      // 관리자 목록이 비어있는 경우
      if (adminLogin.data.state !== 200) {
        return showErrorModal(adminLogin.data.message);
      }

      // 아이디로 먼저 사용자 찾기
      // const foundUser = admins.find((admin) => admin.userId === idOrEmail); 
      // if (!foundUser) {
      //   throw new Error("등록되지 않은 아이디입니다.");
      // }
      // // 비밀번호 확인
      // if (foundUser.password !== password) {
      //   throw new Error("비밀번호가 일치하지 않습니다.");
      // }

      // 거절 상태 체크 (거절 사유와 함께 표시)
      // if (foundUser.rejected) {
      //   const rejectionMessage = foundUser.rejectionReason
      //     ? `가입 요청이 거절되었습니다.\n\n거절 사유:\n${foundUser.rejectionReason}\n\n문의사항이 있으시면 관리자에게 연락해주세요.`
      //     : "가입 요청이 거절되었습니다.\n\n거절 사유가 기록되지 않았습니다.\n관리자에게 문의해주세요.";

      //   showRejectionModal(rejectionMessage);
      //   setLoading(false);
      //   return;
      // }

      // 승인 대기 상태 체크
      // if (!foundUser.approved) {
      //   showErrorModal("관리자 승인 대기 중입니다.\n슈퍼관리자의 승인을 기다려주세요.");
      //   setLoading(false);
      //   return;
      // }

      // 로그인 성공 후 현재 사용자만 저장
      // localStorage.setItem("currentAdmin", JSON.stringify(foundUser));

      // 일반 관리자 대시보드로 이동
      setAdmin(adminLogin.data.data.data[0]);
      router.push("/admin/dashboard"); // window.location.href = "/admin/dashboard";
    } catch (error) {
      showErrorModal(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className=" w-full flex min-h-screen items-center justify-center lg:justify-end bg-[url('/images/intro.png')] bg-cover bg-center lg:px-50 px-4 py-8">
        <h1 className='text-3xl z-100 font-bold  absolute top-3 left-0 lg:left-10'>
          <Image src="/images/logo.png" alt="logo" width={70} height={50} className='inline-block  cursor-pointer' />
          <Link href="/" className='font-noto-serif '>Sealium</Link></h1>
        <div className="hidden lg:block absolute top-2/5 left-30 w-130 z-100 text-3xl font-bo font-noto-serif">
          Sealium은 블록체인 기반의 안전하고 편리한 디지털 신원 관리 솔루션입니다.
        </div>
        <div className=" opacity-95 bg-sky-100 w-full  max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl  shadow-lg p-6 sm:p-8">
          <h1 className=" text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
            관리자 로그인
          </h1>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6" noValidate>
            <div>
              <label className="block text-md font-semibold  mb-2">
                아이디
              </label>
              <Input
                type="text"
                required
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                placeholder="아이디를 입력해주세요.."
                disabled={loading}
                className="w-full px-3 py-3 sm:px-4 sm:py-4 text-base"
              />
            </div>

            <div>
              <label className="block text-md font-semibold  mb-2">
                비밀번호
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                disabled={loading}
                className="w-full px-3 py-3 sm:px-4 sm:py-4 text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="text-white mt-4 sm:mt-6 w-full h-[48px] sm:h-[52px] rounded-xl bg-indigo-800 hover:bg-green-700 cursor-pointer  text-base sm:text-lg font-medium transition-colors duration-200"
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 space-y-3">
            <p className="text-center text-sm ">
              아직 계정이 없으신가요?{" "}
              <Link href="/admin/signup" className=" text-blue-600 hover:underline font-medium">
                회원가입
              </Link>
            </p>

          </div>
        </div>
      </main>

      {showModal && (
        <Modal isOpen={showModal} onClose={closeModal}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${modalType === "rejection" ? "text-red-600" : "text-gray-900"
              }`}>
              {modalType === "rejection" ? "가입 거절 안내" : "알림"}
            </h3>
            <div className={`mb-6 whitespace-pre-line ${modalType === "rejection" ? "text-red-700" : "text-gray-600"
              }`}>
              {modalMessage}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded  ${modalType === "rejection"
                  ? "bg-rose-400 hover:bg-red-700"
                  : "bg-amber-200 hover:bg-amber-500"
                  }`}
              >
                확인
              </button>
              {modalType === "rejection" && (
                <Link href="/admin/signup">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 "
                  >
                    다시 가입하기
                  </button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}