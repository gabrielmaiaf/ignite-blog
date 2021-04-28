import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div>
          {postsPagination.results.map(post => (
            <section key={post.uid} className={styles.post}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar color="#bbbbbb" />
                  {post.first_publication_date}
                </time>
                <span>
                  <FiUser color="#bbbbbb" />
                  {post.data.author}
                </span>
              </div>
            </section>
          ))}
          {postsPagination.next_page !== null ? (
            <button type="button" className={styles.seeMore}>
              Carregar mais posts
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'PP',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          author: post.data.author,
          subtitle: post.data.subtitle,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
