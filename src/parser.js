import { uniqueId } from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/xml");

  const root = doc.querySelector('channel');
  const feedTitle = root.querySelector('title').textContent;
  const feedDescription = root.querySelector('description').textContent;
 
  const items = Array.from(root.querySelectorAll('item'));
  const newPosts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    return { /*id: uniqueId(), */title, description };
  })

  return { feeds: { title: feedTitle, description: feedDescription }, posts: newPosts  };

}
