import { useState } from "react";
import RequestPropertyModal from "./RequestPropertyModal";

export default function RequestPropertyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sticky Tab on the Right Center (matching attached design) */}
      <aside aria-label="Request a Property Quick Action">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#52B774] hover:bg-[#42a763] text-black border-2 border-r-0 border-[#15803d] rounded-l-2xl rounded-r-none shadow-lg hover:shadow-2xl cursor-pointer py-4 px-1.5 sm:px-2 flex flex-col items-center justify-center transition-all duration-200 select-none hover:-translate-x-0.5 active:scale-95 group focus:outline-none"
          title="Request a Property"
        >
          <div className="flex flex-col items-center gap-1">
            {/* Top Question Mark with dot */}
            <span className="text-lg sm:text-xl font-extrabold leading-none mb-1 font-display text-black">
              ?
            </span>

            {/* Vertical text bottom-to-top */}
            <span
              className="font-bold text-xs sm:text-[13px] tracking-wide whitespace-nowrap text-black"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Request a Property
            </span>
          </div>
        </button>
      </aside>

      {/* Modal Popup (rounded-none) */}
      <RequestPropertyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
