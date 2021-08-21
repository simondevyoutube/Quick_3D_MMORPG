const parseUrl = (url = window.location.search.slice(1).replace(/\/$/, '')) => {
  const parts = url
    .trim()
    .replace('https://unpkg.com', '')
    .split('/')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts[0]) {
    // checks if scoped packaged
    if (parts[0].startsWith('@')) {
      const nameVersion = parts[1].split('@');
      return {
        name: `${parts[0]}/${nameVersion[0]}` || null,
        version: nameVersion[1] || null,
        path: parts.join('/') || null,
        file: (parts.length > 2 && parts.slice(parts.length - 1)[0]) || null,
        directory: parts.slice(2, parts.length - 1).join('/') || null,
      };
    } else {
      const nameVersion = parts[0].split('@');
      return {
        name: nameVersion[0] || null,
        version: nameVersion[1] || null,
        path: parts.join('/') || null,
        file: (parts.length > 1 && parts.slice(parts.length - 1)[0]) || null,
        directory: parts.slice(1, parts.length - 1).join('/') || null,
      };
    }
  } else {
    return {
      name: null,
      version: null,
      path: null,
      file: null,
      directory: null,
    };
  }
};

export { parseUrl };
