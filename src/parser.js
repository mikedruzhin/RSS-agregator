export default (data) => {
  const parser = new DOMParser();
  const rssContent = parser.parseFromString(data, 'text/xml');
  const parseError = rssContent.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.message = 'invalidRSS';
    error.isParsingError = true;
    throw error;
  }

  const root = rssContent.querySelector('channel');
  const feedTitle = root.querySelector('title').textContent;
  const feedDescription = root.querySelector('description').textContent;
  const items = Array.from(root.querySelectorAll('item'));
  const newPosts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    return { title, description };
  });

  return { feeds: [{ title: feedTitle, description: feedDescription }], posts: newPosts };
};
