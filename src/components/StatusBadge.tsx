import { PropertyStatus } from "@/lib/types";

const statusStyles: Record<PropertyStatus, string> = {
  Active: "bg-forest/10 text-forest",
  Pending: "bg-amber/15 text-amber",
  Draft: "bg-slate/15 text-slate",
  Inactive: "bg-coral/10 text-coral",
  Rejected: "bg-coral/10 text-coral",
  Sold: "bg-red-600 text-white font-bold",
};

export default function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status === "Sold" ? "Sold Out" : status}
    </span>
  );
}
