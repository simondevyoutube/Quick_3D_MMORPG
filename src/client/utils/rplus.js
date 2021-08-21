/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import htm from 'htm';
import css from 'csz';
import search from 'algolia';

const npm = search('OFCNCOG2CU', '86ebd6a34c7fbb7988d5ba5c75d5da34');
const html = htm.bind(React.createElement);
const react = {
  ...React,
  render: ReactDOM.render,
};

export { react, html, css, npm };
