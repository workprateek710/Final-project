"use client";

import { useId, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export type PasswordInputProps = {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  /** Tailwind classes for the input element */
  inputClassName: string;
  variant?: "light" | "dark";
  /** Used in aria-labels for the reveal toggle, e.g. "CVV" → "Show CVV" */
  visibilityLabel?: string;
};

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  maxLength,
  inputMode,
  name,
  inputClassName,
  variant = "light",
  visibilityLabel = "password",
}: PasswordInputProps) {
  const genId = useId();
  const inputId = id ?? genId;
  const [visible, setVisible] = useState(false);
  const toggleBtn =
    variant === "dark"
      ? "text-slate-400 hover:text-white focus-visible:ring-accent/40"
      : "text-slate-400 hover:text-slate-600 focus-visible:ring-emerald-500/30";

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`${inputClassName} pr-11`}
      />
      <button
        type="button"
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg outline-none focus-visible:ring-2 ${toggleBtn}`}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? `Hide ${visibilityLabel}` : `Show ${visibilityLabel}`}
      >
        {visible ? <AiOutlineEyeInvisible size={20} aria-hidden /> : <AiOutlineEye size={20} aria-hidden />}
      </button>
    </div>
  );
}
