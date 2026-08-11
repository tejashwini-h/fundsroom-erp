import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const userString =
    localStorage.getItem("fundsroom_user");

  const user = userString
    ? JSON.parse(userString)
    : null;

  const handleLogout = () => {
    localStorage.removeItem(
      "fundsroom_token"
    );

    localStorage.removeItem(
      "fundsroom_user"
    );

    navigate("/login", {
      replace: true,
    });
  };

  const navigation = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: Users,
      roles: ["ADMIN", "SALES"],
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
      roles: ["ADMIN", "WAREHOUSE"],
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Warehouse,
      roles: ["ADMIN", "WAREHOUSE"],
    },
    {
      label: "Challans",
      path: "/challans",
      icon: FileText,
      roles: ["ADMIN", "SALES"],
    },
  ];

  const visibleNavigation =
    navigation.filter(
      (item) =>
        !item.roles ||
        item.roles.includes(user?.role)
    );

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            F
          </div>

          <div>
            <h1>Fundsroom</h1>
            <span>ERP System</span>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            MAIN MENU
          </div>

          {visibleNavigation.map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={({ isActive }) =>
                    `nav-link ${
                      isActive
                        ? "nav-link-active"
                        : ""
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>
                    {item.label}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="user-info">
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role || ""}
              </span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <div className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <span>
              Welcome back,
            </span>

            <strong>
              {user?.name || "User"}
            </strong>
          </div>

          <div className="topbar-role">
            {user?.role || ""}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;