import onChange from 'on-change';

const input = document.getElementById('url-input');
const alarm = document.querySelector('.feedback');
const feedsEl = document.querySelector('.feeds');
const postsEl = document.querySelector('.posts');
//<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">Lorem ipsum feed for an interval of 1 minutes with 10 item(s)</h3><p class="m-0 small text-black-50">This is a constantly updating lorem ipsum feed</p></li></ul>

export default function (i18n, state) {
  
  const renderFeeds = (data) => {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');

    data.forEach(({ title, description }) => {
      const el = document.createElement('li');
      const p = document.createElement('p');
      const head = document.createElement('h3');

      el.classList.add('list-group-item', 'border-0', 'border-end-0');
      p.classList.add('m-0', 'small', 'text-black-50');
      head.classList.add('h6', 'm-0');

      head.textContent = title;
      p.textContent = description;

      el.append(head, p);
      list.append(el);
    })
    return list;
  }

  const renderPosts = (data) => {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    data.forEach(({ id, title, description }) => {
      const el = document.createElement('li');
      const link = document.createElement('a');
      const button = document.createElement('button');

      el.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      link.classList.add('fw-bold');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

      link.setAttribute('data-id', id);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      button.setAttribute('data-id', id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');

      link.textContent = title;
      button.textContent = 'Просмотр';

      el.append(link, button);
      list.append(el);

    })
    return list;
  }

  const renderBlock = (title) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const head = document.createElement('h2');

    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    head.classList.add('card-title', 'h4');
    

    head.textContent = title;

    cardBody.append(head);
    card.append(cardBody);
    return card;
  }
  
  const watchedState = onChange(state, (path, current) => {
    //console.log(current);
    alarm.textContent = current;
    switch (current) {
      case '':  
        input.value = '';
        input.focus();
        input.classList.remove('is-invalid');
        
        feedsEl.append(renderBlock('Фиды'), renderFeeds(state.feeds));
        postsEl.append(renderBlock('Посты'), renderPosts(state.posts));
        
        break;
        
      case i18n.t('shoudBeValid'):  
        input.classList.add('is-invalid');
        break;
      case i18n.t('alreadyExists'):
        input.classList.add('is-invalid');
        break;
      case i18n.t('networkError'):
        input.classList.remove('is-invalid');
        break;
    }
  });

  return watchedState;
}
