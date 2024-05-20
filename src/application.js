import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watch from './view'

export default async () => {
  const state = {
    form: {
      inputValue: '',
      valid: true,
      alarm: '',
    },
    links: []
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;
    makeValidateScheme(state.links).validate(state.form.inputValue)
    .then(() => {
      watchedState.form.alarm = '';
      state.links.push(state.form.inputValue);
      state.form.valid = true;
    }).catch((e) => {
      watchedState.form.alarm = e.errors[0]
      state.form.valid = false;
    })
  })
}
