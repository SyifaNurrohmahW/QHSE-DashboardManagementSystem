"use-client";
import styles from "@/app/login/login.module.css";

export default function LoginDivider({ text = "ATAU MASUK DENGAN" }) {
  return (
    <div className={styles.divider}>
      <span></span>
      <p>{text}</p>
      <span></span>
    </div>
  );
}