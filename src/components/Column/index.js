import React from "react";

import "./style.scss";

const Column = ({ column, handleAddNewTask, children }) => (
  <div className="Column">
    <div className="Column__header">
      <h2 className="Column__title">
        <span className="Column__item-count">{column.get("tasks").size}</span>
        <span className="Column__text">{column.get("title")}</span>
      </h2>
      <p className="Column__btn" onClick={handleAddNewTask(column.get("id"))}>
        <i className="fas fa-plus"></i> New task
      </p>
    </div>
    <div className="Column__content">{children}</div>
  </div>
);

export default Column;
