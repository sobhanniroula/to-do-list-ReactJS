import React, { Component } from 'react';
import './App.css';
import axios from 'axios';


export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      id: 0,
      message: null,
      intervalIsSet: false,
      idToDelete: null,
      idToUpdate: null,
      objectToDelete: null
    };

  }


  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ 
        intervalIsSet: interval
      });
    }
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // fetching data from database
  getDataFromDb = () => {
    fetch('http://localhost:3001/api/getData')
      .then((data) => data.json())
      .then((res) => this.setState({ data: res.data }));
  };

  // creating new query into database
  putDataToDB = (message) => {
    let currentIds = this.state.data.map((data) => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }
    axios.post('http://localhost:3001/api/putData', {
      id: idToBeAdded,
      message: message,
    });
  };

  // removing existing database information
  deleteFromDB = (idTodelete) => {
    parseInt(idTodelete);
    let objIdToDelete = null;
    this.state.data.forEach((dat) => {
      if (dat.id == idTodelete) {
        objIdToDelete = dat._id;
      }
    });
    axios.delete('http://localhost:3001/api/deleteData', {
      data: {
        id: objIdToDelete,
      },
    });
  };

  // overwriting existing database information
  updateDB = (idToUpdate, updateToApply) => {
    let objIdToUpdate = null;
    parseInt(idToUpdate);
    this.state.data.forEach((dat) => {
      if (dat.id == idToUpdate) {
        objIdToUpdate = dat._id;
      }
    });
    axios.post('http://localhost:3001/api/updateData', {
      id: objIdToUpdate,
      update: { message: updateToApply },
    });
  };
  

  render() {
    const { data } = this.state;

    return (
      <div className="container">
        <ul className="list-title">
          {data.length <= 0 ? 'THE LIST IS EMPTY!!' : data.map((dat) => (
            <li style={{padding: 10}} key={data.message}>
              <span style={{color: 'gray'}}>id: </span> {data.id} <br />
              <span style={{color: 'red'}}> data: </span> {dat.message}
            </li>
          ))}
        </ul>

        <div style={{padding: 10}}>
            <input type="text" style={{width: 200}}
              onChange={(e) => this.setState({
                message: e.target.value
              })}
              placeholder="Add something.." />
            <button onClick={() => this.putDataToDB(this.state.message)}>
              ADD
            </button>
        </div>
          
        <div style={{padding: 10}}>
            <input type="text" style={{width: 200}}
              onChange={(e) => this.setState({
                idToDelete: e.target.value
              })}
              placeholder="put id of item to delete here" />
            <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
              DELETE
            </button>
        </div>

        <div style={{padding: 10}}>
        <input
            type="text"
            style={{ width: '200px' }}
            onChange={(e) => this.setState({ idToUpdate: e.target.value })}
            placeholder="id of item to update here"
          /> <br />
          <input
            type="text"
            style={{ width: '200px', marginTop: 5 }}
            onChange={(e) => this.setState({ updateToApply: e.target.value })}
            placeholder="put new value of the item here"
          /> 
          <button
            onClick={() =>
              this.updateDB(this.state.idToUpdate, this.state.updateToApply)
            }
          >
            UPDATE
          </button>
        </div>

      </div>
        
    );
  }
}
