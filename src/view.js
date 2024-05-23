import onChange from 'on-change';

const input = document.getElementById('url-input');
const alarm = document.querySelector('.feedback');
const feedsEl = document.querySelector('.feeds');
const postsEl = document.querySelector('.posts');
const feedback = document.querySelector('.feedback');

export default function (i18n, state) {
  
  const renderFeeds = (data) => {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');

    const el = document.createElement('li');
    const p = document.createElement('p');
    const head = document.createElement('h3');

    el.classList.add('list-group-item', 'border-0', 'border-end-0');
    p.classList.add('m-0', 'small', 'text-black-50');
    head.classList.add('h6', 'm-0');

    head.textContent = data.title;
    p.textContent = data.description;

    el.append(head, p);
    list.append(el);
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

      button.setAttribute('type', 'button');
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
  
  const renderModal = () => {
    const modal = document.createElement('div');
    const dialog = document.createElement('div');
    const content = document.createElement('div');
    const header = document.createElement('div');
    const body = document.createElement('div');
    const footer = document.createElement('div');

    dialog.classList.add('modal-dialog');
    content.classList.add('modal-content');
    header.classList.add('modal-header');
    body.classList.add('modal-body', 'text-break');
    footer.classList.add('modal-footer');

    modal.classList.add('modal', 'fade', 'show');
    modal.setAttribute('id', 'modal');
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('arialabelledby', 'modal');
    modal.setAttribute('style', 'display: block');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');

    content.append(header, body, footer);
    dialog.append(content);
    modal.append(dialog);
    return modal;
  }
  const watchedState = onChange(state, (path, current) => {
    
    console.log(path);
    switch (path) {
      case 'form.alarm':
        input.classList.add('is-invalid');
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        alarm.textContent = current;
        break;
      case 'posts': 
        feedsEl.textContent = '';
        postsEl.textContent = '';
        feedsEl.append(renderBlock('Фиды'), renderFeeds(state.feeds));
        postsEl.append(renderBlock('Посты'), renderPosts(state.posts));
        break;
      case 'loaded':
        alarm.textContent = i18n.t('success');
        input.value = '';
        input.focus();
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        input.classList.remove('is-invalid');
        feedsEl.textContent = '';
        postsEl.textContent = '';
        feedsEl.append(renderBlock('Фиды'), renderFeeds(state.feeds));
        postsEl.append(renderBlock('Посты'), renderPosts(state.posts));
        break;
      case 'networkError':
        input.classList.remove('is-invalid');  
        alarm.textContent = current;
        break;
    }
    const buttons = document.querySelectorAll('button.btn-outline-primary');
    //console.log(buttons)
    const res = Array.from(buttons);

    res.forEach((item) => {
      console.log(item)
      item.addEventListener('click', () => {
        document.body.append(renderModal());
        //renderModal();
      })
    })
      
  });

  return watchedState;
}
