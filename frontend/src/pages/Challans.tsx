import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";

import "./Challans.css";

type ChallanStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "CANCELLED";

interface Customer {
  id: number;
  name: string;
  mobile?: string;
  email?: string;
  businessName?: string | null;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  unitPrice: string | number;
  currentStock: number;
  minimumStock: number;
  warehouse?: string;
  lowStock?: boolean;
}

interface ChallanItem {
  id: number;
  challanId: number;
  productId: number;
  quantity: number;
  productName: string;
  sku: string;
  unitPrice: string | number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  totalQuantity: number;
  status: ChallanStatus;
  createdAt: string;
  updatedAt?: string;

  customer?: Customer;

  items?: ChallanItem[];

  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ChallansResponse {
  success: boolean;
  data: Challan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ChallanDetailResponse {
  success: boolean;
  data: Challan;
}

interface FormItem {
  productId: string;
  quantity: string;
}

const emptyItem: FormItem = {
  productId: "",
  quantity: "1",
};

function Challans() {
  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ChallanStatus>("ALL");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);

  const [formCustomerId, setFormCustomerId] =
    useState("");

  const [formItems, setFormItems] =
    useState<FormItem[]>([
      { ...emptyItem },
    ]);

  const [saving, setSaving] =
    useState(false);

  const [actionId, setActionId] =
    useState<number | null>(null);

  const limit = 10;

  /*
   * Load customers and products
   * for the create challan form.
   */
  const loadFormData = async () => {
    try {
      const [
        customersResponse,
        productsResponse,
      ] = await Promise.all([
        api.get<CustomersResponse>(
          "/customers?limit=100"
        ),

        api.get<ProductsResponse>(
          "/products?limit=100"
        ),
      ]);

      setCustomers(
        customersResponse.data.data || []
      );

      setProducts(
        productsResponse.data.data || []
      );
    } catch (err) {
      console.error(
        "Load challan form data error:",
        err
      );

      setError(
        "Unable to load customers and products."
      );
    }
  };

  /*
   * Load challans.
   */
  const loadChallans = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set(
        "page",
        String(page)
      );

      params.set(
        "limit",
        String(limit)
      );

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (statusFilter !== "ALL") {
        params.set(
          "status",
          statusFilter
        );
      }

      if (fromDate) {
        params.set(
          "from",
          fromDate
        );
      }

      if (toDate) {
        params.set(
          "to",
          toDate
        );
      }

      const response =
        await api.get<ChallansResponse>(
          `/challans?${params.toString()}`
        );

      setChallans(
        response.data.data || []
      );

      setTotal(
        response.data.pagination?.total || 0
      );

      setTotalPages(
        response.data.pagination?.totalPages || 1
      );
    } catch (err: any) {
      console.error(
        "Load challans error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load challans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    loadChallans();
  }, [
    page,
    search,
    statusFilter,
    fromDate,
    toDate,
  ]);

  /*
   * Open create modal.
   */
  const openCreateForm = async () => {
    setError("");

    if (
      customers.length === 0 ||
      products.length === 0
    ) {
      await loadFormData();
    }

    setFormCustomerId("");

    setFormItems([
      { ...emptyItem },
    ]);

    setShowForm(true);
  };

  /*
   * Add another product row.
   */
  const addItem = () => {
    setFormItems((previous) => [
      ...previous,
      { ...emptyItem },
    ]);
  };

