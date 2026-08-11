import { useEffect, useState } from "react";
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  RefreshCw,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import api from "../services/api";
import "./Dashboard.css";

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  lowStock: boolean;
  unitPrice: string;
}

interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  totalQuantity: number;
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "CANCELLED";
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    businessName?: string | null;
  };
}

interface CustomersResponse {
  success: boolean;
  data: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

function Dashboard() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customerTotal, setCustomerTotal] =
    useState(0);

  const [productTotal, setProductTotal] =
    useState(0);

  const [challanTotal, setChallanTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        customersResponse,
        productsResponse,
        challansResponse,
      ] = await Promise.all([
        api.get<CustomersResponse>(
          "/customers?limit=100"
        ),

        api.get<ProductsResponse>(
          "/products?limit=100"
        ),

        api.get<ChallansResponse>(
          "/challans?limit=5"
        ),
      ]);

      const customerData =
        customersResponse.data;

      const productData =
        productsResponse.data;

      const challanData =
        challansResponse.data;

      setProducts(
        productData.data || []
      );

      setChallans(
        challanData.data || []
      );

      setCustomerTotal(
        customerData.pagination?.total || 0
      );

      setProductTotal(
        productData.pagination?.total || 0
      );

      setChallanTotal(
        challanData.pagination?.total || 0
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const lowStockProducts =
    products.filter(
      (product) => product.lowStock
    );

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

  const getStatusClass = (
    status: Challan["status"]
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "status-confirmed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "status-draft";
    }
  };

  const getStatusLabel = (
    status: Challan["status"]
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw
            size={22}
            className="loading-icon"
          />

          <span>
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Page Header */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your Fundsroom ERP
            system
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="dashboard-error">
          <AlertTriangle size={18} />

          <span>{error}</span>

          <button
            onClick={loadDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={21} />
          </div>

          <div className="stat-content">
            <span>
              Total Customers
            </span>

            <strong>
              {customerTotal}
            </strong>

            <small>
              Customer records
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Package size={21} />
          </div>

          <div className="stat-content">
            <span>
              Total Products
            </span>

            <strong>
              {productTotal}
            </strong>

            <small>
              Products in inventory
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle
              size={21}
            />
          </div>

          <div className="stat-content">
            <span>
              Low Stock
            </span>

            <strong>
              {lowStockProducts.length}
            </strong>

            <small>
              Products need attention
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={21} />
          </div>

          <div className="stat-content">
            <span>
              Total Challans
            </span>

            <strong>
              {challanTotal}
            </strong>

            <small>
              Sales challans
            </small>
          </div>
        </div>

      </div>

      {/* Main Dashboard Grid */}

      <div className="dashboard-grid">

        {/* Recent Challans */}

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>
                Recent Challans
              </h2>

              <p>
                Latest sales challans
              </p>
            </div>

            <button
              className="view-button"
              onClick={() =>
                window.location.href =
                  "/challans"
              }
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          {challans.length === 0 ? (
            <div className="empty-state">
              <FileText size={30} />

              <p>
                No challans found
              </p>
            </div>
          ) : (
            <div className="challan-list">

              {challans.map(
                (challan) => (
                  <div
                    className="challan-row"
                    key={challan.id}
                  >

                    <div className="challan-main">

                      <strong>
                        {
                          challan.challanNumber
                        }
                      </strong>

                      <span>
                        {
                          challan.customer
                            ?.businessName ||
                          challan.customer
                            ?.name ||
                          "Customer"
                        }
                      </span>

                    </div>

                    <div className="challan-quantity">
                      <strong>
                        {
                          challan.totalQuantity
                        }
                      </strong>

                      <span>
                        items
                      </span>
                    </div>

                    <div className="challan-date">
                      <Clock size={14} />

                      <span>
                        {formatDate(
                          challan.createdAt
                        )}
                      </span>
                    </div>

                    <span
                      className={`status-badge ${getStatusClass(
                        challan.status
                      )}`}
                    >
                      {getStatusLabel(
                        challan.status
                      )}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* Low Stock */}

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>
                Low Stock
              </h2>

              <p>
                Products requiring attention
              </p>
            </div>

            <button
              className="view-button"
              onClick={() =>
                window.location.href =
                  "/inventory"
              }
            >
              View inventory
              <ArrowUpRight size={15} />
            </button>
          </div>

          {lowStockProducts.length ===
          0 ? (
            <div className="empty-state success">
              <Package size={30} />

              <p>
                All products are
                sufficiently stocked.
              </p>
            </div>
          ) : (
            <div className="low-stock-list">

              {lowStockProducts.map(
                (product) => (
                  <div
                    className="low-stock-row"
                    key={product.id}
                  >

                    <div className="product-info">

                      <div className="product-icon">
                        <Package
                          size={17}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          SKU:{" "}
                          {product.sku}
                        </span>
                      </div>

                    </div>

                    <div className="stock-info">

                      <strong>
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

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>

      {/* System Summary */}

      <section className="dashboard-card summary-card">

        <div className="card-header">
          <div>
            <h2>
              Inventory Summary
            </h2>

            <p>
              Current product stock status
            </p>
          </div>
        </div>

        <div className="summary-grid">

          <div className="summary-item">
            <span>
              Products in stock
            </span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.currentStock >
                    product.minimumStock
                ).length
              }
            </strong>
          </div>

          <div className="summary-item">
            <span>
              At minimum level
            </span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.currentStock ===
                    product.minimumStock
                ).length
              }
            </strong>
          </div>

          <div className="summary-item warning-summary">
            <span>
              Below minimum
            </span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.currentStock <
                    product.minimumStock
                ).length
              }
            </strong>
          </div>

          <div className="summary-item">
            <span>
              Total stock units
            </span>

            <strong>
              {products.reduce(
                (total, product) =>
                  total +
                  product.currentStock,
                0
              )}
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;