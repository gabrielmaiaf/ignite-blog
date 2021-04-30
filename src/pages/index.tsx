import { useState } from 'react';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
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
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const handleNextPage = (): void => {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        setPosts(state => [...state, ...data.results]);
        setNextPage(data.next_page);
      });
  };

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <div>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar color="#bbbbbb" />
                    {format(new Date(post.first_publication_date), 'PP', {
                      locale: ptBR,
                    })}
                  </time>
                  <span>
                    <FiUser color="#bbbbbb" />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage !== null ? (
            <button
              type="button"
              className={styles.seeMore}
              onClick={handleNextPage}
            >
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
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 10,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
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
