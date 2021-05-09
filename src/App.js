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
      const columnIndex = columns.findIndex((column) => _.get(column, 'id') === editingColumnIndex);
      columns[columnIndex].tasks.push(newTask);
      const updatedColumn = _.cloneDeep(columns);
      this.setState(
        {
          displayModal: false,
          editingColumnIndex: '',
          taskContent: '',
          columns: _.cloneDeep(updatedColumn),
        },
        () => {
          localStorage.setItem('columns', JSON.stringify(updatedColumn));
        }
      );
    }
  };

  handleDeleteTask = (columnIndex, taskIndex) => () => {
    const result = window.confirm('Are you sure to delete this task?');
    if (result) {
      const { columns } = this.state;
      columns[columnIndex].tasks.splice(taskIndex, 1);
      this.setState({ columns: _.cloneDeep(columns) }, () => {
        localStorage.setItem('columns', JSON.stringify(_.cloneDeep(columns)));
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
    columns[editingColumnIndex].tasks[editingTaskIndex].content = taskContent;
    this.setState(
      {
        editingColumnIndex: '',
        taskContent: '',
        editedTaskId: null,
        editingTaskIndex: null,
        columns: _.cloneDeep(columns),
      },
      () => {
        localStorage.setItem('columns', JSON.stringify(_.cloneDeep(columns)));
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
      const sourceColumnIndex = columns.findIndex((column) => _.get(column, 'id') === source.droppableId);
      const task = _.get(columns, [sourceColumnIndex, 'tasks', source.index]);
      columns[sourceColumnIndex].tasks.splice(source.index, 1);
      let updatedColumn = _.cloneDeep(columns);
      const destinationColumnIndex = columns.findIndex((column) => _.get(column, 'id') === destination.droppableId);
      updatedColumn = _.update(updatedColumn, `updatedColumn[destinationColumnIndex].tasks`, () => updatedColumn[destinationColumnIndex].tasks.splice(destination.index, 0, task));
      this.setState(
        {
          columns: _.cloneDeep(updatedColumn),
        },
        () => {
          localStorage.setItem('columns', JSON.stringify(updatedColumn));
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
