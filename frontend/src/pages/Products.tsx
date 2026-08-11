import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import "./Products.css";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  createdAt: string;
  updatedAt: string;
  lowStock: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minimumStock: string;
  warehouse: string;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minimumStock: "0",
  warehouse: "",
};

function Products() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [viewingProduct, setViewingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>({
      ...emptyForm,
    });

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<ProductsResponse>(
          `/products?page=${page}&limit=10${
            search
              ? `&search=${encodeURIComponent(
                  search
                )}`
              : ""
          }`
        );

      setProducts(
        response.data.data || []
      );

      setTotal(
        response.data.pagination?.total || 0
      );

      setTotalPages(
        response.data.pagination
          ?.totalPages || 1
      );
    } catch (err: any) {
      console.error(
        "Load products error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const handleInputChange = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingProduct(null);

    setForm({
      ...emptyForm,
    });

    setShowForm(true);
  };

  const openEditForm = (
    product: Product
  ) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock:
        String(product.currentStock),
      minimumStock:
        String(product.minimumStock),
      warehouse: product.warehouse,
    });

    setShowForm(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const unitPrice =
        Number(form.unitPrice);

      const currentStock =
        Number(form.currentStock);

      const minimumStock =
        Number(form.minimumStock);

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        setError(
          "Unit price must be a valid non-negative number."
        );
        return;
      }

      if (
        !Number.isInteger(currentStock) ||
        currentStock < 0
      ) {
        setError(
          "Current stock must be a non-negative whole number."
        );
        return;
      }

      if (
        !Number.isInteger(minimumStock) ||
        minimumStock < 0
      ) {
        setError(
          "Minimum stock must be a non-negative whole number."
        );
        return;
      }

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        unitPrice,
        currentStock,
        minimumStock,
        warehouse:
          form.warehouse.trim(),
      };

      if (
        !payload.name ||
        !payload.sku ||
        !payload.category ||
        !payload.warehouse
      ) {
        setError(
          "Name, SKU, category and warehouse are required."
        );
        return;
      }

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          payload
        );
      } else {
        await api.post(
          "/products",
          payload
        );
      }

      setShowForm(false);
      setEditingProduct(null);

      setForm({
        ...emptyForm,
      });

      await loadProducts();
    } catch (err: any) {
      console.error(
        "Save product error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    product: Product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${product.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setError("");

      await api.delete(
        `/products/${product.id}`
      );

      await loadProducts();
    } catch (err: any) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);

    setForm({
      ...emptyForm,
    });
  };

  return (
    <div className="products-page">

      {/* Header */}

      <div className="products-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage products and inventory
            levels
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          <Plus size={17} />
          Add Product
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="products-error">

          <div className="products-error-content">
            <AlertTriangle size={17} />

            <span>{error}</span>
          </div>

          <button
            onClick={() =>
              setError("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* Main Card */}

      <div className="products-card">

        {/* Toolbar */}

        <div className="products-toolbar">

          <div className="search-box">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search by name, SKU, category or warehouse..."
              value={search}
              onChange={(event) => {
                setPage(1);

                setSearch(
                  event.target.value
                );
              }}
            />

          </div>

          <button
            className="refresh-button"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="products-loading">

            <RefreshCw
              size={22}
              className="spin"
            />

            <span>
              Loading products...
            </span>

          </div>
        ) : products.length === 0 ? (

          /* Empty */

          <div className="products-empty">

            <Package size={36} />

            <h3>
              No products found
            </h3>

            <p>
              Add your first product to
              get started.
            </p>

            <button
              className="primary-button"
              onClick={openCreateForm}
            >
              <Plus size={16} />
              Add Product
            </button>

          </div>

        ) : (

          /* Table */

          <>

            <div className="table-wrapper">

              <table className="products-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Unit Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Warehouse
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="actions-column">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products.map(
                    (product) => (
                      <tr
                        key={
                          product.id
                        }
                      >

                        {/* Product */}

                        <td>

                          <div className="product-name">

                            <div className="product-avatar">
                              <Package
                                size={16}
                              />
                            </div>

                            <div>

                              <strong>
                                {
                                  product.name
                                }
                              </strong>

                              <span>
                                ID:{" "}
                                {
                                  product.id
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* SKU */}

                        <td>
                          <span className="sku">
                            {
                              product.sku
                            }
                          </span>
                        </td>

                        {/* Category */}

                        <td>
                          <span className="category-badge">
                            {
                              product.category
                            }
                          </span>
                        </td>

                        {/* Price */}

                        <td>

                          <span className="price">
                            ₹
                            {Number(
                              product.unitPrice
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </td>

                        {/* Stock */}

                        <td>

                          <div className="stock-cell">

                            <strong
                              className={
                                product.lowStock
                                  ? "stock-low"
                                  : ""
                              }
                            >
                              {
                                product.currentStock
                              }
                            </strong>

                            <span>
                              /{" "}
                              {
                                product.minimumStock
                              }{" "}
                              min
                            </span>

                          </div>

                        </td>

                        {/* Warehouse */}

                        <td>
                          <span className="warehouse">
                            {
                              product.warehouse
                            }
                          </span>
                        </td>

                        {/* Status */}

                        <td>

                          {product.lowStock ? (
                            <span className="stock-status low">
                              Low Stock
                            </span>
                          ) : (
                            <span className="stock-status good">
                              In Stock
                            </span>
                          )}

                        </td>

                        {/* Actions */}

                        <td>

                          <div className="row-actions">

                            <button
                              className="icon-button"
                              title="View"
                              onClick={() =>
                                setViewingProduct(
                                  product
                                )
                              }
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            <button
                              className="icon-button"
                              title="Edit"
                              onClick={() =>
                                openEditForm(
                                  product
                                )
                              }
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              className="icon-button danger"
                              title="Delete"
                              disabled={
                                deletingId ===
                                product.id
                              }
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                            >
                              {deletingId ===
                              product.id ? (
                                <RefreshCw
                                  size={15}
                                  className="spin"
                                />
                              ) : (
                                <Trash2
                                  size={16}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Footer */}

            <div className="products-footer">

              <span>
                Showing{" "}
                {products.length} of{" "}
                {total} products
              </span>

              <div className="pagination">

                <button
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        previous - 1
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page {page} of{" "}
                  {totalPages}
                </span>

                <button
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (previous) =>
                        previous + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            </div>

          </>
        )}

      </div>

      {/* Create / Edit Modal */}

      {showForm && (
        <div className="modal-overlay">

          <div className="product-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update product information"
                    : "Enter product information"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* Name */}

                <div className="form-field">

                  <label>
                    Product Name *
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      handleInputChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Wireless Mouse"
                  />

                </div>

                {/* SKU */}

                <div className="form-field">

                  <label>
                    SKU *
                  </label>

                  <input
                    required
                    value={form.sku}
                    onChange={(event) =>
                      handleInputChange(
                        "sku",
                        event.target.value
                      )
                    }
                    placeholder="e.g. MOU001"
                  />

                </div>

                {/* Category */}

                <div className="form-field">

                  <label>
                    Category *
                  </label>

                  <input
                    required
                    value={
                      form.category
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "category",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Accessories"
                  />

                </div>

                {/* Unit Price */}

                <div className="form-field">

                  <label>
                    Unit Price *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.unitPrice
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "unitPrice",
                        event.target.value
                      )
                    }
                    placeholder="2500"
                  />

                </div>

                {/* Current Stock */}

                <div className="form-field">

                  <label>
                    Current Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.currentStock
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "currentStock",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* Minimum Stock */}

                <div className="form-field">

                  <label>
                    Minimum Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.minimumStock
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "minimumStock",
                        event.target.value
                      )
                    }
                  />

                </div>

                {/* Warehouse */}

                <div className="form-field full-width">

                  <label>
                    Warehouse *
                  </label>

                  <input
                    required
                    value={
                      form.warehouse
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "warehouse",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Bengaluru Warehouse"
                  />

                </div>

              </div>

              {/* Form Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProduct
                        ? "Update Product"
                        : "Create Product"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* View Product Modal */}

      {viewingProduct && (
        <div className="modal-overlay">

          <div className="product-modal view-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Product Details
                </h2>

                <p>
                  Complete product
                  information
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setViewingProduct(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="product-details">

              <div className="detail-header">

                <div className="large-product-avatar">
                  <Package
                    size={22}
                  />
                </div>

                <div>

                  <h3>
                    {
                      viewingProduct.name
                    }
                  </h3>

                  <span>
                    SKU:{" "}
                    {
                      viewingProduct.sku
                    }
                  </span>

                </div>

              </div>

              <div className="details-grid">

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {
                      viewingProduct.category
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Unit Price
                  </span>

                  <strong>
                    ₹
                    {Number(
                      viewingProduct.unitPrice
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Current Stock
                  </span>

                  <strong
                    className={
                      viewingProduct.lowStock
                        ? "detail-low-stock"
                        : ""
                    }
                  >
                    {
                      viewingProduct.currentStock
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Minimum Stock
                  </span>

                  <strong>
                    {
                      viewingProduct.minimumStock
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Warehouse
                  </span>

                  <strong>
                    {
                      viewingProduct.warehouse
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Stock Status
                  </span>

                  <strong>
                    {viewingProduct.lowStock
                      ? "Low Stock"
                      : "In Stock"}
                  </strong>
                </div>

              </div>

              <div className="detail-section">

                <span>
                  Created
                </span>

                <p>
                  {new Date(
                    viewingProduct.createdAt
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              <div className="detail-section">

                <span>
                  Last Updated
                </span>

                <p>
                  {new Date(
                    viewingProduct.updatedAt
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;