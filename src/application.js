import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import axios from 'axios';
import resources from './locales/index';

import watch from './view';
import parser from './parser';

export default async () => {
  const state = {
    form: {
      error: null,
      status: 'feeling',
    },
    feeds: [],
    posts: [],
    currentPost: [],
    opened: [],
  };

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('alreadyExists'),
    },
    string: {
      url: i18n.t('shoudBeValid'),
    },
  });

  const input = document.getElementById('url-input');
  const form = document.querySelector('.rss-form');
  const posts = document.querySelector('.posts');

  const watchedState = watch(i18n, state);

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
  };

  const createUrl = (rssFeed) => {
    const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    const proxiedUrl = `${proxy}${rssFeed}`;
    return proxiedUrl;
  };

  const errorHandler = (error) => {
    if (error.isAxiosError) {
      watchedState.form.error = i18n.t('networkError');
    } else {
      watchedState.form.error = i18n.t('nonExistsValidRss');
    }
  };

  const getData = (site) => axios.get(createUrl(site))
    .then((response) => {
      const parsedData = parser(response.data.contents);
      const feedsWithUrl = parsedData.feeds.map((feed) => ({ link: site, ...feed }));
      const initial = parsedData.posts.map((item) => ({ id: _.uniqueId(), ...item }));
      watchedState.posts = [...initial, ...state.posts];
      state.feeds = [...feedsWithUrl, ...state.feeds];
      return { response: response.status };
    });

  const getUpdateData = (interval = 5000) => {
    setTimeout(() => {
      const newPromises = state.feeds.map((feed) => axios.get(createUrl(feed.link))
        .then((response) => {
          const newPosts = parser(response.data.contents).posts;
          const oldTitles = new Set(state.posts.map((post) => post.title));
          const filteredPosts = newPosts.filter(({ title }) => !oldTitles.has(title));
          const newPostsWithId = filteredPosts.map((item) => ({ id: _.uniqueId(), ...item }));
          const updatedPosts = [...newPostsWithId, ...state.posts];
          watchedState.posts = updatedPosts;
        }).catch((error) => errorHandler(error)));

      Promise.all(newPromises)
        .finally(() => getUpdateData());
    }, interval);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const links = state.feeds.map(({ link }) => link);
    makeValidateScheme(links).validate(input.value)
      .then(() => {
        getData(input.value).then(() => {
          state.form.error = i18n.t('success');
          watchedState.status = 'loaded';
          watchedState.status = 'feeling';
        }).catch((error) => errorHandler(error));
      })

      .catch((error) => {
        const [currentError] = error.errors;
        watchedState.form.error = currentError;
        state.form.error = currentError;
      });
  });

  const action = (event) => {
    state.currentPost = event.target;
    watchedState.opened.push(event.target.dataset.id);
  };
  posts.addEventListener('click', action);
  getUpdateData();
};
