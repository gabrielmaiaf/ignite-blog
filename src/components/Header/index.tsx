import Link from 'next/link';

import styles from './header.module.scss';

const Header: React.FC = () => {
  return (
    <nav className={styles.container}>
      <Link href="/">
        <a className={styles.logo}>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </nav>
  );
};

export default Header;
