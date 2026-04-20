import React from "react";

const WidgetLoader = () => {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center gap-6 sm:h-[420px]">
      {" "}
      <div className="jelly-triangle">
        <div className="jelly-triangle__dot"></div>
        <div className="jelly-triangle__traveler"></div>
      </div>
      <svg width="0" height="0" className="jelly-maker">
        <defs>
          <filter id="uib-jelly-triangle-ooze">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="7.3"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="ooze"
            />
            <feBlend in="SourceGraphic" in2="ooze" />
          </filter>
        </defs>
      </svg>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-semibold tracking-wide text-slate-700">
          Loading reviews
        </p>
        <p className="text-xs text-slate-400">
          Fetching the latest testimonials…
        </p>
      </div>
    </div>
  );
};

export default WidgetLoader;
