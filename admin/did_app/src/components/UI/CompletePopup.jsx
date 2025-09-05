"use client";

import Link from "next/link";

export default function CompletePopup({ isOpen, message, onClose, children }) {
  console.log("CompletePopup isOpen:", isOpen);
  if (!isOpen) return null;

  return (
    <div className="w-screen h-screen fixed top-0 left-0  backdrop-blur-sm ">
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="text-black bg-white p-4 rounded-lg shadow-lg w-[250px] md:w-[300px] lg:w-[400px] min-h-50 flex flex-col justify-around  border border-gray-200">
        {message && <p className="mb-3 text-center">{message}</p>}
        {children ? (
          children
        ) : (
          <div className="flex justify-center">
            <Link href="/">
            <button
              onClick={onClose}
              className="bg-green-600 cursor-pointer hover:bg-green-500 text-white px-4 py-1 rounded "
              >
              확인
            </button>
            </Link>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
