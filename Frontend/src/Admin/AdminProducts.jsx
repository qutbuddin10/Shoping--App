import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Boxes,
  FileText,
  Trash2,
  Edit3,
  Search,
  X,
  Loader2,
  FolderOpen,
  Sparkles,
  Ruler,
} from "lucide-react";
import Swal from "sweetalert2";
import AdminLayout from "./AdminLayout";
import api_base from "../apibase";
import { useSearchParams } from "react-router-dom";


const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const AdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addingSize, setAddingSize] = useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [deletedGalleryImageIds, setDeletedGalleryImageIds] = useState([]);
  const [mainPreviewType, setMainPreviewType] = useState("none");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeStocks, setSizeStocks] = useState({});

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");

  const [sizeForm, setSizeForm] = useState({
    size: "",
    stock: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // =====================================================
  // OPEN PRODUCT FROM GLOBAL ADMIN SEARCH
  // =====================================================

  useEffect(() => {
    if (!productId || products.length === 0) {
      return;
    }

    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    if (product) {
      setSearch(product.name || "");
    }
  }, [productId, products]);

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(`${api_base}categories/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to load categories");
      }

      setCategories(data);
    } catch (error) {
      console.error("Categories error:", error);

      Swal.fire(
        "Error",
        error.message || "Unable to load categories",
        "error"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(`${api_base}products/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to load products");
      }

      setProducts(data);
    } catch (error) {
      console.error("Products error:", error);

      Swal.fire(
        "Error",
        error.message || "Unable to load products",
        "error"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // MAIN IMAGE CHANGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      Swal.fire(
        "Error",
        "Please select a valid image",
        "error"
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      Swal.fire(
        "Error",
        "Image size must be less than 5 MB",
        "error"
      );
      return;
    }

    if (preview && mainPreviewType === "blob") {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setPreview(imagePreview);
    setMainPreviewType("blob");

    e.target.value = "";
  };

  // =====================================================
  // REMOVE MAIN IMAGE
  // =====================================================

  const removeImage = () => {
    if (preview && mainPreviewType === "blob") {
      URL.revokeObjectURL(preview);
    }

    setForm((prev) => ({
      ...prev,
      image: null,
    }));

    setPreview(null);
    setMainPreviewType("none");
  };

  // =====================================================
  // GALLERY IMAGE CHANGE
  // =====================================================

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        Swal.fire(
          "Invalid Image",
          `${file.name} is not a valid image`,
          "error"
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        Swal.fire(
          "Image Too Large",
          `${file.name} must be less than 5 MB`,
          "error"
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newPreviews = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setGalleryImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setGalleryPreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    e.target.value = "";
  };

  // =====================================================
  // REMOVE GALLERY IMAGE
  // =====================================================

  const removeGalleryImage = (index) => {
    setGalleryPreviews((prev) => {
      const image = prev[index];

      if (image?.url) {
        URL.revokeObjectURL(image.url);
      }

      return prev.filter((_, imageIndex) => imageIndex !== index);
    });

    setGalleryImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // =====================================================
  // TOGGLE SIZE
  // =====================================================

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        setSizeStocks((stocks) => {
          const updated = { ...stocks };

          delete updated[size];

          return updated;
        });

        return prev.filter((item) => item !== size);
      }

      setSizeStocks((stocks) => ({
        ...stocks,
        [size]: stocks[size] || "",
      }));

      return [...prev, size];
    });
  };

  // =====================================================
  // SIZE STOCK CHANGE
  // =====================================================

  const handleSizeStockChange = (size, value) => {
    setSizeStocks((prev) => ({
      ...prev,
      [size]: value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    galleryPreviews.forEach((item) => {
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image: null,
    });

    setPreview(null);
    setMainPreviewType("none");

    setGalleryImages([]);
    setGalleryPreviews([]);

    setSelectedSizes([]);
    setSizeStocks({});
    setEditingProduct(null);
    setExistingGalleryImages([]);
    setDeletedGalleryImageIds([]);
  };

  // =====================================================
  // OPEN EDIT PRODUCT
  // =====================================================

  const openEditProduct = (product) => {
    if (!product) {
      return;
    }

    if (preview && mainPreviewType === "blob") {
      URL.revokeObjectURL(preview);
    }

    galleryPreviews.forEach((item) => {
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    const normalizedGallery = (product.images || []).map((item, index) =>
      typeof item === "string"
        ? { id: null, url: item, key: `existing-${index}-${item}` }
        : { id: item.id, url: item.image, key: `existing-${item.id}` }
    );

    const productSizes = (product.sizes || []).map((item) => ({
      size: String(item.size),
      stock: item.stock ?? "",
    }));

    const sizes = productSizes.map((item) => item.size);
    const stocks = {};

    productSizes.forEach((item) => {
      stocks[item.size] = item.stock;
    });

    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category_id: product.category?.id ? String(product.category.id) : "",
      image: null,
    });
    setPreview(product.image || null);
    setMainPreviewType(product.image ? "existing" : "none");
    setGalleryImages([]);
    setGalleryPreviews([]);
    setExistingGalleryImages(normalizedGallery);
    setDeletedGalleryImageIds([]);
    setSelectedSizes(sizes);
    setSizeStocks(stocks);
    setShowForm(true);
  };

  // =====================================================
  // REMOVE EXISTING GALLERY IMAGE
  // =====================================================

  const removeExistingGalleryImage = (image) => {
    if (!image) {
      return;
    }

    setExistingGalleryImages((prev) =>
      prev.filter((item) => item.key !== image.key)
    );

    if (image.id) {
      setDeletedGalleryImageIds((prev) =>
        prev.includes(image.id) ? prev : [...prev, image.id]
      );
    }
  };

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    if (!form.name.trim()) {
      Swal.fire("Error", "Product name is required", "error");
      return;
    }

    if (!form.category_id) {
      Swal.fire("Error", "Please select a category", "error");
      return;
    }

    if (form.price === "") {
      Swal.fire("Error", "Product price is required", "error");
      return;
    }

    if (form.stock === "") {
      Swal.fire("Error", "Product stock is required", "error");
      return;
    }

    if (Number(form.price) < 0) {
      Swal.fire("Error", "Price cannot be negative", "error");
      return;
    }

    if (
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      Swal.fire(
        "Error",
        "Stock must be a valid whole number",
        "error"
      );
      return;
    }

    if (!validateSizes()) {
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category_id", form.category_id);
      formData.append(
        "sizes",
        JSON.stringify(
          selectedSizes.map((size) => ({
            size,
            stock: Number(sizeStocks[size]),
          }))
        )
      );

      if (form.image) {
        formData.append("image", form.image);
      }

      galleryImages.forEach((file) => {
        formData.append("gallery_images", file);
      });

      const response = await fetch(
        `${api_base}products/${editingProduct.id}/update/`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to update product");
      }

      for (const imageId of deletedGalleryImageIds) {
        const deleteResponse = await fetch(
          `${api_base}product-images/${imageId}/delete/`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!deleteResponse.ok) {
          const deleteData = await deleteResponse.json().catch(() => ({}));
          throw new Error(
            deleteData.msg || `Failed to delete gallery image ${imageId}`
          );
        }
      }

      await fetchProducts();

      setShowForm(false);
      resetForm();

      Swal.fire({
        title: "Updated",
        text: "Product updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Update product error:", error);

      Swal.fire(
        "Error",
        error.message || "Unable to update product",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  // =====================================================
  // VALIDATE SIZES
  // =====================================================

  const validateSizes = () => {
    for (const size of selectedSizes) {
      const stock = sizeStocks[size];

      if (stock === "" || stock === undefined) {
        Swal.fire(
          "Size Stock Required",
          `Please enter stock for size ${size}`,
          "error"
        );

        return false;
      }

      if (
        Number(stock) < 0 ||
        !Number.isInteger(Number(stock))
      ) {
        Swal.fire(
          "Invalid Stock",
          `Stock for size ${size} must be a valid whole number`,
          "error"
        );

        return false;
      }
    }

    return true;
  };

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const handleSubmit = async (e) => {
    if (editingProduct) {
      await handleUpdate(e);
      return;
    }

    e.preventDefault();

    // ===================================================
    // BASIC VALIDATION
    // ===================================================

    if (!form.name.trim()) {
      Swal.fire(
        "Error",
        "Product name is required",
        "error"
      );
      return;
    }

    if (!form.category_id) {
      Swal.fire(
        "Error",
        "Please select a category",
        "error"
      );
      return;
    }

    if (form.price === "") {
      Swal.fire(
        "Error",
        "Product price is required",
        "error"
      );
      return;
    }

    if (form.stock === "") {
      Swal.fire(
        "Error",
        "Product stock is required",
        "error"
      );
      return;
    }

    if (Number(form.price) < 0) {
      Swal.fire(
        "Error",
        "Price cannot be negative",
        "error"
      );
      return;
    }

    if (
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      Swal.fire(
        "Error",
        "Stock must be a valid whole number",
        "error"
      );
      return;
    }

    // ===================================================
    // SIZE VALIDATION
    // ===================================================

    if (!validateSizes()) {
      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // CREATE FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "stock",
        form.stock
      );

      formData.append(
        "category_id",
        form.category_id
      );

      // =================================================
      // MAIN IMAGE
      // =================================================

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      // =================================================
      // GALLERY IMAGES
      // =================================================

      galleryImages.forEach((file) => {
        formData.append(
          "gallery_images",
          file
        );
      });

      // =================================================
      // CREATE PRODUCT API
      // =================================================

      const response = await fetch(
        `${api_base}products/`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Failed to add product"
        );
      }

      const newProduct = data.product;

      // =================================================
      // CREATE PRODUCT SIZES
      // =================================================

      const createdSizes = [];

      for (const size of selectedSizes) {
        const sizeResponse = await fetch(
          `${api_base}products/${newProduct.id}/sizes/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              size: size,
              stock: Number(
                sizeStocks[size]
              ),
            }),
          }
        );

        const sizeData =
          await sizeResponse.json();

        if (!sizeResponse.ok) {
          throw new Error(
            sizeData.msg ||
              `Failed to add size ${size}`
          );
        }

        if (sizeData.size) {
          createdSizes.push(
            sizeData.size
          );
        }
      }

      // =================================================
      // ADD PRODUCT TO FRONTEND
      // =================================================

      const productWithSizes = {
        ...newProduct,
        sizes: createdSizes,
      };

      setProducts((prev) => [
        productWithSizes,
        ...prev,
      ]);

      // =================================================
      // RESET FORM
      // =================================================

      setShowForm(false);
      resetForm();

      Swal.fire({
        title: "Success",
        text: "Product, gallery images and sizes added successfully",
        icon: "success",
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      Swal.fire(
        "Error",
        error.message ||
          "Unable to add product",
        "error"
      );

      await fetchProducts();
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `"${name}" permanently delete thase.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#374151",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#111722",
      color: "#ffffff",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `${api_base}products/${id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg ||
            "Failed to delete product"
        );
      }

      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.id !== id
        )
      );

      Swal.fire({
        title: "Deleted",
        text: "Product deleted successfully",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      Swal.fire(
        "Error",
        error.message ||
          "Unable to delete product",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // OPEN SIZE MODAL
  // =====================================================

  const openSizeModal = (product) => {
    setSelectedProduct(product);

    setSizeForm({
      size: "",
      stock: "",
    });

    setShowSizeModal(true);
  };

  // =====================================================
  // CLOSE SIZE MODAL
  // =====================================================

  const closeSizeModal = () => {
    if (addingSize) {
      return;
    }

    setShowSizeModal(false);
    setSelectedProduct(null);

    setSizeForm({
      size: "",
      stock: "",
    });
  };

  // =====================================================
  // ADD SIZE TO EXISTING PRODUCT
  // =====================================================

  const handleAddSize = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const size = sizeForm.size.trim();

    if (!size) {
      Swal.fire(
        "Error",
        "Size is required",
        "error"
      );
      return;
    }

    if (sizeForm.stock === "") {
      Swal.fire(
        "Error",
        "Stock is required",
        "error"
      );
      return;
    }

    if (
      Number(sizeForm.stock) < 0 ||
      !Number.isInteger(
        Number(sizeForm.stock)
      )
    ) {
      Swal.fire(
        "Error",
        "Stock must be a valid whole number",
        "error"
      );
      return;
    }

    try {
      setAddingSize(true);

      const response = await fetch(
        `${api_base}products/${selectedProduct.id}/sizes/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            size: size,
            stock: Number(
              sizeForm.stock
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg ||
            "Failed to add size"
        );
      }

      setProducts((prev) =>
        prev.map((product) => {
          if (
            product.id !==
            selectedProduct.id
          ) {
            return product;
          }

          return {
            ...product,
            sizes: [
              ...(product.sizes || []),
              data.size,
            ],
          };
        })
      );

      setSelectedProduct((prev) => ({
        ...prev,
        sizes: [
          ...(prev.sizes || []),
          data.size,
        ],
      }));

      setSizeForm({
        size: "",
        stock: "",
      });

      Swal.fire({
        title: "Success",
        text: `Size ${size} added successfully`,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Add size error:",
        error
      );

      Swal.fire(
        "Error",
        error.message ||
          "Unable to add size",
        "error"
      );
    } finally {
      setAddingSize(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProducts = products.filter(
    (product) =>
      product.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      product.category?.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0B0F19] text-white pt-[72px] sm:pt-20">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="relative overflow-hidden border-b border-white/[0.06]">

          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-[#F5A524]/10 rounded-full blur-[120px]" />

          <div className="absolute -bottom-40 -left-20 w-[350px] h-[350px] bg-[#2DD4BF]/[0.06] rounded-full blur-[120px]" />

          <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#F5A524] text-xs font-semibold">
                  <Package size={14} />
                  Product Management
                </div>

                <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                  Manage Products
                </h1>

                <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl">
                  Add, manage and organize your store products by category, size and gallery images.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-xs text-gray-500">
                    Total Products
                  </p>

                  <p className="text-2xl font-black text-white mt-0.5">
                    {products.length}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowForm(true)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-bold text-sm shadow-lg shadow-[#F5A524]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                >
                  <Plus
                    size={19}
                    strokeWidth={2.5}
                  />

                  Add Product
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                All Products
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} products found
              </p>

            </div>

            <div className="relative w-full sm:w-80">

              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-gray-500 outline-none focus:bg-white/[0.05] focus:border-[#F5A524]/50 transition-colors duration-200"
              />

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingProducts && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl h-[470px] animate-pulse"
                  />
                )
              )}

            </div>
          )}

          {/* =================================================
              PRODUCT CARDS
          ================================================= */}

          {!loadingProducts &&
            filteredProducts.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {filteredProducts.map(
                  (product) => {

                    const totalSizeStock =
                      Number(product.stock || 0);

                    return (
                      <div
                        key={product.id}
                        className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-2xl hover:shadow-black/30 transition-all duration-300"
                      >

                        {/* IMAGE */}

                        <div className="relative aspect-[1.15/1] bg-white/[0.02] overflow-hidden">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">

                              <ImageIcon
                                size={35}
                              />

                              <span className="text-xs mt-2">
                                No Image
                              </span>

                            </div>
                          )}

                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-bold text-gray-200">
                            {product.category?.name ||
                              "Uncategorized"}
                          </div>

                          {product.images?.length > 0 && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white">
                              +{product.images.length} Photos
                            </div>
                          )}

                        </div>

                        {/* CONTENT */}

                        <div className="p-5">

                          <h3 className="font-bold text-base text-white line-clamp-1">
                            {product.name}
                          </h3>

                          <p className="mt-2 text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                            {product.description ||
                              "No description available"}
                          </p>

                          {/* PRICE + STOCK */}

                          <div className="flex items-center justify-between mt-4">

                            <div>

                              <p className="text-xs text-gray-600">
                                Price
                              </p>

                              <p className="text-lg font-black text-white">
                                ₹{product.price}
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-xs text-gray-600">
                                Stock
                              </p>

                              <p
                                className={`text-sm font-bold ${
                                  totalSizeStock > 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {totalSizeStock}
                              </p>

                            </div>

                          </div>

                          {/* SIZES */}

                          <div className="mt-4">

                            <div className="flex items-center justify-between mb-2">

                              <div className="flex items-center gap-1.5">

                                <Ruler
                                  size={14}
                                  className="text-[#F5A524]"
                                />

                                <p className="text-xs font-semibold text-gray-400">
                                  Sizes
                                </p>

                              </div>

                              <button
                                onClick={() =>
                                  openSizeModal(
                                    product
                                  )
                                }
                                className="text-[11px] font-semibold text-[#F5A524] hover:text-white transition-colors"
                              >
                                + Add Size
                              </button>

                            </div>

                            {product.sizes &&
                            product.sizes.length >
                              0 ? (
                              <div className="flex flex-wrap gap-1.5">

                                {product.sizes.map(
                                  (item) => (
                                    <div
                                      key={item.id}
                                      className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px]"
                                    >

                                      <span className="font-bold text-gray-200">
                                        {item.size}
                                      </span>

                                      <span className="text-gray-500 ml-1">
                                        ({item.stock})
                                      </span>

                                    </div>
                                  )
                                )}

                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-600">
                                No sizes added
                              </p>
                            )}

                          </div>

                          {/* ACTIONS */}

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#F5A524]/20 bg-[#F5A524]/[0.06] text-[#F5A524] text-sm font-semibold hover:bg-[#F5A524] hover:text-black hover:border-[#F5A524] transition-colors duration-200"
                            >
                              <Edit3 size={16} />
                              Edit Product
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  product.id,
                                  product.name
                                )
                              }
                              disabled={
                                deletingId ===
                                product.id
                              }
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] text-rose-400 text-sm font-semibold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors duration-200 disabled:opacity-50"
                            >

                              {deletingId ===
                              product.id ? (
                                <>
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />

                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={16} />

                                  Delete
                                </>
                              )}

                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loadingProducts &&
            filteredProducts.length ===
              0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl py-20 px-6 text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center">
                  <Package size={30} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  Add your first product using the button above and it will appear here.
                </p>

                <button
                  onClick={() =>
                    setShowForm(true)
                  }
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-semibold text-sm shadow-lg shadow-[#F5A524]/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus size={16} />
                  Add Product
                </button>

              </div>
            )}

        </main>

      </div>

      {/* =====================================================
          ADD PRODUCT DRAWER
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex justify-end">

          {/* BACKDROP */}

          <div
            onClick={closeForm}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* PANEL */}

          <div className="relative w-full max-w-md h-full bg-[#0E1420] border-l border-white/10 shadow-2xl shadow-black/50 flex flex-col">

            {/* HEADER */}

            <div className="relative overflow-hidden shrink-0 border-b border-white/[0.06]">

              <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#F5A524]/10 rounded-full blur-[80px]" />

              <div className="relative px-6 py-5 flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-[#F5A524]/10 text-[#F5A524] flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>

                  <div>

                    <h2 className="font-bold text-lg text-white">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {editingProduct
                        ? "Update product details, images and sizes"
                        : "Add product details, images and sizes"}
                    </p>

                  </div>

                </div>

                <button
                  onClick={closeForm}
                  className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X size={17} />
                </button>

              </div>

            </div>

            {/* FORM */}

            <form
              id="product-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >

              {/* =================================================
                  MAIN PRODUCT IMAGE
              ================================================= */}

              <div>

                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Main Product Image
                </label>

                {preview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">

                    <img
                      src={preview}
                      alt="Product preview"
                      className="w-full h-48 object-cover"
                    />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                      Main Image
                    </div>

                    {editingProduct ? (
                      <>
                        <label
                          htmlFor="main-image-input"
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-[#F5A524] hover:text-black transition-colors cursor-pointer"
                        >
                          <Edit3 size={17} />
                        </label>

                        <input
                          id="main-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <X size={17} />
                      </button>
                    )}

                  </div>
                ) : (
                  <label className="group flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-[#F5A524]/[0.04] hover:border-[#F5A524]/40 transition-colors cursor-pointer">

                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-gray-500 group-hover:text-[#F5A524]">
                      <ImageIcon size={21} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-300">
                      {editingProduct
                        ? "Upload replacement image"
                        : "Upload main product image"}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      PNG, JPG or WEBP · Max 5MB
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>
                )}

              </div>

              {/* =================================================
                  GALLERY IMAGES
              ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-gray-300">
                    Additional Product Images
                  </label>

                  <span className="text-[11px] text-gray-600">
                    Multiple
                  </span>

                </div>

                <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-[#F5A524]/[0.04] hover:border-[#F5A524]/40 transition-colors cursor-pointer">

                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-gray-500 group-hover:text-[#F5A524]">
                    <Plus size={20} />
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-300">
                    Add gallery images
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Select multiple images · Max 5MB each
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                  />

                </label>

                {/* EXISTING GALLERY IMAGES */}

                {editingProduct && existingGalleryImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-gray-500 mb-2">
                      Existing gallery images
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {existingGalleryImages.map((item, index) => (
                        <div
                          key={item.key}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]"
                        >
                          <img
                            src={item.url}
                            alt={`Existing gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(item)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>

                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white">
                            Existing {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEW GALLERY PREVIEWS */}

                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">

                    {galleryPreviews.map(
                      (item, index) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]"
                        >

                          <img
                            src={item.url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeGalleryImage(
                                index
                              )
                            }
                            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>

                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-white">
                            Image {index + 1}
                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

                {galleryImages.length > 0 && (
                  <p className="mt-2 text-[11px] text-gray-500">
                    {galleryImages.length} gallery image
                    {galleryImages.length > 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                )}

              </div>

              {/* =================================================
                  PRODUCT NAME
              ================================================= */}

              <div>

                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Product Name
                </label>

                <div className="relative">

                  <Tag
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-gray-500 outline-none focus:border-[#F5A524]/50"
                  />

                </div>

              </div>

              {/* =================================================
                  CATEGORY
              ================================================= */}

              <div>

                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>

                <div className="relative">

                  <FolderOpen
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />

                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={loadingCategories}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-gray-200 text-sm outline-none focus:border-[#F5A524]/50 appearance-none cursor-pointer"
                  >

                    <option
                      className="bg-[#111722]"
                      value=""
                    >
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories
                      .filter(
                        (category) =>
                          category.status ===
                          true
                      )
                      .map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="bg-[#111722]"
                        >
                          {category.name}
                        </option>
                      ))}

                  </select>

                </div>

              </div>

              {/* =================================================
                  PRICE + STOCK
              ================================================= */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Price
                  </label>

                  <div className="relative">

                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm outline-none focus:border-[#F5A524]/50"
                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Base Stock
                  </label>

                  <div className="relative">

                    <Boxes
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm outline-none focus:border-[#F5A524]/50"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  SIZE SELECTION
              ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-gray-300">
                    Available Sizes
                  </label>

                  <span className="text-[11px] text-gray-600">
                    Optional
                  </span>

                </div>

                <div className="grid grid-cols-5 gap-2">

                  {SIZE_OPTIONS.map(
                    (size) => {
                      const active =
                        selectedSizes.includes(
                          size
                        );

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            toggleSize(
                              size
                            )
                          }
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? "bg-[#F5A524] border-[#F5A524] text-black shadow-lg shadow-[#F5A524]/10"
                              : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.18]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  SIZE STOCKS
              ================================================= */}

              {selectedSizes.length >
                0 && (
                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-sm font-semibold text-gray-300">
                      Size Stock
                    </label>

                    <span className="text-[11px] text-gray-600">
                      Enter stock for each size
                    </span>

                  </div>

                  <div className="space-y-2">

                    {selectedSizes.map(
                      (size) => (
                        <div
                          key={size}
                          className="flex items-center gap-3"
                        >

                          <div className="w-16 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-[#F5A524]">
                            {size}
                          </div>

                          <div className="relative flex-1">

                            <Boxes
                              size={15}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                            />

                            <input
                              type="number"
                              min="0"
                              value={
                                sizeStocks[
                                  size
                                ] ?? ""
                              }
                              onChange={(e) =>
                                handleSizeStockChange(
                                  size,
                                  e.target.value
                                )
                              }
                              placeholder="Stock"
                              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm outline-none focus:border-[#F5A524]/50"
                            />

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              toggleSize(
                                size
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-red-500/[0.06] border border-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <X size={15} />
                          </button>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>

                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>

                <div className="relative">

                  <FileText
                    size={17}
                    className="absolute left-3.5 top-3.5 text-gray-500"
                  />

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Write a short product description..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-gray-500 outline-none resize-none focus:border-[#F5A524]/50"
                  />

                </div>

              </div>

            </form>

            {/* FOOTER */}

            <div className="shrink-0 px-6 py-5 border-t border-white/[0.06] bg-[#0E1420]">

              <button
                type="submit"
                form="product-form"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-bold text-sm shadow-lg shadow-[#F5A524]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    {editingProduct ? "Updating Product..." : "Adding Product..."}
                  </>
                ) : (
                  <>
                    {editingProduct ? <Edit3 size={18} /> : <Plus size={18} />}

                    {editingProduct ? "Update Product" : "Add Product"}
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD SIZE MODAL
      ====================================================== */}

      {showSizeModal &&
        selectedProduct && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">

            <div
              onClick={closeSizeModal}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-md bg-[#0E1420] border border-white/10 rounded-2xl shadow-2xl">

              {/* MODAL HEADER */}

              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-white">
                    Add Product Size
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {selectedProduct.name}
                  </p>

                </div>

                <button
                  onClick={closeSizeModal}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 flex items-center justify-center hover:text-white"
                >
                  <X size={17} />
                </button>

              </div>

              {/* MODAL BODY */}

              <form
                onSubmit={handleAddSize}
                className="p-6 space-y-5"
              >

                <div>

                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Size
                  </label>

                  <div className="grid grid-cols-5 gap-2 mb-3">

                    {SIZE_OPTIONS.map(
                      (size) => {

                        const exists =
                          selectedProduct.sizes?.some(
                            (item) =>
                              String(
                                item.size
                              ).toLowerCase() ===
                              size.toLowerCase()
                          );

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={exists}
                            onClick={() =>
                              setSizeForm(
                                (prev) => ({
                                  ...prev,
                                  size,
                                })
                              )
                            }
                            className={`py-2 rounded-lg text-xs font-bold border ${
                              sizeForm.size ===
                              size
                                ? "bg-[#F5A524] border-[#F5A524] text-black"
                                : exists
                                ? "bg-white/[0.02] border-white/[0.04] text-gray-700 cursor-not-allowed"
                                : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:text-white"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      }
                    )}

                  </div>

                  <input
                    type="text"
                    value={sizeForm.size}
                    onChange={(e) =>
                      setSizeForm(
                        (prev) => ({
                          ...prev,
                          size: e.target.value,
                        })
                      )
                    }
                    placeholder="Or enter custom size"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm outline-none focus:border-[#F5A524]/50"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Stock
                  </label>

                  <div className="relative">

                    <Boxes
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="number"
                      min="0"
                      value={sizeForm.stock}
                      onChange={(e) =>
                        setSizeForm(
                          (prev) => ({
                            ...prev,
                            stock: e.target.value,
                          })
                        )
                      }
                      placeholder="Enter size stock"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm outline-none focus:border-[#F5A524]/50"
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={addingSize}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#F5A524] to-[#E08E0B] text-black font-bold text-sm disabled:opacity-60"
                >

                  {addingSize ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Adding Size...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Add Size
                    </>
                  )}

                </button>

              </form>

            </div>

          </div>
        )}

    </AdminLayout>
  );
};

export default AdminProducts;