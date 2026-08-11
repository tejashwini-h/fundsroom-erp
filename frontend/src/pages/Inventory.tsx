import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import "./Inventory.css";

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

interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  createdBy: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
  };
}

interface MovementsResponse {
  success: boolean;
  data: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type StockAction = "IN" | "OUT";

function Inventory() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingMovements, setLoadingMovements] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [movementPage, setMovementPage] =
    useState(1);

  const [movementTotal, setMovementTotal] =
    useState(0);

  const [movementTotalPages, setMovementTotalPages] =
    useState(1);

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [stockAction, setStockAction] =
    useState<StockAction>("IN");

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const response =
        await api.get<ProductsResponse>(
          "/products?page=1&limit=100"
        );

      setProducts(
        response.data.data || []
      );
    } catch (err: any) {
      console.error(
        "Load inventory products error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadMovements = async () => {
    try {
      setLoadingMovements(true);

      const response =
        await api.get<MovementsResponse>(
          `/inventory/movements?page=${movementPage}&limit=10`
        );

      setMovements(
        response.data.data || []
      );

      setMovementTotal(
        response.data.pagination?.total || 0
      );

      setMovementTotalPages(
        response.data.pagination?.totalPages || 1
      );
    } catch (err: any) {
      console.error(
        "Load stock movements error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load stock movements."
      );
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [movementPage]);

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(query) ||
        product.sku
          .toLowerCase()
          .includes(query) ||
        product.category
          .toLowerCase()
          .includes(query) ||
        product.warehouse
          .toLowerCase()
          .includes(query)
    );
  }, [products, search]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + product.currentStock,
      0
    );
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (product) => product.lowStock
    ).length;
  }, [products]);

  const belowMinimumCount = useMemo(() => {
    return products.filter(
      (product) =>
        product.currentStock <
        product.minimumStock
    ).length;
  }, [products]);

  const openStockModal = (
    action: StockAction
  ) => {
    setStockAction(action);
    setSelectedProductId("");
    setQuantity("");
    setReason("");
    setError("");
    setSuccessMessage("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (saving) {
      return;
    }

    setShowStockModal(false);
    setSelectedProductId("");
    setQuantity("");
    setReason("");
  };

  const handleStockSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const parsedProductId =
      Number(selectedProductId);

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedProductId
      ) ||
      parsedProductId <= 0
    ) {
      setError(
        "Please select a valid product."
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be a positive whole number."
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Reason is required."
      );
      return;
    }

    const selectedProduct =
      products.find(
        (product) =>
          product.id ===
          parsedProductId
      );

    if (!selectedProduct) {
      setError(
        "Selected product was not found."
      );
      return;
    }

    if (
      stockAction === "OUT" &&
      selectedProduct.currentStock <
        parsedQuantity
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedProduct.currentStock}.`
      );
      return;
    }

    try {
      setSaving(true);

      const endpoint =
        stockAction === "IN"
          ? "/inventory/stock-in"
          : "/inventory/stock-out";

      const response =
        await api.post(endpoint, {
          productId:
            parsedProductId,
          quantity:
            parsedQuantity,
          reason:
            reason.trim(),
        });

      setSuccessMessage(
        response.data?.message ||
          "Stock updated successfully."
      );

      setShowStockModal(false);

      setSelectedProductId("");
      setQuantity("");
      setReason("");

      await Promise.all([
        loadProducts(),
        loadMovements(),
      ]);
    } catch (err: any) {
      console.error(
        "Stock update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update stock."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setSuccessMessage("");

    await Promise.all([
      loadProducts(),
      loadMovements(),
    ]);
  };

  return (
    <div className="inventory-page">

      {/* Header */}

      <div className="inventory-header">

        <div>
          <h1>Inventory</h1>

          <p>
            Manage stock levels and
            inventory movements
          </p>
        </div>

        <button
          className="inventory-refresh-button"
          onClick={handleRefresh}
          disabled={
            loadingProducts ||
            loadingMovements
          }
        >
          <RefreshCw
            size={16}
            className={
              loadingProducts ||
              loadingMovements
                ? "inventory-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* Messages */}

      {error && (
        <div className="inventory-message error">

          <div>
            <AlertTriangle
              size={17}
            />

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

      {successMessage && (
        <div className="inventory-message success">

          <span>
            {successMessage}
          </span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* Summary */}

      <div className="inventory-summary">

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon">
            <Package size={19} />
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {products.length}
            </strong>
          </div>

        </div>

        <div className="inventory-stat-card">

          <div className="inventory-stat-icon">
            <Package size={19} />
          </div>

          <div>
            <span>
              Total Stock
            </span>

            <strong>
              {totalStock}
            </strong>
          </div>

        </div>

        <div className="inventory-stat-card warning">

          <div className="inventory-stat-icon">
            <AlertTriangle
              size={19}
            />
          </div>

          <div>
            <span>
              Low Stock
            </span>

            <strong>
              {lowStockCount}
            </strong>
          </div>

        </div>

        <div className="inventory-stat-card danger">

          <div className="inventory-stat-icon">
            <AlertTriangle
              size={19}
            />
          </div>

          <div>
            <span>
              Below Minimum
            </span>

            <strong>
              {belowMinimumCount}
            </strong>
          </div>

        </div>

      </div>

      {/* Stock Actions */}

      <div className="inventory-actions-card">

        <div>

          <h2>
            Stock Management
          </h2>

          <p>
            Add or remove stock and
            automatically record the
            movement.
          </p>

        </div>

        <div className="inventory-action-buttons">

          <button
            className="stock-in-button"
            onClick={() =>
              openStockModal("IN")
            }
          >
            <ArrowDownToLine
              size={17}
            />

            Stock In
          </button>

          <button
            className="stock-out-button"
            onClick={() =>
              openStockModal("OUT")
            }
          >
            <ArrowUpFromLine
              size={17}
            />

            Stock Out
          </button>

        </div>

      </div>

      {/* Current Inventory */}

      <div className="inventory-card">

        <div className="inventory-card-header">

          <div>
            <h2>
              Current Inventory
            </h2>

            <p>
              Current stock levels for
              all products
            </p>
          </div>

          <div className="inventory-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {loadingProducts ? (

          <div className="inventory-loading">

            <RefreshCw
              size={22}
              className="inventory-spin"
            />

            <span>
              Loading inventory...
            </span>

          </div>

        ) : filteredProducts.length ===
          0 ? (

          <div className="inventory-empty">

            <Package size={34} />

            <h3>
              No products found
            </h3>

            <p>
              No inventory items match
              your search.
            </p>

          </div>

        ) : (

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Warehouse
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Minimum
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={
                        product.id
                      }
                    >

                      <td>

                        <div className="inventory-product">

                          <div className="inventory-product-icon">
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
                              {
                                product.category
                              }
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="inventory-sku">
                          {
                            product.sku
                          }
                        </span>
                      </td>

                      <td>
                        {
                          product.warehouse
                        }
                      </td>

                      <td>

                        <strong
                          className={
                            product.lowStock
                              ? "inventory-stock-low"
                              : ""
                          }
                        >
                          {
                            product.currentStock
                          }
                        </strong>

                      </td>

                      <td>
                        {
                          product.minimumStock
                        }
                      </td>

                      <td>

                        {product.lowStock ? (
                          <span className="inventory-status low">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inventory-status good">
                            In Stock
                          </span>
                        )}

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Movement History */}

      <div className="inventory-card">

        <div className="inventory-card-header">

          <div>
            <h2>
              Stock Movement History
            </h2>

            <p>
              {movementTotal} total
              movements
            </p>
          </div>

        </div>

        {loadingMovements ? (

          <div className="inventory-loading">

            <RefreshCw
              size={22}
              className="inventory-spin"
            />

            <span>
              Loading movements...
            </span>

          </div>

        ) : movements.length ===
          0 ? (

          <div className="inventory-empty">

            <Package size={34} />

            <h3>
              No stock movements
            </h3>

            <p>
              Stock movement history
              will appear here.
            </p>

          </div>

        ) : (

          <>

            <div className="inventory-table-wrapper">

              <table className="inventory-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Reason
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {movements.map(
                    (movement) => (
                      <tr
                        key={
                          movement.id
                        }
                      >

                        <td>

                          <div className="movement-product">

                            <strong>
                              {
                                movement
                                  .product
                                  .name
                              }
                            </strong>

                            <span>
                              {
                                movement
                                  .product
                                  .sku
                              }
                            </span>

                          </div>

                        </td>

                        <td>

                          {movement.type ===
                          "IN" ? (
                            <span className="movement-type in">
                              <ArrowDownToLine
                                size={14}
                              />

                              Stock In
                            </span>
                          ) : (
                            <span className="movement-type out">
                              <ArrowUpFromLine
                                size={14}
                              />

                              Stock Out
                            </span>
                          )}

                        </td>

                        <td>

                          <strong
                            className={
                              movement.type ===
                              "IN"
                                ? "movement-quantity in"
                                : "movement-quantity out"
                            }
                          >
                            {movement.type ===
                            "IN"
                              ? "+"
                              : "-"}
                            {
                              movement.quantity
                            }
                          </strong>

                        </td>

                        <td>
                          <span className="movement-reason">
                            {
                              movement.reason
                            }
                          </span>
                        </td>

                        <td>

                          <span className="movement-date">
                            {new Date(
                              movement.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="inventory-pagination">

              <span>
                Showing{" "}
                {movements.length} of{" "}
                {movementTotal}
              </span>

              <div>

                <button
                  disabled={
                    movementPage <=
                    1
                  }
                  onClick={() =>
                    setMovementPage(
                      (previous) =>
                        previous - 1
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page{" "}
                  {movementPage} of{" "}
                  {movementTotalPages}
                </span>

                <button
                  disabled={
                    movementPage >=
                    movementTotalPages
                  }
                  onClick={() =>
                    setMovementPage(
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

      {/* Stock In / Stock Out Modal */}

      {showStockModal && (
        <div className="inventory-modal-overlay">

          <div className="inventory-modal">

            <div className="inventory-modal-header">

              <div>

                <div
                  className={
                    stockAction ===
                    "IN"
                      ? "inventory-modal-icon in"
                      : "inventory-modal-icon out"
                  }
                >
                  {stockAction ===
                  "IN" ? (
                    <ArrowDownToLine
                      size={19}
                    />
                  ) : (
                    <ArrowUpFromLine
                      size={19}
                    />
                  )}
                </div>

                <div>

                  <h2>
                    {stockAction ===
                    "IN"
                      ? "Stock In"
                      : "Stock Out"}
                  </h2>

                  <p>
                    {stockAction ===
                    "IN"
                      ? "Add stock to a product"
                      : "Remove stock from a product"}
                  </p>

                </div>

              </div>

              <button
                className="inventory-modal-close"
                onClick={
                  closeStockModal
                }
                disabled={saving}
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="inventory-form"
              onSubmit={
                handleStockSubmit
              }
            >

              <div className="inventory-form-field">

                <label>
                  Product *
                </label>

                <select
                  required
                  value={
                    selectedProductId
                  }
                  onChange={(event) =>
                    setSelectedProductId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select a product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {product.name} (
                        {
                          product.sku
                        }
                        ) — Stock:{" "}
                        {
                          product.currentStock
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="inventory-form-field">

                <label>
                  Quantity *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                  placeholder="Enter quantity"
                />

              </div>

              <div className="inventory-form-field">

                <label>
                  Reason *
                </label>

                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder={
                    stockAction ===
                    "IN"
                      ? "e.g. New stock received from supplier"
                      : "e.g. Customer order dispatch"
                  }
                />

              </div>

              <div className="inventory-modal-actions">

                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={
                    closeStockModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    stockAction ===
                    "IN"
                      ? "stock-in-button"
                      : "stock-out-button"
                  }
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="inventory-spin"
                      />

                      Processing...
                    </>
                  ) : (
                    <>
                      {stockAction ===
                      "IN"
                        ? "Add Stock"
                        : "Remove Stock"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Inventory;