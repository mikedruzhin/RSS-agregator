import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watch from './view'

export default async () => {
  const state = {
    form: {
      inputValue: '',
      valid: true,
      //error: '',
    },
    feeds: ['https://lorem-rss.hexlet.app/feed']
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

  const schema = yup.string().notOneOf(state.feeds).url();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;
    console.log(state.feeds);
    schema.validate(state.form.inputValue)
    .then(() => {
      watchedState.form.alarm = '';
      state.feeds.push(state.form.inputValue);
      console.log(state.feeds);
      state.form.valid = true;
    }).catch((e) => {
      console.log(e.errors[0])
      watchedState.form.alarm = e.errors[0]
      state.form.valid = false;
    })
  })
}
