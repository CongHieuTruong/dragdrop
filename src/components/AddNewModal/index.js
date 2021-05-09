import React from "react";

import "./style.scss";

const AddNewModal = (props) => (
  <div className="AddNewModal">
    <div
      className="AddNewModal__backdrop"
      onClick={props.handleToggleModal}
    ></div>
    <div className="AddNewModal__content">
      <h4 className="AddNewModal__title">CREATE NEW TASK</h4>
      <div className="AddNewModal__task-status">
        <span className="AddNewModal__radio">
          <input
            type="radio"
            checked={props.selectedColumn === "td"}
            onChange={props.handleChangeSelectedColumn("td")}
          />
          <span>TODO</span>
        </span>
        <span className="AddNewModal__radio">
          <input
            type="radio"
            checked={props.selectedColumn === "ip"}
            onChange={props.handleChangeSelectedColumn("ip")}
          />
          <span>IN PROGRESS</span>
        </span>
        <span className="AddNewModal__radio">
          <input
            type="radio"
            checked={props.selectedColumn === "de"}
            onChange={props.handleChangeSelectedColumn("de")}
          />
          <span>DONE</span>
        </span>
      </div>
      <div className="AddNewModal__task">
        <input
          className="AddNewModal__input"
          type="text"
          placeholder="Enter your task..."
          value={props.taskContent}
          onChange={props.handleChangeTaskContent}
        />
      </div>
      <div className="AddNewModal__action">
        <button
          className="AddNewModal__btn AddNewModal__btn--confirm"
          onClick={props.handleAddNewTask}
        >
          Save
        </button>
        <button
          className="AddNewModal__btn AddNewModal__btn--cancel"
          onClick={props.handleToggleModal}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default AddNewModal;
