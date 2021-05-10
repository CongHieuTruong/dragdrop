import _ from 'lodash';
import React from 'react';

import './style.scss';

const Column = ({ column, handleAddNewTask, children }) => (
  <div className="Column">
    <div className="Column__header">
      <h2 className="Column__title">
        <span className="Column__item-count">{_.get(column, 'tasks').size}</span>
        <span className="Column__text">{_.get(column, 'title')}</span>
      </h2>
      <p className="Column__btn" onClick={handleAddNewTask(_.get(column, 'id'))}>
        <i className="fas fa-plus"></i> New task
      </p>
    </div>
    <div className="Column__content">{children}</div>
  </div>
);

export default Column;
