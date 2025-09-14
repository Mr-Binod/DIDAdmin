// src/app/certificates/issue/page.jsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Icons
const CertificateIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m10.5 15.5 2 2 4-4" />
  </svg>
);

const BuildingIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);

const MessageSquareIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// 더미 수료증 목록 (기관에서 정해준 수료증들)
const AVAILABLE_CERTIFICATES = [
  { id: "blockchain-basic", name: "블록체인 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "blockchain-advanced", name: "블록체인 심화 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "smart-contract", name: "스마트컨트랙트 개발 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "did-system", name: "DID 인증 시스템 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "web3-architecture", name: "웹3 서비스 아키텍처 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "crypto-basics", name: "암호학 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "nft-development", name: "NFT 개발 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "defi-basics", name: "DeFi 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "frontend-react", name: "React 프론트엔드 개발 과정 수료증", issuer: "크로스허브" },
  { id: "backend-nodejs", name: "Node.js 백엔드 개발 과정 수료증", issuer: "크로스허브" },
  { id: "fullstack-web", name: "풀스택 웹 개발 과정 수료증", issuer: "크로스허브" },
  { id: "mobile-react-native", name: "React Native 모바일 개발 과정 수료증", issuer: "크로스허브" },
];

export default function IssueCertificatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    certificateId: "",
    issuer: "", // 수료증 선택 시 기본값 자동 입력
    reason: "", // 발급 요청 사유
  });

  // 선택된 수료증 정보
  const selectedCertificate = useMemo(() => {
    return AVAILABLE_CERTIFICATES.find((cert) => cert.id === formData.certificateId);
  }, [formData.certificateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "certificateId") {
      // 수료증 선택 시 발급 기관 자동 설정
      const selected = AVAILABLE_CERTIFICATES.find((cert) => cert.id === value);
      setFormData((prev) => ({
        ...prev,
        certificateId: value,
        issuer: selected?.issuer || ""
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: Date.now(),
      certificateId: formData.certificateId,
      certificateName: selectedCertificate?.name,
      issuer: formData.issuer,
      reason: formData.reason,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    console.log("발급 요청 데이터:", payload); //  저장할 데이터 확인

    // 알림 저장
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      title: '수료증 발급 요청',
      message: `${selectedCertificate?.name} 발급 요청이 제출되었습니다.`,
      ts: Date.now(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // 발급 요청 목록에 저장
    const existingRequests = JSON.parse(localStorage.getItem('certificate_requests') || '[]');
    console.log("기존 요청들:", existingRequests); //  기존 데이터 확인

    const updatedRequests = [payload, ...existingRequests];
    console.log("업데이트된 요청들:", updatedRequests); // 업데이트될 데이터 확인

    localStorage.setItem('certificate_requests', JSON.stringify(updatedRequests));

    // 저장 후 확인
    console.log("저장 후 확인:", localStorage.getItem('certificate_requests')); // 실제 저장된 데이터 확인

    router.push('/dashboard');
  };
  const canSubmit =
    formData.certificateId &&
    formData.issuer &&
    formData.reason.trim();

  return (<></>)
   
              

}