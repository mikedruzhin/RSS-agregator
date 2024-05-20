import onChange from 'on-change';

const input = document.getElementById('url-input');
const alarm = document.querySelector('.feedback');

export default function (i18n, state) {
  const watchedState = onChange(state, (path, current) => {
    alarm.textContent = current;
    switch (current) {
      case '':  
        input.value = '';
        input.focus();
        input.classList.remove('is-invalid');
        break;
        
      case i18n.t('shoudBeValid'):  
        input.classList.add('is-invalid');
        break;
      case i18n.t('alreadyExists'):
        input.classList.add('is-invalid');
        break;
    }
  });

  return watchedState;
}
