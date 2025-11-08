"use client";

import React, { Component } from "react";

import styles from "./ErrorBoundary.module.scss";
import Button from "../button/Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <section>
          <div className={styles.container}>
            <h2 className={styles.heading}>{t("errorTitle")}</h2>
            <p className={styles.message}>
              {this.state.error?.message || t("errorMessage")}
            </p>
            <Button className={styles.button} onClick={this.resetError}>
              {t("tryAgain")}
            </Button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
