/* eslint-disable no-eval */
const UNPKG = 'https://unpkg.com/';

const fileNameRegEx = /\/[^\/@]+[\.][^\/]+$/;

// Hack to get ESM into webworker as 21/Nov/2019 ESM is not supported by webworkers
const getParseUrl = () =>
  fetch('/utils/parseUrl.js')
    .then(x => x.text())
    .then(x =>
      x.replace(/\s*export {[^}]+\};/g, '').replace(/^const\s[^=]+=/, '')
    );

// Handles paths like "../../some-file.js"
const handleDoubleDot = (pathEnd, base) => {
  const howFarBack = -1 * pathEnd.match(/\.\.\//g).length;
  const strippedPathEnd = pathEnd.replace(/\.\./g, '').replace(/\/+/g, '/');
  const strippedBase = base
    .split('/')
    .slice(0, howFarBack)
    .join('/');
  return strippedBase + strippedPathEnd;
};

// Handles cases like Svelte, where - on runpkg - the index url doesn't have a file ext
const getCurrentdir = currentPath =>
  currentPath.match(fileNameRegEx)
    ? currentPath.replace(fileNameRegEx, '')
    : currentPath.replace(/\/[^\/]+$/, '');

// Makes an unpkg path for the supplied file
const makePath = url => x => {
  const base = getCurrentdir(url);
  if (x.startsWith('./')) return base + x.replace('./', '/');
  if (x.startsWith('../')) return handleDoubleDot(x, base);
  if (x.startsWith('https://')) return x;
  return UNPKG + x;
};

const isExternalPath = str => !str.startsWith('.');
const isLocalFile = str => !isExternalPath(str);
const isListedInDependencies = (pkgName, pkgJson) =>
  ['dependencies', 'devDependencies', 'peerDependencies'].find(depType => {
    const matcher = self.parseUrl(pkgName);
    return Object.keys(pkgJson[depType] || {}).includes(matcher.name);
  });

const stripComments = str =>
  str.replace(/^[\t ]*\/\*(.|\r|\n)*?\*\/|^[\t ]*\/\/.*/gm, '');

const importExportRegex = /(from|import)[ \n]?['"](.*?)['"];?/;
const requireRegex = /(require\(['"])([^)\n\r]*)(['"]\))/;

const packageJsonUrl = (name, version) => {
  return `${UNPKG}${name}@${version}/package.json`;
};

const directoriesUrl = (name, version) => {
  return `${UNPKG}${name}@${version}/?meta`;
};

const flatten = arr =>
  arr.reduce(
    (acc, cur) => [...acc, ...(cur.files ? flatten(cur.files) : [cur.path])],
    []
  );

const extractDependencies = (input, packageJson) => {
  const code = stripComments(input).slice(0, 100000);
  const imports = (code.match(new RegExp(importExportRegex, 'gm')) || []).map(
    x => x.match(new RegExp(importExportRegex))[2]
  );
  const requires = (code.match(new RegExp(requireRegex, 'gm')) || []).map(
    x => x.match(new RegExp(requireRegex))[2]
  );
  return [...new Set([...imports, ...requires])].filter(
    x =>
      isLocalFile(x) ||
      isListedInDependencies(x, packageJson) ||
      x.startsWith('https://')
  );
};

const needsExtension = entry =>
  !entry
    .split('/')
    .pop()
    .includes('.');

const visitedPaths = new Set();

/** Parses the dependency tree for the package
 * if recursive it does it recursively
 * if not recursive, it does one level of the dependency tree
 * it then dispatches the result back to runpkg
 */

const setupParseUrl = async () => {
  self.parseUrl = eval(await getParseUrl());
};

const parseDependencies = async path => {
  if (!visitedPaths.has(path)) {
    visitedPaths.add(path);
    const { url, code } = await fetch(path).then(async res => ({
      url: res.url,
      code: await res.text(),
    }));
    const { name, version } = self.parseUrl(url);
    const dir = await fetch(directoriesUrl(name, version)).then(res =>
      res.json()
    );
    const pkg = await fetch(packageJsonUrl(name, version)).then(res =>
      res.json()
    );
    const files = flatten(dir.files);
    const ext = url
      .split('/')
      .pop()
      .match(/\.(.*)/);
    const dependencies = extractDependencies(code, pkg).reduce((all, entry) => {
      const packageUrl = `${UNPKG}${pkg.name}@${pkg.version}`;
      let match = makePath(url)(entry);
      if (isExternalPath(entry)) {
        if (entry.startsWith('https://')) match = entry;
        else {
          const version_ = pkg[isListedInDependencies(entry, pkg)][entry];
          match = version_ ? `${match}@${version_}` : match;
        }
      }
      if (isLocalFile(entry) && needsExtension(entry)) {
        const options = files.filter(x =>
          x.match(new RegExp(`${match.replace(packageUrl, '')}(/index)?\\..*`))
        );
        match =
          packageUrl +
          (options
            .sort((a, b) => a.length - b.length || a.localeCompare(b))
            .find(x => x.endsWith(ext[0])) || options[0]);
      }
      return { ...all, [entry]: match };
    }, {});
    self.postMessage({
      url,
      code,
      dependencies,
      size: code.length,
      extension: ext ? ext[1] : '',
    });
  }
};

self.onmessage = async event => {
  const { data } = event;
  await setupParseUrl();
  try {
    await parseDependencies(data);
  } catch (e) {
    // This is a truly awful hack to get around random CORS errors
    parseDependencies(data);
  }
};
