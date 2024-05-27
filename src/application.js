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
      inputValue: '',
      valid: true,
      alarm: null,
    },
    feeds: {},
    posts: [],
    currentPost: [],
    modalOpen: null,
    links: [],
    loaded: null,
    opened: [],
    buffer: [],
    resources: ['https://lorem-rss.hexlet.app/feed'],
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

  const watchedState = watch(i18n, state);

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
  };

  const getData = () => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=https://lorem-rss.herokuapp.com/feed`)
      .then(response => {
        if (response.status === 200) {
          const parsedData = parser(response.data.contents);
          if (state.buffer.length === 0) {
            state.buffer = [...state.buffer, ...parsedData.posts];
            const initial = state.buffer.map((item) => ({ id: _.uniqueId(), ...item }));
            return { response: response.status, feeds: parsedData.feeds, posts: initial };
          }
          const newPosts = state.buffer.reduce((acc, post) => {
            const filtered = parsedData.posts.filter((item) => !_.isEqual(post, item));
            if (acc.length === 0) {
              acc = _.unionWith(filtered, acc, _.isEqual);
            }
            acc = _.intersectionWith(filtered, acc, _.isEqual);
            return acc;
          }, []);
          if (_.intersectionWith(newPosts, state.buffer, _.isEqual).length === 0) {
            state.buffer = [...state.buffer, ...newPosts];
          }
          const newNew = newPosts.map((item) => ({id: _.uniqueId(), ...item }))
          const updatedPosts = _.unionWith(newNew, state.posts, _.isEqual);

          watchedState.posts = updatedPosts;

          state.posts = updatedPosts;
          const list = document.querySelector('.list-group');
          const action = (e) => {
            const btnId = e.target.getAttribute('data-id');
            const modalData = state.posts.filter((item) => item.id === btnId);
            state.opened.push(btnId);
            state.currentPost = modalData;
            watchedState.openModal = true;
            watchedState.openModal = false;
          };
          list.addEventListener('click', action);
          return { response: response.status, feeds: parsedData.feeds, posts: state.posts };
        }
      })
      .catch(() => {
        watchedState.form.alarm = i18n.t('networkError');
        return { response: 404 }
      });
  };

  const updateData = (interval = 5000) => {
    setTimeout(getData, interval);
    setTimeout(updateData, interval);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;

    makeValidateScheme(state.links).validate(state.form.inputValue)
      .then(() => {
        if (!state.resources.includes(state.form.inputValue)) {
          watchedState.form.alarm = i18n.t('nonExistsValidRss');
        }
        getData().then((data) => {
          if (data.response === 200) {
            state.posts = data.posts;
            state.feeds = data.feeds;
            state.form.alarm = i18n.t('success');
            watchedState.loaded = true;

            state.links.push(state.form.inputValue);
            state.form.valid = true;
            const list = document.querySelector('.list-group');
            const action = (err) => {
              const btnId = err.target.getAttribute('data-id');
              const modalData = state.posts.filter((item) => item.id === btnId);
              state.opened.push(btnId);
              state.currentPost = modalData;
              watchedState.openModal = true;
              watchedState.openModal = false;
            };
            list.addEventListener('click', action);
          } else {
            watchedState.form.alarm = i18n.t('networkError');
          }
        });
      })
      .then(() => updateData())
      .catch((error) => {
        watchedState.form.alarm = error.errors[0];
        state.form.alarm = e.errors[0];
        state.form.valid = false;
      });
  });
};