  /*
   * Remove product row.
   */
  const removeItem = (
    index: number
  ) => {
    if (formItems.length === 1) {
      return;
    }

    setFormItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /*
   * Update product row.
   */
  const updateItem = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    setFormItems((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  /*
   * Create challan.
   *
   * Backend always creates it as DRAFT.
   */
  const handleCreate = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!formCustomerId) {
        setError(
          "Please select a customer."
        );
        return;
      }

      if (formItems.length === 0) {
        setError(
          "Add at least one product."
        );
        return;
      }

      const parsedItems =
        formItems.map((item) => ({
          productId: Number(
            item.productId
          ),
          quantity: Number(
            item.quantity
          ),
        }));

      for (const item of parsedItems) {
        if (
          !Number.isInteger(
            item.productId
          ) ||
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity <= 0
        ) {
          setError(
            "Every product must have a valid positive quantity."
          );
          return;
        }
      }

      /*
       * Prevent duplicate products
       * in the same challan.
       */
      const productIds =
        parsedItems.map(
          (item) => item.productId
        );

      const uniqueProductIds =
        new Set(productIds);

      if (
        uniqueProductIds.size !==
        productIds.length
      ) {
        setError(
          "The same product cannot be added more than once."
        );
        return;
      }

      await api.post(
        "/challans",
        {
          customerId:
            Number(formCustomerId),

          items: parsedItems,
        }
      );

      setShowForm(false);

      setFormCustomerId("");

      setFormItems([
        { ...emptyItem },
      ]);

      await loadChallans();
    } catch (err: any) {
      console.error(
        "Create challan error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create challan."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * View challan details.
   */
  const viewChallan = async (
    challan: Challan
  ) => {
    try {
      setError("");

      const response =
        await api.get<ChallanDetailResponse>(
          `/challans/${challan.id}`
        );

      setSelectedChallan(
        response.data.data
      );

      setShowDetails(true);
    } catch (err: any) {
      console.error(
        "View challan error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load challan details."
      );
    }
  };

  /*
   * Change status.
   *
   * CONFIRMED:
   * backend automatically checks stock,
   * deducts stock and creates movement.
   *
   * CANCELLED:
   * simply changes status.
   */
  const updateStatus = async (
    challan: Challan,
    status: "CONFIRMED" | "CANCELLED"
  ) => {
    const action =
      status === "CONFIRMED"
        ? "confirm"
        : "cancel";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${challan.challanNumber}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(challan.id);
      setError("");

      await api.patch(
        `/challans/${challan.id}/status`,
        {
          status,
        }
      );

      if (
        selectedChallan?.id ===
        challan.id
      ) {
        const response =
          await api.get<ChallanDetailResponse>(
            `/challans/${challan.id}`
          );

        setSelectedChallan(
          response.data.data
        );
      }

      await loadChallans();

      /*
       * Refresh products because confirming
       * a challan changes stock.
       */
      await loadFormData();
    } catch (err: any) {
      console.error(
        "Update challan status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          `Unable to ${action} challan.`
      );
    } finally {
      setActionId(null);
    }
  };

  /*
   * Reset filters.
   */
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  /*
   * Status helper.
   */
  const getStatusClass = (
    status: ChallanStatus
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";

      case "CANCELLED":
        return "cancelled";

      default:
        return "draft";
    }
  };

  const getStatusLabel = (
    status: ChallanStatus
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return "Draft";
    }
  };

  const getCustomerName = (
    customer?: Customer
  ) => {
    if (!customer) {
      return "Unknown customer";
    }

    return (
      customer.businessName ||
      customer.name
    );
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString(
      "en-IN"
    );
  };

  const formatPrice = (
    price: string | number
  ) => {
    return `₹${Number(
      price
    ).toLocaleString("en-IN")}`;
  };

