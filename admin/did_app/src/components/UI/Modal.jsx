"use client";

export default function Modal({ isOpen, message, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="text-black bg-white p-4 rounded-lg shadow-lg w-[250px] lg:w-[350px] min-h-40 flex flex-col justify-around  border border-gray-200">
        {message && <p className="mb-3 text-center">{message}</p>}
        {children ? (
          children
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-green-600 cursor-pointer hover:bg-green-500 text-white px-4 py-1 rounded "
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
