import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
  ChevronLeft,
  CheckCircle2,
  User,
  Phone,
  Home,
  Building2,
  MoreHorizontal,
  CreditCard,
} from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import api_base from "../apibase";

export default function Checkout() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "Home",
  });

  // =========================
  // FETCH ADDRESSES
  // =========================

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `${api_base}addresses/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Unable to fetch addresses");
      }

      setAddresses(data.addresses || []);

      if (data.addresses?.length > 0) {
        setSelectedAddress(data.addresses[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // PINCODE LOOKUP
  // =========================

  const lookupPincode = async (pincode) => {
    const value = pincode.replace(/\\D/g, "").slice(0, 6);

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    setPincodeError("");

    if (value.length !== 6) {
      setPincodeLoading(false);
      return;
    }

    setPincodeLoading(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data?.[0] ||
        data[0].Status !== "Success" ||
        !data[0].PostOffice?.length
      ) {
        setPincodeError("Invalid Pincode");
        return;
      }

      const postOffice = data[0].PostOffice[0];

      setFormData((prev) => ({
        ...prev,
        pincode: value,
        area: postOffice.Name || prev.area,
        city:
          postOffice.District ||
          postOffice.Block ||
          prev.city,
        state: postOffice.State || prev.state,
      }));
    } catch (error) {
      console.error("Pincode lookup failed:", error);
      setPincodeError("Unable to fetch pincode details");
    } finally {
      setPincodeLoading(false);
    }
  };

  // =========================
  // ADD / UPDATE ADDRESS
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${api_base}addresses/${editingId}/`
        : `${api_base}addresses/`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.msg || "Unable to save address",
        });

        return;
      }

      Swal.fire({
        icon: "success",
        title: editingId ? "Address Updated" : "Address Saved",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        full_name: "",
        mobile: "",
        house: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "Home",
      });

      setEditingId(null);
      setShowForm(false);

      fetchAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // EDIT
  // =========================

  const editAddress = (address) => {
    setPincodeError("");
    setPincodeLoading(false);

    setFormData({
      full_name: address.full_name,
      mobile: address.mobile,
      house: address.house,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type,
    });

    setEditingId(address.id);
    setShowForm(true);
  };

  // =========================
  // DELETE
  // =========================

  const deleteAddress = async (id) => {
    const result = await Swal.fire({
      title: "Delete address?",
      text: "This address will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${api_base}addresses/${id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Unable to delete address");
      }

      fetchAddresses();

      setSelectedAddress(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const openAddForm = () => {
    setEditingId(null);
    setPincodeError("");
    setPincodeLoading(false);

    setFormData({
      full_name: "",
      mobile: "",
      house: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      address_type: "Home",
    });

    setShowForm(true);
  };

  // =========================
  // ADDRESS TYPE
  // =========================

  const addressTypeStyles = {
    Home: "bg-[#F5A524]/[0.10] text-[#F5A524] border-[#F5A524]/20",
    Office: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Other: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  const getAddressIcon = (type) => {
    if (type === "Home") return Home;
    if (type === "Office") return Building2;
    return MoreHorizontal;
  };

  // =========================
  // SELECTED ADDRESS
  // =========================

  const selectedAddressData = addresses.find(
    (address) => address.id === selectedAddress
  );

  return (
    <div className="min-h-screen bg-[#060B18] text-gray-100"> 
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-24 h-[520px] w-[520px] rounded-full bg-[#0B73FF]/[0.06] blur-[140px]" />
        <div className="absolute -left-32 top-[38%] h-[420px] w-[420px] rounded-full bg-[#F5A524]/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
      </div>
      <div className="h-[74px] w-full shrink-0" aria-hidden="true" />
      <div className="fixed left-0 top-0 z-[100] w-full border-b border-white/10 bg-gradient-to-r from-[#080D18]/98 via-[#0B1424]/96 to-[#0A1220]/98 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <Navbar />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative overflow-hidden border-b border-white/10 bg-[#0A1220]/90 backdrop-blur-xl">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-32 -top-40 h-[450px] w-[450px] rounded-full bg-amber-400/10 blur-[130px]" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-[#111827]/[0.025] blur-[110px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
          {/* Back */}
          <button
            onClick={() => navigate("/cart")}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-100"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0D1628]/90 transition-all group-hover:border-white/30">
              <ChevronLeft size={14} />
            </span>

            Back to cart
          </button>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F5A524]/[0.10]0" />

                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F5A524]">
                  Checkout
                </p>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Delivery Address
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400">
                Select your preferred delivery address or add a new one to
                continue with your order.
              </p>
            </div>

            {/* Secure checkout badge */}
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-[#0A1220] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1628]/90 shadow-sm">
                <ShieldCheck
                  size={17}
                  className="text-emerald-500"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Checkout
                </p>

                <p className="text-xs font-semibold text-gray-200">
                  Secure & Protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* =====================================================
              LEFT
          ===================================================== */}

          <div className="lg:col-span-8">
            {/* Section heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Saved Addresses
                </h2>

                <p className="mt-1.5 text-sm text-gray-400">
                  Choose where you want your order delivered.
                </p>
              </div>

              <button
                onClick={openAddForm}
                className="group inline-flex w-fit items-center gap-2 rounded-2xl bg-[#080D18] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F5A524]/[0.10]0 hover:text-white hover:shadow-amber-500/25"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-[#080D18]/10">
                  <Plus size={14} />
                </span>

                Add Address
              </button>
            </div>

            {/* =====================================================
                ADDRESS LIST
            ===================================================== */}

            <div className="mt-6 space-y-4">
              {addresses.length === 0 && (
                <div className="relative overflow-hidden rounded-[1.8rem] border border-dashed border-white/15 bg-[#0D1628]/90 p-10 text-center sm:p-14">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/[0.07] blur-[100px]" />

                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[#F5A524]/[0.10]">
                    <MapPin
                      size={30}
                      strokeWidth={1.7}
                      className="text-[#F5A524]"
                    />
                  </div>

                  <h3 className="relative mt-5 text-xl font-bold text-gray-100">
                    No saved address
                  </h3>

                  <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
                    Add your delivery address so we know where to send your
                    order.
                  </p>

                  <button
                    onClick={openAddForm}
                    className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-[#080D18] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#F5A524]/[0.10]0 hover:text-white"
                  >
                    <Plus size={15} />
                    Add your first address
                  </button>
                </div>
              )}

              {addresses.map((address) => {
                const AddressIcon = getAddressIcon(
                  address.address_type
                );

                return (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`group relative cursor-pointer overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0D1628]/90 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-18px_rgba(0,0,0,0.18)] sm:p-5 ${
                      selectedAddress === address.id
                        ? "border-amber-400 ring-2 ring-amber-400/15"
                        : "border-white/10 hover:border-white/15"
                    }`}
                  >
                    {/* Selected left accent */}
                    {selectedAddress === address.id && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-[#F5A524]/[0.10]0" />
                    )}

                    <div className="flex gap-4 sm:gap-5">
                      {/* Icon */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${
                          selectedAddress === address.id
                            ? "bg-amber-100 text-[#F5A524]"
                            : "bg-[#0A1220] text-gray-400"
                        }`}
                      >
                        <AddressIcon size={20} />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-white sm:text-lg">
                                {address.full_name}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                                  addressTypeStyles[
                                    address.address_type
                                  ] ||
                                  "border-white/10 bg-[#0A1220] text-gray-400"
                                }`}
                              >
                                {address.address_type}
                              </span>

                              {selectedAddress === address.id && (
                                <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 sm:inline-flex">
                                  <CheckCircle2 size={10} />
                                  Selected
                                </span>
                              )}
                            </div>

                            <div className="mt-3 space-y-0.5">
                              <p className="text-sm leading-6 text-gray-400">
                                {address.house}, {address.area}
                              </p>

                              <p className="text-sm leading-6 text-gray-400">
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>

                              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                                <Phone
                                  size={12}
                                  className="text-gray-500"
                                />
                                +91 {address.mobile}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editAddress(address);
                              }}
                              aria-label="Edit address"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0A1220] text-gray-400 transition-all hover:border-[#F5A524]/25 hover:bg-[#F5A524]/[0.10] hover:text-[#F5A524]"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(address.id);
                              }}
                              aria-label="Delete address"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0A1220] text-gray-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Selection circle */}
                      <div
                        className={`absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                          selectedAddress === address.id
                            ? "border-amber-500 bg-[#F5A524]/[0.10]0"
                            : "border-white/15 bg-[#0D1628]/90 group-hover:border-stone-400"
                        }`}
                      >
                        {selectedAddress === address.id && (
                          <CheckCircle2
                            size={13}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =====================================================
                ADDRESS FORM
            ===================================================== */}

            {showForm && (
              <div className="mt-7 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0D1628]/90 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                {/* Form top accent */}
                <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-400" />

                <div className="p-5 sm:p-7">
                  {/* Form header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5A524]/[0.10] text-[#F5A524]">
                        {editingId ? (
                          <Pencil size={17} />
                        ) : (
                          <Plus size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                          Delivery Details
                        </p>

                        <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
                          {editingId
                            ? "Edit Address"
                            : "Add New Address"}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowForm(false)}
                      className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-[#0A1220] hover:text-gray-100"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 grid gap-4 sm:grid-cols-2"
                  >
                    {/* Full name */}
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#0A1220] pl-11 pr-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                      />
                    </div>

                    {/* Mobile */}
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        name="mobile"
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#0A1220] pl-11 pr-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                      />
                    </div>

                    {/* House */}
                    <input
                      name="house"
                      placeholder="House / Flat / Building"
                      value={formData.house}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border border-white/10 bg-[#0A1220] px-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                    />

                    {/* Area */}
                    <input
                      name="area"
                      placeholder="Area / Street"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border border-white/10 bg-[#0A1220] px-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                    />

                    {/* City */}
                    <input
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border border-white/10 bg-[#0A1220] px-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                    />

                    {/* State */}
                    <input
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border border-white/10 bg-[#0A1220] px-4 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                    />

                    {/* Pincode */}
                    <div className="relative">
                      <input
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => lookupPincode(e.target.value)}
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#0A1220] px-4 pr-11 text-sm font-medium text-gray-100 outline-none transition-all placeholder:text-gray-500 focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                      />

                      {pincodeLoading && (
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-amber-500" />
                        </div>
                      )}

                      {!pincodeLoading && formData.pincode.length === 6 && !pincodeError && (
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <CheckCircle2 size={16} />
                        </div>
                      )}

                      {pincodeError && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {pincodeError}
                        </p>
                      )}
                    </div>

                    {/* Address Type */}
                    <select
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleChange}
                      className="h-12 rounded-xl border border-white/10 bg-[#0A1220] px-4 text-sm font-medium text-gray-100 outline-none transition-all focus:border-amber-400 focus:bg-[#111C31] focus:ring-4 focus:ring-amber-400/10"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#080D18] font-bold text-white shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F5A524]/[0.10]0 hover:text-white hover:shadow-amber-500/25 sm:col-span-2"
                    >
                      {editingId ? (
                        <Pencil size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}

                      {editingId
                        ? "Update Address"
                        : "Save Address"}

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
              RIGHT - DELIVERY SUMMARY
          ===================================================== */}

          <div className="lg:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-[1.8rem] bg-[#080D18] text-white shadow-[0_25px_70px_-25px_rgba(0,0,0,0.4)]">
              {/* Accent */}
              <div className="h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500" />

              {/* Background glow */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F5A524]/[0.10]0/[0.12] blur-[90px]" />

              <div className="relative p-5 sm:p-7">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5A524]/[0.10]0 text-white shadow-lg shadow-amber-500/20">
                      <MapPin size={19} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        Order
                      </p>

                      <h2 className="mt-0.5 text-lg font-bold">
                        Delivery Details
                      </h2>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
                    <CreditCard
                      size={15}
                      className="text-gray-500"
                    />
                  </div>
                </div>

                {/* Selected Address */}
                <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                  {selectedAddressData ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                          <CheckCircle2
                            size={12}
                            className="text-amber-400"
                          />
                          Delivering To
                        </p>

                        <span className="rounded-full bg-[#F5A524]/[0.10]0/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                          {selectedAddressData.address_type}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold">
                        {selectedAddressData.full_name}
                      </h3>

                      <div className="mt-2 space-y-0.5">
                        <p className="text-sm leading-6 text-gray-500">
                          {selectedAddressData.house},{" "}
                          {selectedAddressData.area}
                        </p>

                        <p className="text-sm leading-6 text-gray-500">
                          {selectedAddressData.city},{" "}
                          {selectedAddressData.state} -{" "}
                          {selectedAddressData.pincode}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-3">
                        <Phone
                          size={12}
                          className="text-gray-400"
                        />

                        <span className="text-xs font-medium text-gray-500">
                          +91 {selectedAddressData.mobile}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
                        <MapPin
                          size={20}
                          className="text-gray-400"
                        />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        No address selected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Select a saved address to continue.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  disabled={!selectedAddress}
                  onClick={() =>
                    navigate("/payment", {
                      state: {
                        addressId: selectedAddress,
                      },
                    })
                  }
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5A524]/[0.10]0 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[#F5A524]/[0.10]0"
                >
                  <Lock size={14} />

                  Continue

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#080D18]/10">
                    <ArrowRight size={14} />
                  </span>
                </button>

                {/* Secure note */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck
                    size={12}
                    className="text-emerald-400"
                  />

                  <span className="text-[10px] font-medium text-gray-400">
                    Secure & encrypted checkout
                  </span>
                </div>

                {/* Benefits */}
                <div className="mt-7 border-t border-white/[0.08] pt-6">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Shopping with confidence
                  </p>

                  <div className="space-y-4">
                    {/* Secure */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A524]/[0.10]0/10">
                        <ShieldCheck
                          size={15}
                          className="text-amber-400"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-stone-200">
                          Secure checkout
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Your information stays protected
                        </p>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/100/10">
                        <Truck
                          size={15}
                          className="text-emerald-400"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-stone-200">
                          Fast delivery
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Reliable doorstep delivery
                        </p>
                      </div>
                    </div>

                    {/* Premium */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/100/10">
                        <Sparkles
                          size={15}
                          className="text-purple-400"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-stone-200">
                          Premium experience
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Quality products, carefully selected
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom reassurance */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Lock size={11} className="text-gray-500" />

              <p className="text-[10px] text-gray-500">
                Your checkout information is safe and protected
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}