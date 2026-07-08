import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", ...rest },
  ref
) {
  const field = (
    <input
      ref={ref}
      className={`border rounded-[7px] px-[11px] py-[9px] text-[13.5px] font-sans outline-none text-text-dark w-full focus:border-primary ${
        error ? "border-[#DC2626]" : "border-border"
      } ${className}`}
      {...rest}
    />
  );

  if (!label) return field;

  return (
    <label className="flex flex-col gap-[5px] text-xs text-text-gray font-semibold">
      {label}
      {field}
      {error && <span className="text-[11.5px] text-[#DC2626] font-medium">{error}</span>}
    </label>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = "", ...rest },
  ref
) {
  const field = (
    <textarea
      ref={ref}
      className={`border rounded-[7px] px-[11px] py-[9px] text-[13.5px] font-sans outline-none text-text-dark w-full resize-none focus:border-primary ${
        error ? "border-[#DC2626]" : "border-border"
      } ${className}`}
      {...rest}
    />
  );

  if (!label) return field;

  return (
    <label className="flex flex-col gap-[5px] text-xs text-text-gray font-semibold">
      {label}
      {field}
      {error && <span className="text-[11.5px] text-[#DC2626] font-medium">{error}</span>}
    </label>
  );
});
