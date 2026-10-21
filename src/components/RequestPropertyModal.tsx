import { useState } from "react";
import { X, CheckCircle2, Send, Home } from "lucide-react";
import { submitPropertyRequest, PropertyRequestPayload } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface RequestPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUEST_TYPES = ["Rent", "Buy", "Roommate", "Property service"];
const PROPERTY_TYPES = ["Room", "Apartment", "House", "Office", "Land", "Other"];
const FURNISHED_OPTIONS = ["Yes", "No", "Either"];
const CONTACT_PREFERENCES = ["Call", "WhatsApp", "SMS", "Email"];
const BEST_TIME_OPTIONS = [
  "Anytime",
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 5 PM)",
  "Evening (5 PM - 9 PM)",
];

export default function RequestPropertyModal({ isOpen, onClose }: RequestPropertyModalProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    requestType: "Rent",
    propertyType: "House",
    preferredLocation: "",
    bedrooms: "",
    budgetRange: "",
    moveInDate: "",
    furnished: "Either",
    description: "",
    specialRequirements: "",
    contactPreference: "WhatsApp",
    bestTimeToContact: "Anytime",
    agreedToTerms: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!formData.preferredLocation.trim()) {
      setError("Please specify your preferred location.");
      return;
    }
    if (!formData.budgetRange.trim()) {
      setError("Please specify your budget range.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please describe what you are looking for.");
      return;
    }
    if (!formData.agreedToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: PropertyRequestPayload = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        request_type: formData.requestType,
        property_type: formData.propertyType,
        preferred_location: formData.preferredLocation.trim(),
        bedrooms: formData.bedrooms.trim() || undefined,
        budget_range: formData.budgetRange.trim(),
        move_in_date: formData.moveInDate.trim() || undefined,
        furnished: formData.furnished,
        description: formData.description.trim(),
        special_requirements: formData.specialRequirements.trim() || undefined,
        contact_preference: formData.contactPreference,
        best_time_to_contact: formData.bestTimeToContact,
        user_id: user?.id,
      };

      await submitPropertyRequest(payload);
      setSuccess(true);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Modal Dialog without border radius (rounded-none as explicitly instructed) */}
      <div 
        className="bg-white rounded-none border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#0F5B5C] text-white flex items-center justify-center shadow-xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Property Request Form
              </h2>
              <p className="text-xs text-gray-500">
                Tell us what you're looking for and we'll match you with the best properties
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-none transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-left">
          {success ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Request Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Thank you, <strong>{formData.fullName}</strong>. We have received your property request and forwarded it to our advisory team at Aira Properties. We will reach out to you via {formData.contactPreference} shortly.
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-[#0F5B5C] text-white text-xs font-bold rounded-none hover:bg-[#0c4a4b] transition shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-none">
                  {error}
                </div>
              )}

              {/* 1. Contact details */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F5B5C] border-b border-gray-200 pb-1.5 mb-3">
                  Contact details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email address <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. What are you looking for? */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F5B5C] border-b border-gray-200 pb-1.5 mb-3">
                  What are you looking for?
                </h3>
                <div className="space-y-3.5">
                  {/* Request type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Request type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {REQUEST_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, requestType: type })}
                          className={`py-2 px-3 text-xs font-semibold border rounded-none transition cursor-pointer text-center ${
                            formData.requestType === type
                              ? "bg-[#0F5B5C] text-white border-[#0F5B5C]"
                              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Property type
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PROPERTY_TYPES.map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setFormData({ ...formData, propertyType: pt })}
                          className={`py-2 px-2 text-xs font-semibold border rounded-none transition cursor-pointer text-center ${
                            formData.propertyType === pt
                              ? "bg-[#0F5B5C] text-white border-[#0F5B5C]"
                              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Preferred location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wayanad, Kochi, Calicut..."
                        value={formData.preferredLocation}
                        onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Number of bedrooms or rooms
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 BHK, 3 Bedrooms, or Single Room"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Budget range <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹15,000 - ₹25,000 / mo or ₹65 Lakhs"
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Move-in or service date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Immediate, Within 1 month, or DD/MM/YYYY"
                        value={formData.moveInDate}
                        onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                      />
                    </div>
                  </div>

                  {/* Furnished */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Furnished
                    </label>
                    <div className="flex items-center gap-3">
                      {FURNISHED_OPTIONS.map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="furnished"
                            value={opt}
                            checked={formData.furnished === opt}
                            onChange={() => setFormData({ ...formData, furnished: opt })}
                            className="text-[#0F5B5C] focus:ring-0"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Tell us more */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F5B5C] border-b border-gray-200 pb-1.5 mb-3">
                  Tell us more
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Describe what you need <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Give details about your requirements, size, amenities, family/bachelor status..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Any special requirements?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Car parking, Pet friendly, Near metro/hospital, Gated community"
                      value={formData.specialRequirements}
                      onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none focus:outline-none focus:border-[#0F5B5C]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Contact preference */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F5B5C] border-b border-gray-200 pb-1.5 mb-3">
                  Contact preference
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Preferred contact channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CONTACT_PREFERENCES.map((pref) => (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => setFormData({ ...formData, contactPreference: pref })}
                          className={`py-1.5 px-2 text-xs font-semibold border rounded-none transition cursor-pointer text-center ${
                            formData.contactPreference === pref
                              ? "bg-[#0F5B5C] text-white border-[#0F5B5C]"
                              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Best time to contact you
                    </label>
                    <select
                      value={formData.bestTimeToContact}
                      onChange={(e) => setFormData({ ...formData, bestTimeToContact: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-none bg-white focus:outline-none focus:border-[#0F5B5C]"
                    >
                      {BEST_TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-0.5 rounded-none text-[#0F5B5C] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 select-none">
                    I agree to the <a href="/terms" target="_blank" className="text-[#0F5B5C] underline font-medium">Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-[#0F5B5C] underline font-medium">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-none hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0F5B5C] hover:bg-[#0c4a4b] text-white text-xs font-bold rounded-none transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
