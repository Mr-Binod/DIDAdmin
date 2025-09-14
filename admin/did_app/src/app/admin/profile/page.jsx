"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useAdminInfoStore } from "../../../Store/useAdminStore";
import { useQueryClient } from "@tanstack/react-query";

// --- ICONS ---
// Grouping icons for better organization.
const IdCardIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 7h.01" /><path d="M10 7h4" /><path d="M10 12h4" /><path d="M7 12h.01" /><path d="M10 17h4" /><path d="M7 17h.01" />
  </svg>
);

const BuildingIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
  </svg>
);

const CakeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16h16" /><path d="M10 7V5" /><path d="M14 7V5" /><path d="M12 7V2" /><path d="M12 2l.5 2 1 1-1.5 2-1.5-2 1-1 .5-2z" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const WalletIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3v-2a1 1 0 0 0-1-1Z" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
  </svg>
);

const MailIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const FingerprintIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0-1.02.1-2.51.26-4A2 2 0 0 0 12 7a2 2 0 0 0-2 2" /><path d="M12 5a2 2 0 0 1 2 2c0 1.02.1 2.51.26 4" /><path d="M10 13.12c0-1.02-.1-2.51-.26-4A2 2 0 0 1 12 7a2 2 0 0 1 2 2" /><path d="M14.24 15.9c.22-1.2.34-2.54.34-4.16a4 4 0 0 0-8 0c0 1.62.12 2.95.34 4.16" /><path d="M16.5 17.55c.18-1.33.28-2.8.28-4.72a6 6 0 0 0-12 0c0 1.93.1 3.4.28 4.72" /><path d="M18.83 18.97c.13-1.43.2-3.05.2-5.14a8 8 0 0 0-16 0c0 2.09.07 3.71.2 5.14" />
  </svg>
);

const PencilIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
  </svg>
);

const CheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CameraIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="h-9 w-36 bg-gray-800 rounded-md"></div>
      <div className="h-9 w-32 bg-gray-800 rounded-lg"></div>
    </div>

    <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50">
      {/* Skeleton Header */}
      <div className="p-8 border-b border-gray-800 relative min-h-[220px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-gray-800"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-40 bg-gray-800 rounded-md"></div>
            <div className="h-5 w-28 bg-gray-800 rounded-md"></div>
            <div className="h-6 w-24 bg-gray-800 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Skeleton Details */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[...Array(6)].map((_, i) =>
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="w-6 h-6 bg-gray-800 rounded-md mt-1"></div>
              <div className="flex-grow space-y-2">
                <div className="h-5 w-24 bg-gray-800 rounded"></div>
                <div className="h-6 w-3/4 bg-gray-800 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ProfileEditModal = ({ isOpen, onClose, userInfo, onProfileUpdate }) => {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { admin, setAdmin } = useAdminInfoStore();

  const queryclient = useQueryClient();

  useEffect(() => {
    const loadInitialFile = async () => {
      if (userInfo && isOpen) {
        console.log('email', userInfo.emailId)
        setFormData({
          username: userInfo.userName || '',
          email: userInfo.emailId || 'example@email.com', // Placeholder
        });
        const imageUrl = userInfo?.imgPath || '/images/default-avatar.png';
        setPreviewUrl(imageUrl);
        setError(null);
        setSuccessMessage('');

        try {
          if (!imageUrl) return
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const filename = imageUrl.split('/').pop() || 'profile.png';
          const file = new File([blob], filename, { type: blob.type });
          setProfilePicFile(file);
        } catch (err) {
          console.error('Failed to load initial profile image as a file:', err);
          setProfilePicFile(null);
        }
      }
    };
    loadInitialFile();
  }, [userInfo, isOpen, admin]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    const data = new FormData();
    data.append('userName', formData.username);
    data.append('emailId', formData.email);
    if (profilePicFile) {
      // Ensure the file is sent with the correct field name expected by the backend
      data.append('file', profilePicFile);
    }
    try {
      const response = await axios.patch(process.env.NEXT_PUBLIC_BASE_URL + `/admin/${admin.userId}`, data, {
        withCredentials: true
      });

      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
      // The backend response for PATCH should contain the updated admin data.
      const updatedAdmin = response.data.data;
      onProfileUpdate(updatedAdmin);
      queryclient.invalidateQueries({ queryKey: ['adminsInfo'] });
      setTimeout(async () => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the profile.');
      setIsSubmitting(false);
    }
    // useEffect(() => {
    //   const reducedNewUsers = records.reduce((acc, rec) => {
    //     if (rec.createdAt) {
    //       const date = rec.createdAt.split("T")[0];
    //       acc[date] = (acc[date] || 0) + 1;
    //     }
    //     return acc;
    //   }, {});

    //   const reducedTodayVisitors = records.reduce((acc, rec) => {
    //     if (rec.updatedAt) {
    //       const date = rec.updatedAt.split("T")[0];
    //       acc[date] = (acc[date] || 0) + 1;
    //     }
    //     return acc;
    //   }, {});

    //   const newUsersDates = Object.keys(reducedNewUsers).sort();
    //   const newUsersCounts = newUsersDates.map(date => reducedNewUsers[date]);
    //   setNewUsersChartData({ dates: newUsersDates, counts: newUsersCounts });

    //   const visitorsDates = Object.keys(reducedTodayVisitors).sort();
    //   const visitorsCounts = visitorsDates.map(date => reducedTodayVisitors[date]);
    //   setVisitorsChartData({ dates: visitorsDates, counts: visitorsCounts });
    // }, []);

  };

  if (!isOpen) return null;

  return (
    <div className="fixed text-textIcons inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm animate-backdrop-in" onClick={onClose}></div>
      <div className="relative  backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md m-4 animate-modal-in">
        <div className="p-6 bg-darkergray/90 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold  text-textIcons">프로필 수정</h2>
            <button onClick={onClose} className="p-2 rounded-full text-textIcons hover:bg-gray-700/50 hover:text-textIcons transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <label htmlFor="profilePicInput" className="relative group w-32 h-32 cursor-pointer">
                <img src={previewUrl} alt="Profile Preview" className="w-full h-full rounded-full object-cover border-4 border-gray-700 group-hover:border-indigo-500 transition-colors" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-8 h-8 text-textIcons" />
                </div>
              </label>
              <input id="profilePicInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <label htmlFor="" className="text-textIcons text-lg font-medium">이름</label>
            <div className="relative">

              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textIcons" />
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" className="w-full shadow-lg border border-gray-400 rounded-lg pl-12 pr-4 py-3 text-textIcons focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" />
            </div>
            <label htmlFor="" className="text-textIcons text-lg font-medium">이메일</label>

            <div className="relative">
              <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textIcons" />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full shadow-lg  border border-gray-400 rounded-lg pl-12 pr-4 py-3 text-textIcons focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" />
            </div>

            {error && !successMessage && <p className="text-sm text-red-400 text-center">{error}</p>}
            {successMessage && <p className="text-sm text-green-400 text-center">{successMessage}</p>}

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={onClose} className="w-full cursor-pointer py-3 px-4 rounded-lg bg-gray-700/90 text-darkergray hover:bg-gray-500 font-semibold transition-colors">
                취소
              </button>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 rounded-lg cursor-pointer bg-green-800 text-darkergray font-semibold hover:bg-green-700
               transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg ">
                {isSubmitting ? <Spinner /> : '변경사항 저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const WithdrawConfirmModal = ({ isOpen, onClose, userInfo }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // This is an assumed API endpoint. Please adjust it to your actual backend endpoint.
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/${userInfo.userId}`);

      // On successful withdrawal, clear session and redirect
      useAdminInfoStore.getState().setAdmin(null);
      localStorage.removeItem("currentAdmin");

      router.push('/'); // Redirect to login page

    } catch (err) {
      setError(err.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed text-textIcons inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0  backdrop-blur-sm animate-backdrop-in" onClick={onClose}></div>
      <div className="relative bg-darkergray/90 backdrop-blur-xl  rounded-2xl shadow-2xl w-full max-w-md m-4 animate-modal-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold ">회원 탈퇴</h2>
            <button onClick={onClose} className="p-2 rounded-full  hover:bg-gray-700/50 hover:text-white transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="font-medium mb-6"> <p>탈퇴하시겠습니까?</p> 이 작업은 되돌릴 수 없습니다. 계정을 영구적으로 삭제하려면 비밀번호를 입력하여 확인해주세요.</div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">비밀번호 확인</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" className="w-full  border border-gray-400 rounded-lg px-4 py-3  focus:outline-none  transition-shadow" />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full py-3 px-4 text-whiteback rounded-lg bg-gray-700 cursor-pointer hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50">취소</button>
              <button type="submit" disabled={isSubmitting || !password} className="w-full py-3 px-4 rounded-lg bg-red-900 text-white font-semibold hover:bg-red-800 cursor-pointer transition-all disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg">
                {isSubmitting ? <Spinner /> : '탈퇴하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function AdminProfilePage() {
  const [userInfo, setUserInfo] = useState(null);
  const { admin, setAdmin } = useAdminInfoStore();
  const [copied, setCopied] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    setUserInfo(admin);
  }, [admin]);

  const handleProfileUpdate = (updatedUser) => {
    setAdmin(updatedUser);
    // The modal will be closed by the timeout in the modal itself.
  };

  const handleCopy = (textToCopy, field) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!userInfo) {
    return (
      <div className="ml-64 min-h-screen   p-8">
        <ProfileSkeleton />
      </div>
    );
  }

  const InfoItem = ({ label, value, canCopy = false, fieldName = "", icon }) => (
    <div className="group flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-800/40">
      <div className="mt-1 flex-shrink-0 text-indigo-900">{icon}</div>
      <div className="flex-grow">
        <div className="text-sm font-medium text-textIcons">{label}</div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-base font-mono tracking-tight text-textIcons break-all">{value}</span>
          {canCopy && value && (
            <button
              onClick={() => handleCopy(value, fieldName)}
              className="text-textIcons opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 p-1 rounded-md hover:bg-gray-700/50 hover:text-textIcons"
            >
              {copied === fieldName ? (
                <CheckIcon className="w-4 h-4 text-green-400" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const infoItems = [
    { icon: <IdCardIcon className="w-5 h-5 text-textIcons " />, label: "아이디", value: userInfo.userId },
    { icon: <MailIcon className="w-5 h-5 text-textIcons " />, label: "이메일", value: userInfo.emailId || 'example@email.com', canCopy: true, fieldName: "email" },
    { icon: <CakeIcon className="w-5 h-5 text-textIcons " />, label: "생년월일", value: userInfo.birthDate },
    { icon: <CalendarIcon className="w-5 h-5 text-textIcons " />, label: "가입일", value: new Date(userInfo.createdAt).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' }) },
    { icon: <WalletIcon className="w-5 h-5 text-textIcons " />, label: "지갑 주소", value: userInfo.walletAddress, canCopy: true, fieldName: "wallet" },
    { icon: <FingerprintIcon className="w-5 h-5 text-textIcons " />, label: "DID", value: userInfo.didAddress, canCopy: true, fieldName: "did" },
  ];

  const gradeInfo = {
    2: { text: "슈퍼 관리자", className: "bg-gray-800 text-darkergray " },
    default: { text: "일반 관리자", className: "bg-cyan-700  text-darkergray " },
  };
  const currentGrade = gradeInfo[userInfo.grade] || gradeInfo.default;

  return (
    <div className="ml-64 min-h-screen blue text-textIcons p-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between  items-center mb-10">
          <h1 className="text-3xl font-bold text-whiteback">내 정보 확인 및 수정</h1>
        </div>
        <div className="flex justify-end gap-4 mb-6">

          <button onClick={() => setIsWithdrawModalOpen(true)} className="flex items-center justify-end gap-2 px-4 py-2 text-sm font-medium text-textIcons bg-darkergray hover:bg-red-900 hover:text-whiteback cursor-pointer rounded-lg transition-colors shadow-lg backdrop-blur-sm border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M640-520v-80h240v80H640Zm-280 40q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z" /></svg>
            <span>회원 탈퇴</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-end gap-2 px-4 py-2 text-sm font-medium text-textIcons bg-darkergray hover:bg-gray-500 hover:text-whiteback cursor-pointer rounded-lg transition-colors shadow-lg backdrop-blur-sm border border-gray-700">
            <PencilIcon className="w-4 h-4" />
            <span>프로필 수정</span>
          </button>
        </div>

        <div className="bg-darkergray relative text-textIcons  backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50">
          {/* Profile Header */}
          <div className="p-8 bg-black/15 border-b border-gray-800/50 flex  justify-around">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={userInfo.imgPath || '/images/default-avatar.png'}
                  className="w-45 h-45 rounded-full object-cover border-4 border-gray-800 shadow-lg"
                  alt="Admin profile"
                />
                <div className="absolute bottom-2 right-2 block h-6 w-6 rounded-full bg-green-500 border-2 border-gray-900 ring-2 ring-green-400/50 animate-pulse"></div>
              </div>
              <h2 className="text-4xl font-bold text-textIcons">{userInfo.userName}</h2>
              <p className="text-2xl font-medium ">@ {userInfo.nickName}</p>
            </div>
            <div className="flex h-58 flex-col items-center justify-between">
              <div className={`mt-6 px-6 py-2 w-35 text-center font-semibold rounded-lg  ${currentGrade.className}`}>
                {currentGrade.text}
              </div>
              <div className="text-deepnavy">
                <div className="font-medium text-lg text-center">기관</div>
                <div className="text-3xl font-semibold ">
                  경일게임IT 아카데미
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {infoItems.map((item, index) => (
                <div key={item.label} className="animate-fade-in border rounded-lg border-gray-400 shadow-xm " style={{ animationDelay: `${200 + index * 70}ms` }}>
                  <InfoItem {...item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userInfo={userInfo}
        onProfileUpdate={handleProfileUpdate}
      />
      <WithdrawConfirmModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        userInfo={userInfo}
      />
    </div>
  );
}
