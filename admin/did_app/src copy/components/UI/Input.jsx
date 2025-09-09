import React from "react";

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "font-nanumgothic w-full rounded-xl border border-gray-400  px-3 py-1 text-sm  text-lg   outline-none  disabled:pointer-events-none";

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

export default Input;
