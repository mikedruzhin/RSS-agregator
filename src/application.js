import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import { uniqueId } from 'lodash';
import watch from './view'
import axios from 'axios';

export default async () => {
  const state = {
    form: {
      inputValue: '',
      valid: true,
      alarm: null,
    },
    feeds: [],
    posts: [],
    links: [],
    request: null,
  };

  yup.setLocale({
    mixed: {
      notOneOf: 'RSS уже существует',
    },
    string: {
      url: 'Ссылка должна быть валидным URL',
    },
  });

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const input = document.getElementById('url-input');
  const form = document.querySelector('.rss-form');

  const watchedState = watch(i18n, state);

  const makeValidateScheme = (links) => {
    const schema = yup.string().notOneOf(links).url();
    return schema;
  }

  const getData = () => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=https://lorem-rss.herokuapp.com/feed`)
      .then(response => {
        state.request = response.status;
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data.contents, "text/xml");
        const root = doc.querySelector('channel');

        const feedTitle = root.querySelector('title').textContent;
        const feedDescription = root.querySelector('description').textContent;
        state.feeds = [{ title: feedTitle, description: feedDescription }]; 

        const items = Array.from(root.querySelectorAll('item'));
        const newPosts = items.map((item) => {
          const title = item.querySelector('title').textContent;
          const description = item.querySelector('description').textContent;
          return { id: uniqueId(), title, description };
        })
        state.posts = newPosts;
        return response.status;

      }).then((requestStatus) => requestStatus)
      .catch(() => {
        watchedState.form.alarm = i18n.t('networkError');
      })
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;
    makeValidateScheme(state.links).validate(state.form.inputValue)
    .then(() => {
      getData().then((ok) => {
        if (ok === 200) {
          watchedState.form.alarm = '';
          watchedState.form.alarm = null;
          state.links.push(state.form.inputValue);
          state.form.valid = true;
        }
      });
      
    }).catch((e) => {
      watchedState.form.alarm = e.errors[0];
      state.form.valid = false;
    })
  })
}
