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
  Users,
  X,
} from "lucide-react";

import api from "../services/api";
import "./Customers.css";

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: "WHOLESALE" | "RETAIL";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomerForm {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: "WHOLESALE" | "RETAIL";
  address: string;
  status: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate: string;
  notes: string;
}

const emptyForm: CustomerForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "WHOLESALE",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [showForm, setShowForm] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [viewingCustomer, setViewingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] =
    useState<CustomerForm>({
      ...emptyForm,
    });

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<CustomersResponse>(
          `/customers?page=${page}&limit=10${
            search
              ? `&search=${encodeURIComponent(
                  search
                )}`
              : ""
          }`
        );

      setCustomers(
        response.data.data || []
      );

      setTotal(
        response.data.pagination?.total || 0
      );

      setTotalPages(
        response.data.pagination
          ?.totalPages || 1
      );
    } catch (err) {
      console.error(
        "Load customers error:",
        err
      );

      setError(
        "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, search]);

  const handleInputChange = (
    field: keyof CustomerForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingCustomer(null);
    setForm({
      ...emptyForm,
    });
    setShowForm(true);
  };

  const openEditForm = (
    customer: Customer
  ) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      businessName:
        customer.businessName,
      gstNumber: customer.gstNumber,
      customerType:
        customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate:
        customer.followUpDate
          ? customer.followUpDate.split(
              "T"
            )[0]
          : "",
      notes: customer.notes || "",
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

      const payload = {
        ...form,
        followUpDate:
          form.followUpDate || null,
        notes: form.notes || null,
      };

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          payload
        );
      } else {
        await api.post(
          "/customers",
          payload
        );
      }

      setShowForm(false);
      setEditingCustomer(null);

      setForm({
        ...emptyForm,
      });

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Save customer error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    customer: Customer
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${customer.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(customer.id);
      setError("");

      await api.delete(
        `/customers/${customer.id}`
      );

      await loadCustomers();
    } catch (err: any) {
      console.error(
        "Delete customer error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete customer."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getCustomerTypeLabel = (
    type: Customer["customerType"]
  ) => {
    return type === "WHOLESALE"
      ? "Wholesale"
      : "Retail";
  };

  const getStatusClass = (
    status: Customer["status"]
  ) => {
    switch (status) {
      case "LEAD":
        return "lead";

      case "ACTIVE":
        return "active";

      case "INACTIVE":
        return "inactive";

      default:
        return "";
    }
  };

  const getStatusLabel = (
    status: Customer["status"]
  ) => {
    switch (status) {
      case "LEAD":
        return "Lead";

      case "ACTIVE":
        return "Active";

      case "INACTIVE":
        return "Inactive";

      default:
        return status;
    }
  };

  return (
    <div className="customers-page">

      {/* Header */}

      <div className="customers-header">
        <div>
          <h1>Customers</h1>

          <p>
            Manage your customer
            relationships
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          <Plus size={17} />
          Add Customer
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="customers-error">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Customers Card */}

      <div className="customers-card">

        {/* Toolbar */}

        <div className="customers-toolbar">

          <div className="search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search customers..."
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
            onClick={loadCustomers}
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
          <div className="customers-loading">
            <RefreshCw
              size={22}
              className="spin"
            />

            <span>
              Loading customers...
            </span>
          </div>
        ) : customers.length === 0 ? (

          /* Empty */

          <div className="customers-empty">
            <Users size={35} />

            <h3>
              No customers found
            </h3>

            <p>
              Add your first customer
              to get started.
            </p>

            <button
              className="primary-button"
              onClick={openCreateForm}
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>

        ) : (

          /* Table */

          <>
            <div className="table-wrapper">

              <table className="customers-table">

                <thead>
                  <tr>
                    <th>
                      Customer
                    </th>

                    <th>
                      Business
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Mobile
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

                  {customers.map(
                    (customer) => (
                      <tr
                        key={
                          customer.id
                        }
                      >

                        {/* Customer */}

                        <td>
                          <div className="customer-name">

                            <div className="customer-avatar">
                              {customer.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <span>
                                {
                                  customer.email ||
                                  "—"
                                }
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* Business */}

                        <td>
                          <span className="business-name">
                            {
                              customer.businessName ||
                              "—"
                            }
                          </span>
                        </td>

                        {/* Type */}

                        <td>
                          <span className="type-badge">
                            {getCustomerTypeLabel(
                              customer.customerType
                            )}
                          </span>
                        </td>

                        {/* Mobile */}

                        <td>
                          <span className="mobile-number">
                            {
                              customer.mobile
                            }
                          </span>
                        </td>

                        {/* Status */}

                        <td>
                          <span
                            className={`customer-status ${getStatusClass(
                              customer.status
                            )}`}
                          >
                            {getStatusLabel(
                              customer.status
                            )}
                          </span>
                        </td>

                        {/* Actions */}

                        <td>
                          <div className="row-actions">

                            <button
                              className="icon-button"
                              title="View"
                              onClick={() =>
                                setViewingCustomer(
                                  customer
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
                                  customer
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
                                customer.id
                              }
                              onClick={() =>
                                handleDelete(
                                  customer
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
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

            <div className="customers-footer">

              <span>
                Showing{" "}
                {customers.length} of{" "}
                {total} customers
              </span>

              <div className="pagination">

                <button
                  disabled={page <= 1}
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
                    page >= totalPages
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

          <div className="customer-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  {editingCustomer
                    ? "Update customer information"
                    : "Enter customer information"}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="customer-form"
            >

              <div className="form-grid">

                {/* Name */}

                <div className="form-field">
                  <label>
                    Name *
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
                    placeholder="Customer name"
                  />
                </div>

                {/* Mobile */}

                <div className="form-field">
                  <label>
                    Mobile *
                  </label>

                  <input
                    required
                    value={form.mobile}
                    onChange={(event) =>
                      handleInputChange(
                        "mobile",
                        event.target.value
                      )
                    }
                    placeholder="9876543210"
                  />
                </div>

                {/* Email */}

                <div className="form-field">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleInputChange(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="customer@example.com"
                  />
                </div>

                {/* Business */}

                <div className="form-field">
                  <label>
                    Business Name *
                  </label>

                  <input
                    required
                    value={
                      form.businessName
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "businessName",
                        event.target.value
                      )
                    }
                    placeholder="Business name"
                  />
                </div>

                {/* GST */}

                <div className="form-field">
                  <label>
                    GST Number
                  </label>

                  <input
                    value={
                      form.gstNumber
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "gstNumber",
                        event.target.value
                      )
                    }
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>

                {/* Customer Type */}

                <div className="form-field">
                  <label>
                    Customer Type *
                  </label>

                  <select
                    value={
                      form.customerType
                    }
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          customerType:
                            event.target
                              .value as
                              | "WHOLESALE"
                              | "RETAIL",
                        })
                      )
                    }
                  >
                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="RETAIL">
                      Retail
                    </option>
                  </select>
                </div>

                {/* Status */}

                <div className="form-field">
                  <label>
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          status:
                            event.target
                              .value as
                              | "LEAD"
                              | "ACTIVE"
                              | "INACTIVE",
                        })
                      )
                    }
                  >
                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* Follow-up */}

                <div className="form-field">
                  <label>
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.followUpDate
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "followUpDate",
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>

              {/* Address */}

              <div className="form-field">
                <label>
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    handleInputChange(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Customer address"
                  rows={3}
                />
              </div>

              {/* Notes */}

              <div className="form-field">
                <label>
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    handleInputChange(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              {/* Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
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
                      {editingCustomer
                        ? "Update Customer"
                        : "Create Customer"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* View Customer Modal */}

      {viewingCustomer && (
        <div className="modal-overlay">

          <div className="customer-modal view-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Customer Details
                </h2>

                <p>
                  Complete customer
                  information
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setViewingCustomer(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="customer-details">

              <div className="detail-header">

                <div className="large-avatar">
                  {viewingCustomer.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {
                      viewingCustomer.name
                    }
                  </h3>

                  <span>
                    {
                      viewingCustomer.businessName
                    }
                  </span>
                </div>

              </div>

              <div className="details-grid">

                <div>
                  <span>
                    Mobile
                  </span>

                  <strong>
                    {
                      viewingCustomer.mobile
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {
                      viewingCustomer.email ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    GST Number
                  </span>

                  <strong>
                    {
                      viewingCustomer.gstNumber ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Customer Type
                  </span>

                  <strong>
                    {getCustomerTypeLabel(
                      viewingCustomer.customerType
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {getStatusLabel(
                      viewingCustomer.status
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Follow-up Date
                  </span>

                  <strong>
                    {viewingCustomer.followUpDate
                      ? new Date(
                          viewingCustomer.followUpDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>

              </div>

              <div className="detail-section">
                <span>
                  Address
                </span>

                <p>
                  {
                    viewingCustomer.address ||
                    "—"
                  }
                </p>
              </div>

              <div className="detail-section">
                <span>
                  Notes
                </span>

                <p>
                  {
                    viewingCustomer.notes ||
                    "—"
                  }
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Customers;