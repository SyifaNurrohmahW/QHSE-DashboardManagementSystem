"use-client";
import styles from "@/app/login/login.module.css";

export default function LoginWelcomeSection() {
  return (
    <section className={styles.leftPanel}>
      <div className={styles.leftOverlay}></div>

      <div className={styles.leftContent}>
        <span className={styles.badge}>SELAMAT DATANG KEMBALI</span>

        <h1 className={styles.title}>
          Akses Kendali
          <br />
          Dalam Genggaman.
        </h1>

        <p className={styles.description}>
          Masuk untuk melanjutkan aktivitas pemantauan, pelaporan, dan
          pengelolaan data QHSE Anda dengan lebih mudah, aman, dan terstruktur.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>Incident & Hazard Monitoring</div>
          <div className={styles.featureItem}>Manpower & Manhours Tracking</div>
          <div className={styles.featureItem}>Role-based Access Control</div>
        </div>
      </div>
    </section>
  );
}