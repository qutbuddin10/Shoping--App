import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MoreVertical,
  Package,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ImageOff,
  Tag,
  X,
  Upload,
} from "lucide-react";

import axios from "axios";
import Swal from "sweetalert2";

import AdminLayout from "./AdminLayout";
import api_base from "../apibase";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">
            {label}
          </p>

          <h2 className="text-2xl sm:text-[28px] font-bold mt-2 text-white">
            {value}
          </h2>
        </div>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${accent}1A`,
            color: accent,
          }}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        status
          ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-300"
          : "bg-rose-500/15 border-rose-400/25 text-rose-300"
      }`}
    >
      {status ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {status ? "Active" : "Inactive"}
    </span>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const [showEditModal, setShowEditModal] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: "",
    description: "",
    image: null,
  });

  const [editImagePreview, setEditImagePreview] = useState("");

  // ==========================
  // GET CATEGORIES
  // ==========================

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${api_base}categories/`,
        {
          withCredentials: true,
        }
      );

      setCategories(response.data);
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        "Unable to load categories.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================
  // ADD INPUT CHANGE
  // ==========================

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files
        ? files[0]
        : value,
    }));
  };

  // ==========================
  // ADD CATEGORY
  // ==========================

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire(
        "Error",
        "Please enter a category name.",
        "error"
      );

      return;
    }

    try {
      const data = new FormData();

      data.append(
        "name",
        formData.name
      );

      data.append(
        "description",
        formData.description
      );

      if (formData.image) {
        data.append(
          "image",
          formData.image
        );
      }

      const response = await axios.post(
        `${api_base}categories/`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        Swal.fire({
          title: "Success",
          text: response.data.msg,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setShowModal(false);

        setFormData({
          name: "",
          description: "",
          image: null,
        });

        fetchCategories();
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg ||
          "Failed to add category.",
        "error"
      );
    }
  };

  // ==========================
  // OPEN EDIT MODAL
  // ==========================

  const openEditModal = (category) => {
    setEditFormData({
      id: category.id,
      name: category.name || "",
      description: category.description || "",
      image: null,
    });

    setEditImagePreview(
      category.image || ""
    );

    setShowEditModal(true);
  };

  // ==========================
  // CLOSE EDIT MODAL
  // ==========================

  const closeEditModal = () => {
    setShowEditModal(false);

    setEditFormData({
      id: null,
      name: "",
      description: "",
      image: null,
    });

    setEditImagePreview("");
  };

  // ==========================
  // EDIT INPUT CHANGE
  // ==========================

  const handleEditChange = (e) => {
    const {
      name,
      value,
      files,
    } = e.target;

    if (name === "image") {
      const file = files?.[0] || null;

      if (!file) {
        return;
      }

      setEditFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const previewUrl =
        URL.createObjectURL(file);

      setEditImagePreview(
        previewUrl
      );

      return;
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // UPDATE CATEGORY
  // ==========================

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      Swal.fire(
        "Error",
        "Please enter a category name.",
        "error"
      );

      return;
    }

    try {
      setUpdating(true);

      const data = new FormData();

      data.append(
        "name",
        editFormData.name.trim()
      );

      data.append(
        "description",
        editFormData.description
      );

      if (editFormData.image) {
        data.append(
          "image",
          editFormData.image
        );
      }

      const response = await axios.post(
        `${api_base}categories/${editFormData.id}/`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id ===
            editFormData.id
              ? {
                  ...category,
                  ...response.data.category,
                }
              : category
          )
        );

        Swal.fire({
          title: "Updated",
          text: response.data.msg,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        closeEditModal();
      }
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",
        error.response?.data?.msg ||
          "Failed to update category.",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ==========================
  // DELETE
  // ==========================

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This category will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${api_base}categories/${id}/delete/`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setCategories((prev) =>
          prev.filter(
            (category) =>
              category.id !== id
          )
        );

        Swal.fire({
          title: "Deleted",
          text: response.data.msg,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg ||
          "Delete failed.",
        "error"
      );
    }
  };

  // ==========================
  // SEARCH
  // ==========================

  const filteredCategories =
    categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const activeCount =
    categories.filter(
      (c) => c.status
    ).length;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">

          {/* =========================
               HEADER
          ========================== */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">

                <span>
                  Admin
                </span>

                <ChevronRight
                  size={14}
                />

                <span className="text-gray-300">
                  Categories
                </span>

              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">
                Categories
              </h1>

              <p className="text-gray-500 mt-1">
                Manage your product categories
              </p>

            </div>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-semibold shadow-lg shadow-[#F5A524]/20"
            >
              <Plus size={18} />

              Add Category
            </button>

          </div>

          {/* =========================
               STATS
          ========================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7">

            <StatCard
              icon={Tag}
              label="Total Categories"
              value={categories.length}
              accent="#F5A524"
            />

            <StatCard
              icon={CheckCircle2}
              label="Active Categories"
              value={activeCount}
              accent="#34D399"
            />

            <StatCard
              icon={Package}
              label="Total Products"
              value={categories.reduce(
                (sum, c) =>
                  sum + (c.products || 0),
                0
              )}
              accent="#3B82F6"
            />

          </div>

          {/* =========================
               SEARCH
          ========================== */}

          <div className="mt-7 flex">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] pl-11 pr-4 text-white outline-none focus:border-[#F5A524]/50"
              />

            </div>

          </div>

          {/* =========================
               LOADING
          ========================== */}

          {loading && (
            <div className="py-20 text-center text-gray-400">
              Loading categories...
            </div>
          )}

          {/* =========================
               GRID
          ========================== */}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">

              {filteredCategories.map(
                (category) => (

                  <div
                    key={category.id}
                    className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.14] hover:-translate-y-1 transition-all duration-300"
                  >

                    {/* IMAGE */}

                    <div className="relative h-48 overflow-hidden">

                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                          <ImageOff
                            size={40}
                            className="text-gray-600"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent" />

                      {/* STATUS */}

                      <div className="absolute top-3 left-3">
                        <StatusBadge
                          status={
                            category.status
                          }
                        />
                      </div>

                      {/* MORE MENU */}

                      <div className="absolute top-3 right-3">

                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId ===
                                category.id
                                ? null
                                : category.id
                            )
                          }
                          className={`w-9 h-9 rounded-lg backdrop-blur-md flex items-center justify-center transition-colors duration-150 ${
                            openMenuId ===
                            category.id
                              ? "bg-black/70 text-white"
                              : "bg-black/40 text-gray-200 hover:bg-black/60 hover:text-white"
                          }`}
                        >
                          <MoreVertical
                            size={17}
                          />
                        </button>

                        {openMenuId ===
                          category.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() =>
                                setOpenMenuId(
                                  null
                                )
                              }
                            />

                            <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 py-1.5 rounded-xl border border-white/10 bg-[#151B2B] shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-1 duration-150">

                              <button
                                onClick={() => {
                                  openEditModal(
                                    category
                                  );

                                  setOpenMenuId(
                                    null
                                  );
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors duration-100"
                              >
                                <Edit3
                                  size={14}
                                />

                                Edit
                              </button>

                              <div className="my-1 border-t border-white/[0.06]" />

                              <button
                                onClick={() => {
                                  setOpenMenuId(
                                    null
                                  );

                                  handleDelete(
                                    category.id
                                  );
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors duration-100"
                              >
                                <Trash2
                                  size={14}
                                />

                                Delete
                              </button>

                            </div>
                          </>
                        )}

                      </div>

                      {/* PRODUCT COUNT */}

                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-xs">

                        <Package
                          size={12}
                          className="inline mr-1"
                        />

                        {category.products ||
                          0}{" "}
                        products

                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="p-5">

                      <h3 className="text-lg font-semibold group-hover:text-[#F5A524]">
                        {category.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        /{category.slug}
                      </p>

                      {/* ACTIONS */}

                      <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">

                        <button
                          onClick={() =>
                            openEditModal(
                              category
                            )
                          }
                          className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center gap-2 text-sm hover:bg-white/[0.08] hover:text-white transition-colors duration-150"
                        >
                          <Edit3
                            size={14}
                          />

                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              category.id
                            )
                          }
                          className="w-10 h-10 rounded-lg bg-rose-500/[0.06] border border-rose-500/[0.12] text-rose-400 flex items-center justify-center hover:bg-rose-500/10 transition-colors duration-150"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

          {/* =========================
               EMPTY
          ========================== */}

          {!loading &&
            filteredCategories.length === 0 && (
              <div className="py-20 text-center">

                <ImageOff
                  size={40}
                  className="mx-auto text-gray-600"
                />

                <h3 className="mt-4 text-lg font-semibold">
                  No categories found
                </h3>

              </div>
            )}

        </div>

        {/* =========================
             ADD CATEGORY MODAL
        ========================== */}

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">

            <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/50">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#111722]/95 backdrop-blur-xl px-6 py-5">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">

                      <Plus
                        size={19}
                        className="text-[#F5A524]"
                      />

                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-white">
                        Add Category
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Create a new product category
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.09] transition-all duration-200"
                >
                  <X size={18} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleAddCategory
                }
                className="p-6 space-y-6"
              >

                {/* NAME */}

                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name
                  </label>

                  <div className="relative">

                    <Tag
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleChange
                      }
                      placeholder="Enter category name"
                      className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#F5A524]/60 focus:bg-white/[0.06] transition-all duration-200"
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="text-sm font-medium text-gray-300">
                      Description
                    </label>

                    <span className="text-[11px] text-gray-600">
                      Optional
                    </span>

                  </div>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Write a short description for this category..."
                    rows="4"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#F5A524]/60 focus:bg-white/[0.06] transition-all duration-200"
                  />

                </div>

                {/* IMAGE */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="text-sm font-medium text-gray-300">
                      Category Image
                    </label>

                    <span className="text-[11px] text-gray-600">
                      Optional
                    </span>

                  </div>

                  <label className="relative block w-full h-52 rounded-2xl overflow-hidden border border-dashed border-white/[0.12] bg-white/[0.03] cursor-pointer group hover:border-[#F5A524]/50 transition-all duration-200">

                    <div className="w-full h-full flex flex-col items-center justify-center">

                      <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">

                        <Upload
                          size={25}
                          className="text-gray-500"
                        />

                      </div>

                      <p className="text-sm text-gray-400 mt-3">
                        {formData.image
                          ? formData.image.name
                          : "Upload category image"}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        JPG, PNG or WEBP
                      </p>

                    </div>

                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={
                        handleChange
                      }
                      className="hidden"
                    />

                  </label>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">

                  <button
                    type="button"
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="w-full sm:flex-1 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 font-medium text-sm hover:bg-white/[0.08] hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-semibold text-sm shadow-lg shadow-[#F5A524]/10 hover:brightness-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={17} />
                    Add Category
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =========================
             EDIT CATEGORY MODAL
        ========================== */}

        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">

            <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/50">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#111722]/95 backdrop-blur-xl px-6 py-5">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 flex items-center justify-center">

                      <Edit3
                        size={18}
                        className="text-[#F5A524]"
                      />

                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-white">
                        Edit Category
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Update your category information
                      </p>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.09] transition-all duration-200"
                >
                  <X size={18} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleUpdateCategory
                }
                className="p-6 space-y-6"
              >

                {/* =========================
                     CATEGORY NAME
                ========================== */}

                <div>

                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category Name
                  </label>

                  <div className="relative">

                    <Tag
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="text"
                      name="name"
                      value={
                        editFormData.name
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Enter category name"
                      className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#F5A524]/60 focus:bg-white/[0.06] transition-all duration-200"
                    />

                  </div>

                </div>

                {/* =========================
                     DESCRIPTION
                ========================== */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="text-sm font-medium text-gray-300">
                      Description
                    </label>

                    <span className="text-[11px] text-gray-600">
                      Optional
                    </span>

                  </div>

                  <textarea
                    name="description"
                    value={
                      editFormData.description
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="Write a short description for this category..."
                    rows="4"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#F5A524]/60 focus:bg-white/[0.06] transition-all duration-200"
                  />

                </div>

                {/* =========================
                     CATEGORY IMAGE
                     CLICK SAME IMAGE TO CHANGE
                ========================== */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="text-sm font-medium text-gray-300">
                      Category Image
                    </label>

                    <span className="text-[11px] text-gray-600">
                      Click image to change
                    </span>

                  </div>

                  <label className="relative block w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03] cursor-pointer group">

                    {editImagePreview ? (
                      <img
                        src={
                          editImagePreview
                        }
                        alt={
                          editFormData.name ||
                          "Category"
                        }
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">

                        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">

                          <Upload
                            size={25}
                            className="text-gray-500"
                          />

                        </div>

                        <p className="text-sm text-gray-400 mt-3">
                          Upload category image
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          JPG, PNG or WEBP
                        </p>

                      </div>
                    )}

                    {/* HOVER OVERLAY */}

                    {editImagePreview && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-300 flex items-center justify-center">

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">

                          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">

                            <Upload
                              size={21}
                              className="text-white"
                            />

                          </div>

                          <span className="text-sm font-medium text-white mt-2">
                            Change Image
                          </span>

                        </div>

                      </div>
                    )}

                    {/* IMAGE STATUS */}

                    {editImagePreview && (
                      <div className="absolute left-3 bottom-3">

                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">

                          {editFormData.image ? (
                            <>
                              <Upload
                                size={12}
                              />

                              New Image
                            </>
                          ) : (
                            <>
                              <CheckCircle2
                                size={12}
                              />

                              Current Image
                            </>
                          )}

                        </span>

                      </div>
                    )}

                    {/* FILE INPUT */}

                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={
                        handleEditChange
                      }
                      className="hidden"
                    />

                  </label>

                  {editFormData.image && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      Selected:{" "}
                      {
                        editFormData.image
                          .name
                      }
                    </p>
                  )}

                </div>

                {/* =========================
                     ACTIONS
                ========================== */}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">

                  <button
                    type="button"
                    onClick={
                      closeEditModal
                    }
                    disabled={updating}
                    className="w-full sm:flex-1 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 font-medium text-sm hover:bg-white/[0.08] hover:text-white transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-semibold text-sm shadow-lg shadow-[#F5A524]/10 hover:shadow-[#F5A524]/20 hover:brightness-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >

                    {updating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />

                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={17}
                        />

                        Update Category
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}