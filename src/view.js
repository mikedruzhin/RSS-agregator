import onChange from 'on-change';

const input = document.getElementById('url-input');
const alarm = document.querySelector('.feedback');

export default function (path, current) {
  alarm.textContent = current;
  switch (current) {
    case '': 
      //alarm.textContent = '';  
      input.value = '';
      input.focus();
      input.classList.remove('is-invalid');
      break;
      
    case 'Ссылка должна быть валидным URL':
      //alarm.textContent = 'Ссылка должна быть валидным URL';  
      input.classList.add('is-invalid');
      break;
    case 'RSS уже существует':
      input.classList.add('is-invalid');
      break;
      //alarm.textContent = 'RSS уже существует';
  }
}
