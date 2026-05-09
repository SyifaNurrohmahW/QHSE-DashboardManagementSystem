"use-client";
import styles from "@/app/login/login.module.css";

export default function SocialLoginButton({ onClick, label }) {
  return (
    <button type="button" className={styles.googleButton} onClick={onClick}>
      <span className={styles.googleIcon}>G</span>
      {label}
    </button>
  );
}