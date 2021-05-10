import React, { Component, useEffect, useState } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import uuidv1 from 'uuid/v1';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import './style.scss';
import Column from './components/Column/column';
import AddNewModal from './components/AddNewModal/addNewModal';
import Task from './components/Task/task';
import _ from 'lodash';

function App() {
  const [displayModal, setDisplayModal] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [editingTaskIndex, setEditingTaskIndex] = useState();
  const [editingTaskId, setEditingTaskId] = useState();
  const [disabled, setDisabled] = useState(true);
  const [columns, setColumns] = useState(
    _.cloneDeep([
      { id: 'td', title: 'TO DO', tasks: [] },
      { id: 'ip', title: 'IN PROGRESS', tasks: [] },
      { id: 'de', title: 'DONE', tasks: [] },
    ])
  );

  useEffect(() => {
    const columns = localStorage.getItem('columns');
    if (columns) {
      setColumns(_.cloneDeep(JSON.parse(columns)));
    }
  }, []);

  const handleToggleModal = (choosenColumn = '') => () => {
    setDisplayModal(!displayModal);
    setSelectedColumn(choosenColumn);
  };

  const handleChangeTaskContent = (e) => {
    setTaskContent(e.target.value);
    setDisabled(_.isEmpty(taskContent) ? true : false);
  };

  const handleChangeeditingColumnIndex = (editingColumnIndex) => () => setEditingColumnIndex(editingColumnIndex);

  const handleAddNewTask = () => {
    if (taskContent.trim() === '') {
      toastr.warning('Please enter your task', 'Notice', { timeOut: 2000 });
    } else {
      const newTask = _.cloneDeep({
        id: uuidv1(),
        content: taskContent,
        time: new Date().toLocaleString(),
      });
      const columnIndex = columns.findIndex((column) => _.get(column, 'id') === selectedColumn);
      columns[columnIndex].tasks.push(newTask);
      const updatedColumn = _.cloneDeep(columns);
      setDisplayModal(false);
      setSelectedColumn('');
      setTaskContent('');
      setColumns(_.cloneDeep(updatedColumn));
      localStorage.setItem('columns', JSON.stringify(updatedColumn));
    }
  };

  const handleDeleteTask = (columnIndex, taskIndex) => () => {
    columns[columnIndex].tasks.splice(taskIndex, 1);
    setColumns(_.cloneDeep(columns));
    localStorage.setItem('columns', JSON.stringify(_.cloneDeep(columns)));
    toastr.success('Delete task success', 'Notice', { timeOut: 2000 });
  };

  const handleChooseEditTask = (columnIndex, taskIndex, taskId) => () => {
    setEditingColumnIndex(columnIndex);
    setEditingTaskIndex(taskIndex);
    setEditingTaskId(taskId);
  };

  const handleChangeSelectedColumn = (selectedColumn) => () => {
    setSelectedColumn(selectedColumn);
  };

  const handleEdit = () => {
    columns[editingColumnIndex].tasks[editingTaskIndex].content = taskContent;
    setEditingColumnIndex('');
    setTaskContent('');
    setEditingTaskId(null);
    setEditingTaskIndex(null);
    setColumns(_.cloneDeep(columns));
    localStorage.setItem('columns', JSON.stringify(_.cloneDeep(columns)));
  };

  const handleCancelEdit = () => {
    setEditingColumnIndex('');
    setTaskContent('');
    setEditingTaskId(null);
    setEditingTaskIndex(null);
  };

  const handleSaveDrag = (result) => {
    const { source, destination, reason } = result;
    if (reason === 'DROP' && destination) {
      const sourceColumnIndex = columns.findIndex((column) => _.get(column, 'id') === source.droppableId);
      const task = _.get(columns, [sourceColumnIndex, 'tasks', source.index]);
      columns[sourceColumnIndex].tasks.splice(source.index, 1);
      let updatedColumn = _.cloneDeep(columns);
      const destinationColumnIndex = columns.findIndex((column) => _.get(column, 'id') === destination.droppableId);
      updatedColumn = _.update(updatedColumn, `updatedColumn[destinationColumnIndex].tasks`, () => updatedColumn[destinationColumnIndex].tasks.splice(destination.index, 0, task));
      setColumns(_.cloneDeep(updatedColumn));
      localStorage.setItem('columns', JSON.stringify(updatedColumn));
    }
  };

  return (
    <div className="App">
      <h1 className="App__title">TO DO LIST</h1>
      <DragDropContext onDragEnd={handleSaveDrag}>
        <div className="App__content">
          {columns.map((column, columnIndex) => (
            <Column key={_.get(column, 'id')} column={column} handleAddNewTask={handleToggleModal}>
              <Droppable droppableId={_.get(column, 'id')}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '300px' }}>
                    {_.get(column, 'tasks').map((task, taskIndex) => (
                      <Task
                        key={_.get(task, 'id')}
                        index={taskIndex}
                        isEditing={_.get(task, 'id') === editingTaskId}
                        handleChangeTaskContent={handleChangeTaskContent}
                        task={task}
                        handleEdit={handleEdit}
                        handleCancelEdit={handleCancelEdit}
                        handleChooseEditTask={handleChooseEditTask(columnIndex, taskIndex, _.get(task, 'id'))}
                        handleDeleteTask={handleDeleteTask(columnIndex, taskIndex)}
                      />
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Column>
          ))}
        </div>
      </DragDropContext>
      {displayModal && (
        <AddNewModal
          disabled={disabled || _.isEmpty(taskContent)}
          editingColumnIndex={editingColumnIndex}
          taskContent={taskContent}
          handleChangeTaskContent={handleChangeTaskContent}
          handleChangeeditingColumnIndex={handleChangeeditingColumnIndex}
          handleAddNewTask={handleAddNewTask}
          handleToggleModal={handleToggleModal}
          selectedColumn={selectedColumn}
          handleChangeSelectedColumn={handleChangeSelectedColumn}
        />
      )}
    </div>
  );
}

export default App;
