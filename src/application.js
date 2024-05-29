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
      alarm: null,
    },
    feeds: [],
    posts: [],
    currentPost: [],
    links: [],
    loaded: null,
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
  const getData = (site) => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${site}`)
      .then(response => {
        const parsedData = parser(response.data.contents);
        const initial = parsedData.posts.map((item) => ({ id: _.uniqueId(), ...item }));
        state.posts = [...initial, ...state.posts]
        state.feeds = [...parsedData.feeds, ...state.feeds]
        return { response: response.status };
      })
  }
  const getUpdateData = (feeds) => {
    let newPromises = [];
    setTimeout(() => {
      newPromises = feeds.map((feed) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${feed}`).then((response) => {
        const newPosts = parser(response.data.contents).posts;
        const oldPosts = state.posts;
        const oldTitles = new Set(oldPosts.map((post) => post.title));
        const filteredPosts = newPosts.filter(({ title }) => !oldTitles.has(title));
        const newPostsWithId = filteredPosts.map((item) => ({ id: _.uniqueId(), ...item }));
        const updatedPosts = [...newPostsWithId, ...state.posts];
        watchedState.posts = updatedPosts;
        state.posts = updatedPosts;
      }));

      Promise.all(newPromises)
        .finally(() => getUpdateData(feeds));
    }, 5000);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    makeValidateScheme(state.links).validate(input.value)
      .then(() => {
        getData(input.value).then(() => {
          state.form.alarm = i18n.t('success');
          state.links.push(input.value);
          watchedState.loaded = true;
          watchedState.loaded = false;
        }).catch((error) => {
          if (error.isAxiosError) {
            watchedState.form.alarm = i18n.t('networkError');
          } else {
            watchedState.form.alarm = i18n.t('nonExistsValidRss');
          }
        });
      })

      .catch((error) => {
        const [currentError] = error.errors;
        watchedState.form.alarm = currentError;
        state.form.alarm = currentError;
      });
  });

  const action = (event) => {
    state.currentPost = event.target;
    watchedState.opened.push(event.target.dataset.id);
    state.opened.push(event.target.dataset.id);
  };
  posts.addEventListener('click', action);
  getUpdateData(state.links);
};
