import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import _ from 'lodash';
import watch from './view'
import axios, { AxiosError } from 'axios';
import parser from './parser';
import { uniqueId } from 'lodash';

export default async () => {
  const state = {
    form: {
      inputValue: '',
      valid: true,
      alarm: null,
    },
    feeds: {},
    posts: [],
    //currentPost: [],
    links: [],
    networkError: null,
    loaded: null,
    opened: [],
    buffer: [],
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
      //console.log(response.status);
      const parsedData = parser(response.data.contents);
      //console.log(parsedData.posts)
      if (state.buffer.length === 0) {
        state.buffer = [...state.buffer, ...parsedData.posts];
        const initial = state.buffer.map((item) => {
          return {id: uniqueId(), ...item }
        })
        return {feeds: parsedData.feeds, posts: initial};
      }
      const newPosts = state.buffer.reduce((acc, post) => {
        const filtered = parsedData.posts.filter((item) => !_.isEqual(post, item));
        if (acc.length === 0) {
          acc = _.unionWith(filtered, acc, _.isEqual);
        }
        acc = _.intersectionWith(filtered, acc, _.isEqual)//[...acc, ...filtered];
        return acc;
      }, [])
      //console.log('Новые элементы')
      //console.log(newPosts)
      if (_.intersectionWith(newPosts, state.buffer, _.isEqual).length === 0) {
        state.buffer = [...state.buffer, ...newPosts];
        
      }
      const newNew = newPosts.map((item) => {
        return {id: uniqueId(), ...item }
      })
      /*console.log('beffore')
      console.log(state.posts)*/
      const updatedPosts = _.unionWith(newNew, state.posts, _.isEqual);

      console.log('Обновленный список')
      console.log(updatedPosts)
      watchedState.posts = updatedPosts;
      watchedState.feeds = parsedData.feeds;
      state.feeds = parsedData.feeds;
      
      state.posts = updatedPosts;
      const buttons = document.querySelectorAll('button.btn-outline-primary');
      
      const res = Array.from(buttons);
        res.forEach((item) => {
          
          item.addEventListener('click', () => {
            state.form.alarm = 'hi'
            const btnId = item.getAttribute('data-id');
            console.log(btnId)
            const modalData = state.posts.filter((item) => item.id === btnId);
            //console.log(modalData)
            state.opened.push(btnId);
            watchedState.currentPost = modalData;
            state.currentPost = modalData;
            //watchedState.opened.push(btnId);
            
            //console.log(state.opened)
            
          })
        })
      //console.log(state.posts);
      return {feeds: parsedData.feeds, posts: state.posts};
    })
    .catch(() => {
      watchedState.networkError = i18n.t('networkError');
    })
  }

  const updateData = (interval = 5000) => {
    setTimeout(getData, interval);
    setTimeout(updateData, interval);
    
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.inputValue = input.value;
    
    makeValidateScheme(state.links).validate(state.form.inputValue)
    .then(() => {
      getData().then((data) => {
        state.posts = data.posts;
        state.feeds = data.feeds;
        watchedState.loaded = true;
        //watchedState.form.alarm = i18n.t('success');
        state.form.alarm = i18n.t('success');
        state.links.push(state.form.inputValue);
        state.form.valid = true;
        const buttons = document.querySelectorAll('button.btn-outline-primary');
      
        const res = Array.from(buttons);
          res.forEach((item) => {
            item.addEventListener('click', () => {
              const btnId = item.getAttribute('data-id');
              //console.log(btnId)
              const modalData = state.posts.filter((item) => item.id === btnId);
              state.opened.push(btnId);
              watchedState.currentPost = modalData;
              state.currentPost = modalData;
            })
          })
        })
    })
    .then(() => updateData())
    .catch((e) => {
      watchedState.form.alarm = e.errors[0];
      state.form.alarm = e.errors[0];
      state.form.valid = false;
    })
  })
}
