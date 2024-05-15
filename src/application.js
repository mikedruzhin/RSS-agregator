import * as yup from 'yup';
import onChange from 'on-change';
import view from './view'

export default () => {
  const state = {
    form: {
      inputValue: '',
      valid: true,
      alarm: '',
    },
    feeds: []
  };

  const input = document.getElementById('url-input');
  const alarm = document.querySelector('.feedback');

  const submit = document.querySelector('[aria-label="add"]');
  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, view)/*function (path, current, previous) {
    console.log(this);
    alarm.textContent = state.form.alarm;
    if (current === true) {
      input.value = '';
      input.focus();
      input.classList.remove('is-invalid');
    } else {
      input.classList.add('is-invalid');
    }
  })*/

  const schema = yup.string().url();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;
    
    schema.isValid(state.form.inputValue).then((data) => {
      if (!data) {
        watchedState.form.alarm = 'Ссылка должна быть валидным URL';
        state.form.alarm = 'Ссылка должна быть валидным URL';
        state.form.valid = false;
      } else if (state.feeds.includes(state.form.inputValue)) {
        watchedState.form.alarm = 'RSS уже существует';
        state.form.alarm = 'RSS уже существует';
        state.form.valid = false;
      } else {
        watchedState.form.alarm = '';
        state.form.alarm = '';
        state.feeds.push(state.form.inputValue);
        state.form.valid = true;
        console.log('ok');
      }
    })
  })
}
