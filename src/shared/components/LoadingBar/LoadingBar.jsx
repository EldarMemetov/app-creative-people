import styles from './LoadingBar.module.scss';

const LoadingBar = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingBar}></div>
    </div>
  );
};

export default LoadingBar;
