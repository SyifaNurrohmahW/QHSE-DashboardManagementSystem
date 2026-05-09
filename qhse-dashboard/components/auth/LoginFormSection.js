"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/login/login.module.css";
import {
  getCurrentSession,
  loginWithEmail,
  getCurrentUserRole,
  resetPassword,
} from "@/lib/services/authService";

export default function LoginFormSection() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function redirectLoggedInUser() {
      try {
        const session = await getCurrentSession();

        if (session) {
          router.replace("/dashboard");
        }
      } catch {
        // Stay on the login page if the session check cannot complete.
      }
    }

    redirectLoggedInUser();
  }, [router]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await loginWithEmail(form.email, form.password);

      const role = await getCurrentUserRole();

      if (role === "superadmin") {
        router.replace("/dashboard");
        return;
      }

      if (role === "admin") {
        router.replace("/dashboard");
        return;
      }

      if (role === "viewer") {
        router.replace("/dashboard");
        return;
      }

      setErrorMessage("Role user tidak dikenali. Hubungi superadmin.");
    } catch (error) {
      setErrorMessage(error.message || "Login gagal. Cek email dan password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!form.email) {
      setErrorMessage("Masukkan email terlebih dahulu untuk reset password.");
      return;
    }

    try {
      await resetPassword(form.email);
      setSuccessMessage("Link reset password berhasil dikirim ke email.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Gagal mengirim reset password.");
    }
  }

  return (
    <section className={styles.rightPanel}>
      <div className={styles.formBox}>
        <h2 className={styles.formTitle}>Log In</h2>

        <p className={styles.formSubtitle}>
          Masuk menggunakan akun yang sudah terdaftar.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.passwordLabelRow}>
              <label>Password</label>

              <button
                type="button"
                className={styles.forgotLink}
                onClick={handleForgotPassword}
              >
                Lupa Password?
              </button>
            </div>

            <div className={styles.passwordInputWrap}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className={styles.showBtn}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorBox}>{errorMessage}</div>
          )}

          {successMessage && (
            <div className={styles.successBox}>{successMessage}</div>
          )}

          <button className={styles.loginButton} type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk Sekarang"}
          </button>
        </form>

       
      </div>
    </section>
  );
}
