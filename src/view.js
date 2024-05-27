/* eslint-disable no-undef */
import onChange from 'on-change';

const input = document.getElementById('url-input');
const alarm = document.querySelector('.feedback');
const feedsEl = document.querySelector('.feeds');
const postsEl = document.querySelector('.posts');
const feedback = document.querySelector('.feedback');
const modalTitle = document.querySelector('.modal-title');
const modalDescription = document.querySelector('.modal-body');

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
  };

  const renderPosts = (data, openedLinks) => {
    const list = document.createElement('ul');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    data.forEach(({ id, title }) => {
      const el = document.createElement('li');
      const link = document.createElement('a');
      const button = document.createElement('button');

      el.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      link.classList.add(openedLinks.includes(id) ? 'fw-normal' : 'fw-bold');
      button.setAttribute('type', 'button');
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
    });
    return list;
  };

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
  };
  const watchedState = onChange(state, (path, current) => {
    switch (path) {
      case 'form.alarm':
        if (current === i18n.t('networkError')) {
          input.classList.remove('is-invalid');
        } else {
          input.classList.add('is-invalid');
        }
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        alarm.textContent = current;
        break;
      case 'posts':
        postsEl.textContent = '';
        postsEl.append(renderBlock('Посты'), renderPosts(state.posts, state.opened));
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
        postsEl.append(renderBlock('Посты'), renderPosts(state.posts, state.opened));
        break;
      case 'openModal':
        const [{ title, description }] = current;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        state.opened.map((item) => {
          const ref = document.querySelector(`a[data-id='${item}']`);
          ref.classList.remove('fw-bold');
          ref.classList.add('fw-normal');
        });
        break;
      default:
        throw new Error('Unexpected error');
    }
  });

  return watchedState;
}
