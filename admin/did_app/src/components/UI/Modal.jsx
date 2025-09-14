"use client";

export default function Modal({ isOpen, message, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-black bg-white p-10 border-2 border-deepnavy rounded-3xl shadow-lg ">
        {message && <p className="mb-4 text-center">{message}</p>}
        {children ? (
          children
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-green-700 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
