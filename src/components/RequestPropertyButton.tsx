import { useState, useEffect } from "react";
import { X } from "lucide-react";
import RequestPropertyModal from "./RequestPropertyModal";

export default function RequestPropertyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-request-property-modal", handleOpen);
    return () => window.removeEventListener("open-request-property-modal", handleOpen);
  }, []);

  return (
    <>
      {isClosed ? (
        /* Collapsed state: compact green button with '?' fixed on the right */
        <aside aria-label="Request a Property Quick Action">
          <button
            type="button"
            onClick={() => setIsClosed(false)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#52B774] hover:bg-[#42a763] text-black border-2 border-r-0 border-[#15803d] rounded-l-2xl rounded-r-none shadow-lg hover:shadow-2xl cursor-pointer w-10 sm:w-11 h-12 flex items-center justify-center transition-all duration-200 select-none hover:-translate-x-0.5 active:scale-95 group focus:outline-none animate-fade-in"
            title="Show Request a Property"
            aria-label="Show Request a Property"
          >
            <span className="text-xl sm:text-2xl font-black leading-none font-display text-black">
              ?
            </span>
          </button>
        </aside>
      ) : (
        /* Expanded state: full aside tab with red close button */
        <aside aria-label="Request a Property Quick Action" className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
          <div className="relative">
            {/* Red color close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsClosed(true);
              }}
              className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer transition-transform hover:scale-110 z-50 border-2 border-white focus:outline-none"
              title="Close tab"
              aria-label="Close Request a Property tab"
            >
              <X size={13} strokeWidth={3} />
            </button>

            {/* Main tab button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="bg-[#52B774] hover:bg-[#42a763] text-black border-2 border-r-0 border-[#15803d] rounded-l-2xl rounded-r-none shadow-lg hover:shadow-2xl cursor-pointer py-4 px-1.5 sm:px-2 flex flex-col items-center justify-center transition-all duration-200 select-none hover:-translate-x-0.5 active:scale-95 group focus:outline-none"
              title="Request a Property"
            >
              <div className="flex flex-col items-center gap-1">
                {/* Top Question Mark */}
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
          </div>
        </aside>
      )}

      {/* Modal Popup (rounded-none) */}
      <RequestPropertyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
