import { atsGaugeColor } from "../../utils/helpers";

interface ATSGaugeProps {
  score: number;
}

/** Circular score gauge matching the design file's conic-gradient ring. */
export function ATSGauge({ score }: ATSGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = atsGaugeColor(clamped);

  return (
    <div
      className="relative w-[168px] h-[168px] rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(${color} 0% ${clamped}%, #E2E8F0 ${clamped}% 100%)`,
      }}
    >
      <div className="w-[130px] h-[130px] rounded-full bg-white flex flex-col items-center justify-center">
        <div className="text-[34px] font-extrabold text-text-dark leading-none">{clamped}</div>
        <div className="text-[11.5px] text-[#94A3B8] mt-[2px]">/ 100</div>
      </div>
    </div>
  );
}
