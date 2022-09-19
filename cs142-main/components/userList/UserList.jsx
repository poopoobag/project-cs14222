import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { MyContext } from "../../context";
import "./userList.css";
const axios = require("axios");

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  static contextType = MyContext;
  static fetching = false;
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      user: "",
      fetched: false,
    };
  }

  fetch = () => {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    axios
      .get("/user/list")
      .then((response) => {
        this.setState({
          data: response.data,
        });

        this.fetching = false;

        var userNames = [];

        response.data.forEach((e) => {
          var temp = {
            display: e.last_name,
            id: e._id,
          };
          userNames.push(temp);
        });
        this.context.setUserList(userNames);
      })
      .catch((err) => {
        console.error(err);
        this.fetching = false;
      });
  };

  componentDidMount() {
    this.fetch();
  }
  componentDidUpdate() {
    if (!this.state.data) {
      console.log("fetchin");
      this.fetch();
    }
  }

  giveList = () => {
    return (
      <List component="nav">
        {this.state.data.map((element, index) => {
          var id = `/users/${element._id}`;
          var fullName = `${element.first_name} ${element.last_name}`;
          return (
            <Link to={id} key={index}>
              <ListItem>
                <ListItemText primary={fullName} />
              </ListItem>
              <Divider />
            </Link>
          );
        })}
      </List>
    );
  };

  render() {
    return (
      <div>
        <Typography variant="body1">User:</Typography>
        {this.state.data ? this.giveList() : null}
      </div>
    );
  }
}

export default UserList;