  /*
   * Calculate total quantity
   * in create form.
   */
  const formTotalQuantity =
    formItems.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );

  return (
    <div className="challans-page">

      {/* Header */}

      <div className="challans-header">

        <div>
          <h1>Challans</h1>

          <p>
            Manage sales challans and
            customer orders
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          <Plus size={17} />
          Create Challan
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="challans-error">

          <div className="challans-error-content">
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

      {/* Main card */}

      <div className="challans-card">

        {/* Filters */}

        <div className="challans-filters">

          <div className="challan-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search challan or customer..."
              value={search}
              onChange={(event) => {
                setPage(1);

                setSearch(
                  event.target.value
                );
              }}
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);

              setStatusFilter(
                event.target
                  .value as
                  | "ALL"
                  | ChallanStatus
              );
            }}
          >
            <option value="ALL">
              All Status
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <input
            type="date"
            value={fromDate}
            title="From date"
            onChange={(event) => {
              setPage(1);
              setFromDate(
                event.target.value
              );
            }}
          />

          <input
            type="date"
            value={toDate}
            title="To date"
            onChange={(event) => {
              setPage(1);
              setToDate(
                event.target.value
              );
            }}
          />

          <button
            className="filter-reset"
            onClick={resetFilters}
          >
            Reset
          </button>

          <button
            className="refresh-button"
            onClick={loadChallans}
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
          <div className="challans-loading">

            <RefreshCw
              size={22}
              className="spin"
            />

            <span>
              Loading challans...
            </span>

          </div>
        ) : challans.length === 0 ? (

          /* Empty */

          <div className="challans-empty">

            <FileText size={38} />

            <h3>
              No challans found
            </h3>

            <p>
              Create your first sales
              challan to get started.
            </p>

            <button
              className="primary-button"
              onClick={
                openCreateForm
              }
            >
              <Plus size={16} />
              Create Challan
            </button>

          </div>

        ) : (

          /* Table */

          <>

            <div className="challans-table-wrapper">

              <table className="challans-table">

                <thead>

                  <tr>

                    <th>
                      Challan
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Items
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Date
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

                  {challans.map(
                    (challan) => (
                      <tr
                        key={
                          challan.id
                        }
                      >

                        <td>

                          <div className="challan-number">

                            <div className="challan-icon">
                              <FileText
                                size={16}
                              />
                            </div>

                            <div>

                              <strong>
                                {
                                  challan.challanNumber
                                }
                              </strong>

                              <span>
                                ID:{" "}
                                {
                                  challan.id
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <div className="customer-cell">

                            <strong>
                              {getCustomerName(
                                challan.customer
                              )}
                            </strong>

                            {challan.customer
                              ?.businessName &&
                              challan.customer
                                .name !==
                                challan.customer
                                  .businessName && (
                                <span>
                                  {
                                    challan.customer
                                      .name
                                  }
                                </span>
                              )}

                          </div>

                        </td>

                        <td>

                          <span className="items-badge">
                            {
                              challan.items
                                ?.length ||
                              0
                            }
                          </span>

                        </td>

                        <td>

                          <strong>
                            {
                              challan.totalQuantity
                            }
                          </strong>

                        </td>

                        <td>

                          <span className="date-text">
                            {formatDate(
                              challan.createdAt
                            )}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`challan-status ${getStatusClass(
                              challan.status
                            )}`}
                          >
                            {
                              getStatusLabel(
                                challan.status
                              )
                            }
                          </span>

                        </td>

                        <td>

                          <div className="row-actions">

                            <button
                              className="icon-button"
                              title="View"
                              onClick={() =>
                                viewChallan(
                                  challan
                                )
                              }
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {challan.status ===
                              "DRAFT" && (
                              <>
                                <button
                                  className="action-confirm"
                                  title="Confirm"
                                  disabled={
                                    actionId ===
                                    challan.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      challan,
                                      "CONFIRMED"
                                    )
                                  }
                                >
                                  {actionId ===
                                  challan.id ? (
                                    <RefreshCw
                                      size={15}
                                      className="spin"
                                    />
                                  ) : (
                                    <Check
                                      size={15}
                                    />
                                  )}
                                </button>

                                <button
                                  className="action-cancel"
                                  title="Cancel"
                                  disabled={
                                    actionId ===
                                    challan.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      challan,
                                      "CANCELLED"
                                    )
                                  }
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>
                              </>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Footer */}

            <div className="challans-footer">

              <span>
                Showing{" "}
                {challans.length} of{" "}
                {total} challans
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

      {/* Create Challan Modal */}

      {showForm && (
        <div className="modal-overlay">

          <div className="challan-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Create Challan
                </h2>

                <p>
                  Create a new sales
                  challan
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="challan-form"
              onSubmit={
                handleCreate
              }
            >

              {/* Customer */}

              <div className="form-field">

                <label>
                  Customer *
                </label>

                <select
                  required
                  value={
                    formCustomerId
                  }
                  onChange={(event) =>
                    setFormCustomerId(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {getCustomerName(
                          customer
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Products */}

              <div className="items-section">

                <div className="items-section-header">

                  <div>
                    <h3>
                      Products
                    </h3>

                    <span>
                      Add products and
                      quantities
                    </span>
                  </div>

                  <button
                    type="button"
                    className="add-item-button"
                    onClick={
                      addItem
                    }
                  >
                    <Plus size={15} />
                    Add Product
                  </button>

                </div>

                <div className="form-items">

                  {formItems.map(
                    (item, index) => (
                      <div
                        className="form-item-row"
                        key={index}
                      >

                        <div className="form-field product-select-field">

                          <label>
                            Product{" "}
                            {index + 1}
                          </label>

                          <select
                            required
                            value={
                              item.productId
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "productId",
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select product
                            </option>

                            {products.map(
                              (
                                product
                              ) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {
                                    product.name
                                  }{" "}
                                  —{" "}
                                  {
                                    product.sku
                                  }{" "}
                                  (Stock:{" "}
                                  {
                                    product.currentStock
                                  })
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div className="form-field quantity-field">

                          <label>
                            Quantity
                          </label>

                          <input
                            required
                            type="number"
                            min="1"
                            step="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                        </div>

                        <button
                          type="button"
                          className="remove-item-button"
                          title="Remove product"
                          disabled={
                            formItems.length ===
                            1
                          }
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>

                <div className="form-total">

                  <span>
                    Total Quantity
                  </span>

                  <strong>
                    {
                      formTotalQuantity
                    }{" "}
                    items
                  </strong>

                </div>

              </div>

              {/* Notice */}

              <div className="draft-notice">

                <AlertTriangle
                  size={17}
                />

                <span>
                  New challans are saved
                  as Draft. Stock will
                  only be deducted when
                  the challan is
                  confirmed.
                </span>

              </div>

              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText
                        size={16}
                      />
                      Create Challan
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* Details Modal */}

      {showDetails &&
        selectedChallan && (
          <div className="modal-overlay">

            <div className="challan-modal details-modal">

              <div className="modal-header">

                <div>
                  <h2>
                    Challan Details
                  </h2>

                  <p>
                    {
                      selectedChallan.challanNumber
                    }
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => {
                    setShowDetails(
                      false
                    );
                    setSelectedChallan(
                      null
                    );
                  }}
                >
                  <X size={19} />
                </button>

              </div>

              <div className="challan-details">

                {/* Header info */}

                <div className="detail-top">

                  <div>
                    <span>
                      CHALLAN NUMBER
                    </span>

                    <strong>
                      {
                        selectedChallan.challanNumber
                      }
                    </strong>
                  </div>

                  <span
                    className={`challan-status ${getStatusClass(
                      selectedChallan.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedChallan.status
                    )}
                  </span>

                </div>

                {/* Customer */}

                <div className="detail-section">

                  <h3>
                    Customer
                  </h3>

                  <div className="customer-detail">

                    <strong>
                      {getCustomerName(
                        selectedChallan.customer
                      )}
                    </strong>

                    {selectedChallan
                      .customer
                      ?.name && (
                      <span>
                        {
                          selectedChallan
                            .customer
                            .name
                        }
                      </span>
                    )}

                    {selectedChallan
                      .customer
                      ?.mobile && (
                      <span>
                        {
                          selectedChallan
                            .customer
                            .mobile
                        }
                      </span>
                    )}

                    {selectedChallan
                      .customer
                      ?.email && (
                      <span>
                        {
                          selectedChallan
                            .customer
                            .email
                        }
                      </span>
                    )}

                  </div>

                </div>

                {/* Products */}

                <div className="detail-section">

                  <div className="detail-section-heading">

                    <div>
                      <h3>
                        Products
                      </h3>

                      <span>
                        {
                          selectedChallan
                            .items
                            ?.length ||
                          0
                        }{" "}
                        product(s)
                      </span>
                    </div>

                    <strong>
                      Total:{" "}
                      {
                        selectedChallan.totalQuantity
                      }
                    </strong>

                  </div>

                  <div className="detail-items">

                    {selectedChallan.items?.map(
                      (item) => (
                        <div
                          className="detail-item"
                          key={item.id}
                        >

                          <div>
                            <strong>
                              {
                                item.productName
                              }
                            </strong>

                            <span>
                              SKU:{" "}
                              {
                                item.sku
                              }
                            </span>
                          </div>

                          <div>
                            <span>
                              Qty
                            </span>

                            <strong>
                              {
                                item.quantity
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Unit Price
                            </span>

                            <strong>
                              {formatPrice(
                                item.unitPrice
                              )}
                            </strong>
                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* Created info */}

                <div className="detail-info-grid">

                  <div>
                    <span>
                      Created
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedChallan.createdAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Created By
                    </span>

                    <strong>
                      {
                        selectedChallan
                          .user
                          ?.name ||
                        "Admin"
                      }
                    </strong>
                  </div>

                </div>

                {/* Actions */}

                {selectedChallan.status ===
                  "DRAFT" && (
                  <div className="detail-actions">

                    <button
                      className="cancel-challan-button"
                      disabled={
                        actionId ===
                        selectedChallan.id
                      }
                      onClick={() =>
                        updateStatus(
                          selectedChallan,
                          "CANCELLED"
                        )
                      }
                    >
                      <Trash2 size={16} />
                      Cancel Challan
                    </button>

                    <button
                      className="confirm-challan-button"
                      disabled={
                        actionId ===
                        selectedChallan.id
                      }
                      onClick={() =>
                        updateStatus(
                          selectedChallan,
                          "CONFIRMED"
                        )
                      }
                    >
                      {actionId ===
                      selectedChallan.id ? (
                        <RefreshCw
                          size={16}
                          className="spin"
                        />
                      ) : (
                        <Check size={16} />
                      )}

                      Confirm Challan
                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Challans;