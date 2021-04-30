import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import PrismicDOM from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const PostPage: NextPage<PostProps> = ({ post }) => {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <main>
        <div className={commonStyles.container}>
          <Header />
        </div>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
          className={styles.banner}
        />
        <div className={`${commonStyles.container} ${styles.postContainer}`}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoContainer}>
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
            <span>
              <FiClock color="#bbbbbb" />4 min
            </span>
          </div>
          <div className={styles.contentWrapper}>
            {post.data.content.map(blog => (
              <div key={blog.heading} className={styles.blockContainer}>
                <h2>{blog.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(blog.body),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default PostPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );
  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  let { slug } = context.params;
  // eslint-disable-next-line prefer-destructuring
  if (Array.isArray(slug)) slug = slug[0];

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
