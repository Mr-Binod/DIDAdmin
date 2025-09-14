"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Modal from "../UI/Modal";
import AdminSignupForm from "../../app/admin/signup/page";
import axiox from "axios";
import { useAdminInfoStore } from "../../Store/useAdminStore";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';


export default function LoginForm() {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // "error" 또는 "rejection"

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

  const onSubmit = async (e) => {
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
      console.log(process.env.NEXT_PUBLIC_BASE_URL, 'baseurl')
      const adminLogin = await axiox.post(process.env.NEXT_PUBLIC_BASE_URL + "/admin/login", {
        userId: idOrEmail,
        password: password
      },
        { withCredentials: true }
      )
      console.log(adminLogin, "adminLogin");

      // 관리자 목록이 비어있는 경우
      if (adminLogin.data.state !== 200) {
        return showErrorModal(adminLogin.data.message);
      }

      // setAdmin(adminLogin.data.data.data[0]);
      router.push("/admin/dashboard"); // window.location.href = "/admin/dashboard";
    } catch (error) {
      showErrorModal(error.message);
    } finally {
      setLoading(false);
    }
  };

  function CurvedSealium() {
    const groupRef = useRef();
    const letters = 'Sealium'.split('');
    const radius = 5; // radius of the curve

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= 0.012; // rotate around Y-axis
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {letters.map((letter, i) => {
                const angle = (i - (letters.length - 1) / 2) * 0.32; // spacing
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;
                const rotationY = angle;

                return (
                    <Text
                        key={i}
                        position={[x, 0, z]}
                        rotation={[0, rotationY, 0]}
                        fontSize={2}
                        color="#2A4259"
                        anchorX="center"
                        anchorY="middle"
                        font="/Merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf"
                    >
                        {letter}
                    </Text>
                );
            })}
        </group>
    );
}

function RotatingText() {
    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <CurvedSealium />
        </Canvas>
    );
}



  return (
    <>
      <main className=" w-full  min-h-screen lg:justify-end bg-[url('/images/intro.png')] bg-cover bg-center lg:px-50 px-4 py-8">
        <h1 className='text-3xl z-100 font-bold  absolute top-3 left-0 lg:left-10'>
          <Image src="/images/logo.png" alt="logo" width={70} height={50} className='inline-block  cursor-pointer' />
          <Link href="/" className='font-noto-serif '>Sealium</Link></h1>
        <div className="lg:block absolute top-25 left-1/2 -translate-x-1/2 w-210 text-4xl font-bo font-noto-serif">
          Sealium은 블록체인 기반의 안전하고 편리한 디지털 신원 관리 솔루션입니다.
        </div>
        <div className="flex order-none items-center mt-20 justify-between">
          <div className="w-150 mt-50  h-80 text-5xl font-merriweather" >
            <RotatingText />
          </div>
          <div className="mt-40 opacity-95 bg-sky-100 w-full  max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl  shadow-lg p-6 sm:p-8">
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

        </div>
      </main>

      {showModal && (
        <Modal isOpen={showModal} onClose={closeModal}>
          <div className=" flex flex-col justify-between w-90 h-50 text-xl items-center text-textIcons">
            <h3 className={`text-2xl text-center font-semibold mb-4 ${modalType === "rejection" ? "text-red-600" : "text-gray-900"
              }`}>
              {modalType === "rejection" ? "가입 거절 안내" : "알림"}
            </h3>
            <div className={`mb-6 whitespace-pre-line font-medium ${modalType === "rejection" ? "text-red-700" : "text-textIcons"
              }`}>
              {modalMessage}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className={`px-8 py-2 rounded text-whiteback cursor-pointer ${modalType === "rejection"
                  ? "bg-rose-400 hover:bg-red-700"
                  : "bg-green-800 hover:bg-green-700"
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