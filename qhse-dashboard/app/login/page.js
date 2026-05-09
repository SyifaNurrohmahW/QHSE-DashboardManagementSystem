"use client";

import styles from "./login.module.css";
import LoginWelcomeSection from "@/components/auth/LoginWelcomeSection";
import LoginFormSection from "@/components/auth/LoginFormSection";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <LoginWelcomeSection />
          <LoginFormSection />
        </div>
      </div>
    </main>
  );
}
