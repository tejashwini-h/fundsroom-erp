import { useState } from "react";
import type { FormEvent } from "react"; 
import {
  Lock,
  Mail,
  LogIn,
} from "lucide-react";

import api from "../services/api";
import type {
  LoginResponse,
} from "../types";

import "./Login.css";

function Login() {
  const [email, setEmail] =
    useState("admin@fundsroom.com");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await api.post<LoginResponse>(
          "/auth/login",
          {
            email,
            password,
          }
        );

      if (
        !response.data.success ||
        !response.data.data
      ) {
        setError(
          response.data.message ||
            "Login failed"
        );
        return;
      }

      const {
        token,
        user,
      } = response.data.data;

      localStorage.setItem(
        "fundsroom_token",
        token
      );

      localStorage.setItem(
        "fundsroom_user",
        JSON.stringify(user)
      );

      window.location.href = "/";
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            F
          </div>

          <div>
            <h1>
              Fundsroom
            </h1>

            <p>
              ERP Management System
            </p>
          </div>
        </div>

        <div className="login-heading">
          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue
            to your dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div className="form-group">
            <label>
              Email
            </label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Password
            </label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <LogIn size={18} />

            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <div className="login-footer">
          Fundsroom ERP
        </div>
      </div>
    </div>
  );
}

export default Login;