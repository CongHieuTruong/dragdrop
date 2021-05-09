import React, { Component } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import uuidv1 from 'uuid/v1';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import './style.scss';
import Column from './components/Column/';
import AddNewModal from './components/AddNewModal/';
import Task from './components/Task/';
import _ from 'lodash';

class App extends Component {
  state = {
    displayModal: false,
    editingColumnIndex: '',
    taskContent: '',
    editingTaskIndex: null,
    editedTaskId: null,
    columns: _.cloneDeep([
      { id: 'td', title: 'TO DO', tasks: [] },
      { id: 'ip', title: 'IN PROGRESS', tasks: [] },
      { id: 'de', title: 'DONE', tasks: [] },
    ]),
  };

  componentDidMount() {
    const columns = localStorage.getItem('columns');
    if (columns) {
      this.setState({ columns: _.cloneDeep(JSON.parse(columns)) });
    }
  }

  handleToggleModal = (choosenColumn = '') => () => {
    this.setState((prevState) => ({
      displayModal: !prevState.displayModal,
      editingColumnIndex: choosenColumn,
    }));
  };

  handleChangeTaskContent = (e) => this.setState({ taskContent: e.target.value });

  handleChangeeditingColumnIndex = (editingColumnIndex) => () => this.setState({ editingColumnIndex: editingColumnIndex });

  handleAddNewTask = () => {
    const { taskContent } = this.state;
    if (taskContent.trim() === '') {
      toastr.warning('Please enter your task', 'Notice', { timeOut: 2000 });
    } else {
      const { editingColumnIndex, columns } = this.state;
      const newTask = _.cloneDeep({
        id: uuidv1(),
        content: taskContent,
        time: new Date().toLocaleString(),
      });
      const columnIndex = columns.findIndex((column) => column.get('id') === editingColumnIndex);
      const updatedColumn = columns.updateIn([columnIndex, 'tasks'], (tasks) => tasks.push(newTask));
      this.setState(
        {
          displayModal: false,
          editingColumnIndex: '',
          taskContent: '',
          columns: _.cloneDeep(updatedColumn),
        },
        () => {
          localStorage.setItem('columns', JSON.stringify(updatedColumn.toJS()));
        }
      );
    }
  };

  handleDeleteTask = (columnIndex, taskIndex) => () => {
    const result = window.confirm('Are you sure to delete this task?');
    if (result) {
      const { columns } = this.state;
      const updatedColumn = columns.updateIn([columnIndex, 'tasks'], (tasks) => tasks.remove(taskIndex));
      this.setState({ columns: _.cloneDeep(updatedColumn) }, () => {
        localStorage.setItem('columns', JSON.stringify(updatedColumn.toJS()));
        toastr.success('Delete task success', 'Notice', { timeOut: 2000 });
      });
    }
  };

  handleChooseEditTask = (columnIndex, taskIndex, taskId) => () => {
    this.setState({
      editingColumnIndex: columnIndex,
      editingTaskIndex: taskIndex,
      editedTaskId: taskId,
    });
  };

  handleChangeSelectedColumn = (selectedColumn) => () => {
    this.setState({ selectedColumn: selectedColumn });
  };

  handleEdit = () => {
    const { columns, editingColumnIndex, taskContent, editingTaskIndex } = this.state;
    const updatedColumn = columns.updateIn([editingColumnIndex, 'tasks'], (tasks) => tasks.setIn([editingTaskIndex, 'content'], taskContent));
    this.setState(
      {
        editingColumnIndex: '',
        taskContent: '',
        editedTaskId: null,
        editingTaskIndex: null,
        columns: _.cloneDeep(updatedColumn),
      },
      () => {
        localStorage.setItem('columns', JSON.stringify(updatedColumn.toJS()));
      }
    );
  };

  handleCancelEdit = () => {
    this.setState({
      editingColumnIndex: '',
      taskContent: '',
      editedTaskId: null,
      editingTaskIndex: null,
    });
  };

  handleSaveDrag = (result) => {
    const { source, destination, reason } = result;
    if (reason === 'DROP' && destination) {
      const { columns } = this.state;
      const sourceColumnIndex = columns.findIndex((column) => column.get('id') === source.droppableId);
      const task = columns.getIn([sourceColumnIndex, 'tasks', source.index]);
      let updatedColumn = columns.updateIn([sourceColumnIndex, 'tasks'], (tasks) => tasks.remove(source.index));
      const destinationColumnIndex = columns.findIndex((column) => column.get('id') === destination.droppableId);
      updatedColumn = updatedColumn.updateIn([destinationColumnIndex, 'tasks'], (tasks) => tasks.insert(destination.index, task));
      this.setState(
        {
          columns: _.cloneDeep(updatedColumn),
        },
        () => {
          localStorage.setItem('columns', JSON.stringify(updatedColumn.toJS()));
        }
      );
    }
  };

  render() {
    const { columns, displayModal, editingColumnIndex, taskContent, editedTaskId } = this.state;

    return (
      <div className="App">
        <h1 className="App__title">TO DO LIST</h1>
        <DragDropContext onDragEnd={this.handleSaveDrag}>
          <div className="App__content">
            {columns.map((column, columnIndex) => (
              <Column key={_.get(column, 'id')} column={column} handleAddNewTask={this.handleToggleModal}>
                <Droppable droppableId={_.get(column, 'id')}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '300px' }}>
                      {_.get(column, 'tasks').map((task, taskIndex) => (
                        <Task
                          key={_.get(task, 'id')}
                          index={taskIndex}
                          isEditing={_.get(task, 'id') === editedTaskId}
                          handleChangeTaskContent={this.handleChangeTaskContent}
                          task={task}
                          handleEdit={this.handleEdit}
                          handleCancelEdit={this.handleCancelEdit}
                          handleChooseEditTask={this.handleChooseEditTask(columnIndex, taskIndex, _.get(task, 'id'))}
                          handleDeleteTask={this.handleDeleteTask(columnIndex, taskIndex)}
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
            editingColumnIndex={editingColumnIndex}
            taskContent={taskContent}
            handleChangeTaskContent={this.handleChangeTaskContent}
            handleChangeeditingColumnIndex={this.handleChangeeditingColumnIndex}
            handleAddNewTask={this.handleAddNewTask}
            handleToggleModal={this.handleToggleModal()}
            selectedColumn={this.state.selectedColumn}
            handleChangeSelectedColumn={this.handleChangeSelectedColumn}
          />
        )}
      </div>
    );
  }
}

export default App;
