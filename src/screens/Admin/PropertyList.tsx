import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Tag,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share2,
  Building2,
  BedDouble,
  Bath,
  Maximize2,
  Check,
  Copy,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Image as ImageIcon,
  Sparkles,
  Send,
  Youtube,
  UploadCloud
} from "lucide-react";
import { adminApi, AdminProperty } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";

const statusOptions = [
  { label: "All Statuses", value: "All" },
  { label: "For Sale", value: "For Sale" },
  { label: "For Rent", value: "For Rent" },
  { label: "Pending", value: "Pending" },
  { label: "Active", value: "Active" },
  { label: "Sold", value: "Sold" },
  { label: "Rejected", value: "Rejected" },
];

const propertyTypes = [
  "House",
  "Villa",
  "Apartment",
  "Independent House / Villa",
  "Plot / Land",
  "Land",
  "Commercial Space",
  "Builder Floor",
  "Farmhouse"
];

// Helper to convert an image URL into a Blob (handles CORS or canvas fallback)
async function getImageBlob(imageUrl: string): Promise<Blob | null> {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl, { mode: "cors" });
    if (res.ok) {
      return await res.blob();
    }
  } catch (err) {
    // fallback to canvas
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/png");
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

// Copy image to system clipboard so user can press Ctrl+V in WhatsApp Web
async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    const blob = await getImageBlob(imageUrl);
    if (!blob) return false;

    let pngBlob = blob;
    if (blob.type !== "image/png") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = URL.createObjectURL(blob);
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const converted = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/png")
        );
        if (converted) pngBlob = converted;
      }
    }

    if (navigator.clipboard && typeof (window as any).ClipboardItem !== "undefined") {
      const item = new (window as any).ClipboardItem({ "image/png": pngBlob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard image write not permitted:", err);
  }
  return false;
}

export default function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Action Menu & Sharing State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [shareProperty, setShareProperty] = useState<AdminProperty | null>(null);
  const [deletePropertyItem, setDeletePropertyItem] = useState<AdminProperty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedState, setCopiedState] = useState<"text" | "link" | "image" | "download" | null>(null);
  const [sharingWithImage, setSharingWithImage] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  // Edit Property Modal State (Admin editing images, youtube_url, status & details)
  const [editPropertyItem, setEditPropertyItem] = useState<AdminProperty | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPropertyType, setEditPropertyType] = useState("House");
  const [editPurpose, setEditPurpose] = useState("For Sale");
  const [editAreaSqft, setEditAreaSqft] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editStatus, setEditStatus] = useState("Active");
  const [existingMedia, setExistingMedia] = useState<{ id: number; url: string; media_type?: string }[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isLoadingEditDetails, setIsLoadingEditDetails] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getProperties(searchTerm, selectedStatus);
      setProperties(data);
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside() {
      setIsStatusDropdownOpen(false);
      setActiveMenuId(null);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Format price in Indian Rupee format
  const formatPrice = (priceVal: number | string) => {
    const num = Number(priceVal) || 0;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Format posted date
  const formatPostedDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Open Edit Modal for Admin
  async function openEditModal(p: AdminProperty) {
    setActiveMenuId(null);
    setEditPropertyItem(p);
    setEditTitle(p.title || "");
    setEditPrice(String(p.price || ""));
    setEditPropertyType(p.property_type || p.propertyType || "House");
    setEditPurpose(p.purpose || "For Sale");
    setEditAreaSqft(String(p.area_sqft || p.areaSqft || ""));
    setEditAddress(p.address || "");
    setEditDistrict(p.district || "");
    setEditDescription((p as any).description || "");
    setEditYoutubeUrl((p as any).youtube_url || (p as any).youtubeUrl || "");
    setEditStatus(p.status || "Active");
    setDeletedMediaIds([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);

    setIsLoadingEditDetails(true);
    try {
      const full = await adminApi.getProperty(p.id);
      if (full.media && Array.isArray(full.media)) {
        setExistingMedia(full.media);
      } else if (p.images) {
        setExistingMedia(p.images.map((url, i) => ({ id: i + 1, url })));
      }
      if (full.youtube_url) setEditYoutubeUrl(full.youtube_url);
      if (full.description) setEditDescription(full.description);
      if (full.area_sqft) setEditAreaSqft(String(full.area_sqft));
      if (full.status) setEditStatus(full.status);
    } catch {
      if (p.images) {
        setExistingMedia(p.images.map((url, i) => ({ id: i + 1, url })));
      }
    } finally {
      setIsLoadingEditDetails(false);
    }
  }

  // Handle media deletions in edit modal
  function handleDeleteExistingMedia(mediaId: number) {
    setDeletedMediaIds((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  }

  // Handle adding new image files in edit modal
  function handleAddNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  }

  // Remove newly added image file before saving
  function handleRemoveNewFile(idx: number) {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  // Save changes from Admin Edit Modal
  async function handleSavePropertyEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPropertyItem) return;
    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("price", editPrice);
      formData.append("property_type", editPropertyType);
      formData.append("purpose", editPurpose);
      formData.append("area_sqft", editAreaSqft);
      formData.append("address", editAddress);
      formData.append("district", editDistrict);
      formData.append("description", editDescription);
      formData.append("youtube_url", editYoutubeUrl);
      formData.append("status", editStatus);
      formData.append("deleted_media_ids", JSON.stringify(deletedMediaIds));

      for (const file of newImageFiles) {
        formData.append("media", file);
      }

      await adminApi.updateProperty(editPropertyItem.id, formData);
      await loadData();
      setEditPropertyItem(null);
      alert("Property listing updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update property.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  // Build social share details
  const getShareDetails = (p: AdminProperty) => {
    const siteUrl = window.location.origin;
    const propertyLink = `${siteUrl}/property/${p.id}`;
    const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
    const fullImageUrl = firstImage ? mediaUrl(firstImage) : "";
    const pType = p.property_type || p.propertyType || "Property";
    const pPrice = formatPrice(p.price);
    const pLocation = [p.address, p.district, p.state].filter(Boolean).join(", ");
    const uploader = p.uploader_name || "Owner";
    const userType = p.listing_role || p.user_role || "Owner";
    const specsList: string[] = [];
    if (p.bedrooms) specsList.push(`${p.bedrooms} Beds`);
    if (p.bathrooms) specsList.push(`${p.bathrooms} Baths`);
    if (p.area_sqft || p.areaSqft) specsList.push(`${p.area_sqft || p.areaSqft} sq.ft`);
    const specsText = specsList.length > 0 ? `\n📐 Specs: ${specsList.join(" • ")}` : "";
    const photoLine = fullImageUrl ? `\n📸 Photo: ${fullImageUrl}` : "";

    const messageText = `🏡 *${p.title}*\n` +
      `📍 Location: ${pLocation}\n` +
      `🏷️ Type: ${pType} (${p.purpose || "For Sale"})\n` +
      `💰 Price: ${pPrice}${specsText}\n` +
      `👤 Listed by: ${uploader} (${userType})${photoLine}\n\n` +
      `🔗 View Full Listing:\n${propertyLink}`;

    return {
      title: p.title,
      link: propertyLink,
      imageUrl: fullImageUrl,
      messageText,
      price: pPrice,
      location: pLocation,
      type: pType,
      purpose: p.purpose || "For Sale",
      uploader,
      userType,
    };
  };

  // 1-Click Share with Image (Files Web Share or Auto-Clipboard + WhatsApp)
  const handleShareWithImage = async (p: AdminProperty) => {
    setSharingWithImage(true);
    setShareNotice(null);
    try {
      const { title, messageText, link, imageUrl } = getShareDetails(p);

      if (imageUrl) {
        const blob = await getImageBlob(imageUrl);
        if (blob) {
          const file = new File(
            [blob],
            `property_${p.id}.png`,
            { type: "image/png" }
          );

          if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title,
              text: messageText,
              url: link,
            });
            return;
          }

          const copied = await copyImageToClipboard(imageUrl);
          if (copied) {
            setShareNotice("📸 Image copied to clipboard! Paste (Ctrl+V) in your WhatsApp chat.");
          }
        }
      }

      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, "_blank");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    } finally {
      setSharingWithImage(false);
    }
  };

  // WhatsApp share
  const handleShareWhatsApp = async (p: AdminProperty) => {
    const { messageText, imageUrl } = getShareDetails(p);
    if (imageUrl) {
      copyImageToClipboard(imageUrl).then((copied) => {
        if (copied) {
          setShareNotice("📸 Image copied to clipboard! Paste (Ctrl+V) directly into WhatsApp chat to send the photo.");
        }
      });
    }
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, "_blank");
  };

  // Facebook share
  const handleShareFacebook = (p: AdminProperty) => {
    const { link } = getShareDetails(p);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    window.open(fbUrl, "_blank", "width=600,height=500");
  };

  // Twitter/X share
  const handleShareTwitter = (p: AdminProperty) => {
    const { title, link, price, location } = getShareDetails(p);
    const tweet = `Check out this property: ${title} in ${location} for ${price}!`;
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(link)}`;
    window.open(twUrl, "_blank", "width=600,height=500");
  };

  // Pinterest share
  const handleSharePinterest = (p: AdminProperty) => {
    const { title, link, imageUrl } = getShareDetails(p);
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;
    window.open(pinUrl, "_blank", "width=750,height=600");
  };

  // Telegram share
  const handleShareTelegram = (p: AdminProperty) => {
    const { messageText, link } = getShareDetails(p);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(messageText)}`;
    window.open(tgUrl, "_blank");
  };

  // LinkedIn share
  const handleShareLinkedIn = (p: AdminProperty) => {
    const { link } = getShareDetails(p);
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
    window.open(liUrl, "_blank", "width=600,height=500");
  };

  // Copy Image to clipboard
  const handleCopyImage = async (p: AdminProperty) => {
    const { imageUrl } = getShareDetails(p);
    if (!imageUrl) return;
    const success = await copyImageToClipboard(imageUrl);
    if (success) {
      setCopiedState("image");
      setShareNotice("📸 Photo copied to clipboard! You can paste (Ctrl+V) it anywhere.");
      setTimeout(() => setCopiedState(null), 2500);
    } else {
      handleDownloadImage(p);
    }
  };

  // Download property image
  const handleDownloadImage = async (p: AdminProperty) => {
    const { imageUrl, title } = getShareDetails(p);
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setCopiedState("download");
      setTimeout(() => setCopiedState(null), 2500);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  // Copy full details to clipboard
  const handleCopyText = (p: AdminProperty) => {
    const { messageText } = getShareDetails(p);
    navigator.clipboard.writeText(messageText);
    setCopiedState("text");
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Copy link only
  const handleCopyLink = (p: AdminProperty) => {
    const { link } = getShareDetails(p);
    navigator.clipboard.writeText(link);
    setCopiedState("link");
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Delete property
  const handleDeleteConfirm = async () => {
    if (!deletePropertyItem) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteProperty(deletePropertyItem.id);
      setProperties((prev) => prev.filter((item) => item.id !== deletePropertyItem.id));
      setDeletePropertyItem(null);
    } catch (err: any) {
      alert("Failed to delete property. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick status update from 3-dots action menu
  const handleStatusChange = async (id: number, newStatus: string) => {
    setStatusUpdatingId(id);
    try {
      await adminApi.updatePropertyStatus(id, newStatus);
      setProperties((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
      );
      if (newStatus === "Rejected") {
        alert("Listing marked as Rejected. It is now hidden from all frontend users and moved into the uploader's pending queue for re-publishing.");
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setStatusUpdatingId(null);
      setActiveMenuId(null);
    }
  };

  // Pagination calculation
  const totalItems = properties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = properties.slice(startIndex, endIndex);

  return (
    <div className="w-full flex flex-col gap-5 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Property List
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <Link to="/admin" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="text-slate-800 font-semibold">Property List</span>
          </div>
        </div>

        <Link
          to="/add-property"
          className="inline-flex items-center justify-center gap-2 bg-[#5cb85c] hover:bg-[#4ea74e] text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-bold shadow-sm transition-all active:scale-[0.98] self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Properties</span>
        </Link>
      </div>

      {/* Control Bar: Search, Status Filter & View Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Right Tools: Status Dropdown & View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Status Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              <Tag size={14} className="text-slate-500" />
              <span>{selectedStatus === "All" ? "Status" : selectedStatus}</span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${
                  isStatusDropdownOpen ? "rotate-90" : "rotate-0"
                }`}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                      selectedStatus === opt.value
                        ? "text-emerald-600 bg-emerald-50/60 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedStatus === opt.value && <Check size={14} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggles (Grid / List) */}
          <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 p-1 rounded-full">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#5cb85c] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#5cb85c] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table / Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading properties catalog...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-xs font-bold">
          {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center text-center gap-2">
          <Building2 size={40} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 mt-2">No Properties Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchTerm || selectedStatus !== "All"
              ? "No property matches your search criteria or status filter. Try clearing filters."
              : "No property listings are currently present."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* TABLE VIEW matching User Screenshot */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  <th className="py-4 px-4 sm:px-6">PROPERTY</th>
                  <th className="py-4 px-4">Posted Date</th>
                  <th className="py-4 px-4">TYPE</th>
                  <th className="py-4 px-4">PRICE</th>
                  <th className="py-4 px-4">User Type</th>
                  <th className="py-4 px-4 sm:px-6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentItems.map((p) => {
                  const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
                  const locationDisplay = [p.address, p.district].filter(Boolean).join(", ") || p.district || "Kerala";
                  const pType = p.property_type || p.propertyType || "Property";
                  const userType = p.listing_role || p.user_role || "Owner";
                  const uploaderName = p.uploader_name || "Owner";
                  const initial = uploaderName ? uploaderName.charAt(0).toUpperCase() : "U";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* PROPERTY */}
                      <td className="py-3.5 px-4 sm:px-6 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/property/${p.id}`}
                            className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 block group relative"
                          >
                            {firstImage ? (
                              <img
                                src={mediaUrl(firstImage)}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Building2 size={22} />
                              </div>
                            )}
                          </Link>
                          <div className="min-w-0">
                            <Link
                              to={`/property/${p.id}`}
                              className="font-bold text-slate-900 text-xs sm:text-sm hover:text-emerald-600 transition-colors block truncate"
                            >
                              {p.title}
                            </Link>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
                              <MapPin size={12} className="shrink-0 text-slate-400" />
                              <span className="truncate">{locationDisplay}</span>
                            </div>
                            {/* Specs micro-badges */}
                            {(p.bedrooms || p.bathrooms || p.area_sqft || p.areaSqft) && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                                {p.bedrooms ? (
                                  <span className="flex items-center gap-0.5">
                                    <BedDouble size={11} /> {p.bedrooms}
                                  </span>
                                ) : null}
                                {p.bathrooms ? (
                                  <span className="flex items-center gap-0.5">
                                    <Bath size={11} /> {p.bathrooms}
                                  </span>
                                ) : null}
                                {p.area_sqft || p.areaSqft ? (
                                  <span className="flex items-center gap-0.5">
                                    <Maximize2 size={10} /> {p.area_sqft || p.areaSqft} sqft
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Posted Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{formatPostedDate(p.created_at)}</span>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-semibold text-slate-800">{pType}</span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.purpose === "For Rent"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-sky-50 text-sky-700 border-sky-200"
                            }`}
                          >
                            {p.purpose || "For Sale"}
                          </span>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {formatPrice(p.price)}
                        </span>
                      </td>

                      {/* User Type */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center gap-2.5">
                          {p.uploader_avatar ? (
                            <img
                              src={p.uploader_avatar}
                              alt={uploaderName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 block truncate text-xs">
                              {uploaderName}
                            </span>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                userType.toLowerCase() === "broker"
                                  ? "bg-purple-100 text-purple-700"
                                  : userType.toLowerCase() === "agency"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : userType.toLowerCase() === "builder"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {userType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ACTION with Social Media Share & 3-Dots Dropdown */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 relative">
                          {/* Dedicated Social Media Share Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareProperty(p);
                              setShareNotice(null);
                            }}
                            title="Share on WhatsApp & Social Media (includes Photo)"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-full font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow-2xs"
                          >
                            <Share2 size={13} className="text-emerald-600" />
                            <span>Share</span>
                          </button>

                          {/* 3-Dots Dropdown Button */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuId(activeMenuId === p.id ? null : p.id)
                              }
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-full transition-colors cursor-pointer"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu matching screenshot */}
                            {activeMenuId === p.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
                                <Link
                                  to={`/property/${p.id}`}
                                  onClick={() => setActiveMenuId(null)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye size={14} className="text-slate-500" />
                                  <span>View</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(p)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                >
                                  <Edit size={14} className="text-slate-500" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setShareProperty(p);
                                    setShareNotice(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  <Share2 size={14} className="text-emerald-600" />
                                  <span>Share Details</span>
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                {/* SET STATUS matching screenshot */}
                                <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  SET STATUS
                                </div>
                                {["Active", "Pending", "Sold", "Rejected"].map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(p.id, st)}
                                    className={`w-full flex items-center justify-between px-4 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                                      p.status === st
                                        ? "text-emerald-700 font-bold bg-emerald-50/50"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{st}</span>
                                    {p.status === st && <Check size={12} className="text-emerald-600" />}
                                  </button>
                                ))}

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeletePropertyItem(p);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={14} className="text-rose-500" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((p) => {
            const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
            const locationDisplay = [p.address, p.district].filter(Boolean).join(", ") || p.district || "Kerala";
            const pType = p.property_type || p.propertyType || "Property";
            const userType = p.listing_role || p.user_role || "Owner";
            const uploaderName = p.uploader_name || "Owner";
            const initial = uploaderName ? uploaderName.charAt(0).toUpperCase() : "U";

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                {/* Image & Status Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden group">
                  <Link to={`/property/${p.id}`} className="block w-full h-full">
                    {firstImage ? (
                      <img
                        src={mediaUrl(firstImage)}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Building2 size={36} />
                      </div>
                    )}
                  </Link>

                  {/* Badges on image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
                      {pType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        p.purpose === "For Rent"
                          ? "bg-amber-500 text-white"
                          : "bg-sky-600 text-white"
                      }`}
                    >
                      {p.purpose || "For Sale"}
                    </span>
                  </div>

                  <span
                    className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      p.status === "Active"
                        ? "bg-emerald-600 text-white"
                        : p.status === "Pending"
                        ? "bg-amber-500 text-white"
                        : p.status === "Sold"
                        ? "bg-blue-600 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-slate-900">
                      {formatPrice(p.price)}
                    </div>
                    <Link
                      to={`/property/${p.id}`}
                      className="font-bold text-xs sm:text-sm text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1 mt-0.5"
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">{locationDisplay}</span>
                    </div>

                    {/* Specs micro-badges */}
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100 font-medium">
                      {p.bedrooms ? (
                        <span className="flex items-center gap-1">
                          <BedDouble size={12} /> {p.bedrooms}
                        </span>
                      ) : null}
                      {p.bathrooms ? (
                        <span className="flex items-center gap-1">
                          <Bath size={12} /> {p.bathrooms}
                        </span>
                      ) : null}
                      {p.area_sqft || p.areaSqft ? (
                        <span className="flex items-center gap-1">
                          <Maximize2 size={11} /> {p.area_sqft || p.areaSqft} sqft
                        </span>
                      ) : null}
                      <span className="ml-auto text-[10px] text-slate-400">
                        {formatPostedDate(p.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Footer with Uploader & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {p.uploader_avatar ? (
                        <img
                          src={p.uploader_avatar}
                          alt={uploaderName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {initial}
                        </div>
                      )}
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {uploaderName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                        title="Edit Property (Images, YouTube URL, Status)"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShareProperty(p);
                          setShareNotice(null);
                        }}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full transition-colors cursor-pointer"
                        title="Share on WhatsApp & Social Media (includes Photo)"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePropertyItem(p)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-full transition-colors cursor-pointer"
                        title="Delete Property"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {properties.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{startIndex + 1}-{endIndex}</span> of{" "}
            <span className="font-bold text-slate-900">{totalItems.toLocaleString("en-IN")}</span> properties
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#5cb85c] text-white shadow-xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ADMIN EDIT PROPERTY MODAL (Edit Images, YouTube URL, Status & Info) */}
      {editPropertyItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setEditPropertyItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Edit size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    Edit Property Listing
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Edit uploaded images, YouTube video URL, details and listing status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditPropertyItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isLoadingEditDetails ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Loading full listing details...</span>
              </div>
            ) : (
              <form onSubmit={handleSavePropertyEdit} className="flex flex-col gap-4">
                {/* 1. SET STATUS PICKER */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Set Status
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Active", "Pending", "Sold", "Rejected"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          editStatus === st
                            ? st === "Active"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : st === "Rejected"
                              ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                              : st === "Pending"
                              ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                              : "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  {editStatus === "Rejected" && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-[11px] font-medium leading-relaxed mt-1">
                      ⚠️ <strong>Note:</strong> When set to <strong>Rejected</strong>, this property will be completely hidden from all frontend users. The uploader must click "Publish Again" from their dashboard before it can be reviewed and published live.
                    </div>
                  )}
                </div>

                {/* 2. PROPERTY IMAGES MANAGEMENT (View, Delete & Add) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-emerald-600" />
                      <span>Property Images ({existingMedia.length + newImageFiles.length})</span>
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-2xs">
                      <Plus size={13} />
                      <span>Add Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddNewFiles}
                      />
                    </label>
                  </div>

                  {/* Images Grid with Delete Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                    {existingMedia.map((media) => (
                      <div
                        key={media.id}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-200 shadow-2xs"
                      >
                        <img
                          src={mediaUrl(media.url)}
                          alt="Property item"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingMedia(media.id)}
                          title="Delete image"
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-90 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* New Uploads Preview */}
                    {newImagePreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-square border-2 border-dashed border-emerald-400 bg-emerald-50 shadow-2xs"
                      >
                        <img
                          src={previewUrl}
                          alt="New upload"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[8px] font-bold px-1 rounded">
                          NEW
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer shadow-xs"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    {existingMedia.length === 0 && newImageFiles.length === 0 && (
                      <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium">
                        No images attached to this listing. Click "Add Photos" above to upload photos.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. YOUTUBE VIDEO URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Youtube size={15} className="text-rose-600" />
                      <span>YouTube Video URL</span>
                    </span>
                    {editYoutubeUrl && (
                      <a
                        href={editYoutubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> Test Video
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={editYoutubeUrl}
                    onChange={(e) => setEditYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                {/* 4. TITLE & PRICE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Property Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 5. TYPE & PURPOSE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Property Type
                    </label>
                    <select
                      value={editPropertyType}
                      onChange={(e) => setEditPropertyType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      {propertyTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Purpose
                    </label>
                    <select
                      value={editPurpose}
                      onChange={(e) => setEditPurpose(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="For Sale">For Sale</option>
                      <option value="For Rent">For Rent</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Area (Sq.ft)
                    </label>
                    <input
                      type="number"
                      value={editAreaSqft}
                      onChange={(e) => setEditAreaSqft(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 6. LOCATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Address / Locality
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      District
                    </label>
                    <input
                      type="text"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 7. DESCRIPTION */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditPropertyItem(null)}
                    disabled={isSavingEdit}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingEdit ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SOCIAL MEDIA & WHATSAPP SHARE MODAL WITH IMAGE ATTACHMENT */}
      {shareProperty && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShareProperty(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    Share Property with Photo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Includes high-res property photo, specifications, price & direct listing link
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareProperty(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification alert / banner if present */}
            {shareNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="flex-1">{shareNotice}</span>
                <button
                  type="button"
                  onClick={() => setShareNotice(null)}
                  className="text-emerald-600 hover:text-emerald-900"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Property Card Snapshot with Photo & Direct Image Actions */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                {shareProperty.images && shareProperty.images[0] ? (
                  <img
                    src={mediaUrl(shareProperty.images[0])}
                    alt={shareProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Building2 size={28} />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5">
                  <ImageIcon size={9} /> Photo
                </span>
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-between w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    {shareProperty.purpose || "For Sale"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">
                    {shareProperty.property_type || shareProperty.propertyType || "Property"}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 truncate mt-1">
                  {shareProperty.title}
                </h4>

                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {formatPrice(shareProperty.price)}
                </div>

                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="shrink-0" />
                  <span>{[shareProperty.address, shareProperty.district].filter(Boolean).join(", ")}</span>
                </div>

                {/* Quick Image Tools */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => handleCopyImage(shareProperty)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedState === "image" ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">Photo Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="text-slate-500" />
                        <span>Copy Photo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadImage(shareProperty)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedState === "download" ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download size={12} className="text-slate-500" />
                        <span>Download Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURED: ALL-IN-ONE SHARE (WITH IMAGE) */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 rounded-2xl text-white shadow-md flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Sparkles size={15} className="text-amber-300" />
                  <span>Share Photo & Listing Together</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-white/90 leading-snug">
                Shares the property image file directly to WhatsApp, Telegram, or device apps with complete pre-filled details.
              </p>
              <button
                type="button"
                disabled={sharingWithImage}
                onClick={() => handleShareWithImage(shareProperty)}
                className="w-full mt-1 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                {sharingWithImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Preparing Image & Details...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} className="text-emerald-700" />
                    <span>Send Image & Details Now</span>
                  </>
                )}
              </button>
            </div>

            {/* 1-Click Social Media Channels */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Or Share To Specific Platform
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* WHATSAPP */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* FACEBOOK */}
                <button
                  type="button"
                  onClick={() => handleShareFacebook(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* TWITTER / X */}
                <button
                  type="button"
                  onClick={() => handleShareTwitter(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0f1419] hover:bg-black text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter)</span>
                </button>

                {/* PINTEREST */}
                <button
                  type="button"
                  onClick={() => handleSharePinterest(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#E60023] hover:bg-[#c9001f] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.48.02-3.55l1.04-4.42s-.26-.52-.26-1.3c0-1.22.7-2.13 1.58-2.13.75 0 1.11.56 1.11 1.23 0 .75-.48 1.88-.73 2.92-.21.87.43 1.58 1.28 1.58 1.54 0 2.72-1.62 2.72-3.96 0-2.07-1.49-3.52-3.61-3.52-2.46 0-3.9 1.85-3.9 3.75 0 .74.29 1.54.64 1.97.07.09.08.17.06.26l-.24 1c-.04.16-.14.2-.32.12-1.18-.55-1.92-2.28-1.92-3.67 0-2.98 2.17-5.72 6.25-5.72 3.28 0 5.83 2.34 5.83 5.46 0 3.26-2.05 5.88-4.9 5.88-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.82-.79 1.84-1.17 2.47A11.97 11.97 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                  </svg>
                  <span>Pinterest</span>
                </button>

                {/* TELEGRAM */}
                <button
                  type="button"
                  onClick={() => handleShareTelegram(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1d87b9] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span>Telegram</span>
                </button>

                {/* LINKEDIN */}
                <button
                  type="button"
                  onClick={() => handleShareLinkedIn(shareProperty)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Formatted Message Preview */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Details & Photo Preview
                </span>
                <span className="text-[10px] text-slate-400">
                  Ready to send
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {getShareDetails(shareProperty).messageText}
              </div>
            </div>

            {/* Action Buttons: Copy Text & Copy Link */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleCopyText(shareProperty)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-98 cursor-pointer"
              >
                {copiedState === "text" ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Details Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-500" />
                    <span>Copy Text Details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopyLink(shareProperty)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-98 cursor-pointer"
              >
                {copiedState === "link" ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} className="text-slate-500" />
                    <span>Copy Link Only</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletePropertyItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDeletePropertyItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Delete Property?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-800">"{deletePropertyItem.title}"</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletePropertyItem(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
