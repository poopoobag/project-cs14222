import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Paper } from "@material-ui/core";
import "./styles/main.css";

// import necessary components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/UserDetail";
import UserList from "./components/userList/UserList";
import UserPhotos from "./components/userPhotos/UserPhotos";
import Activities from "./components/Activities/Activities";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import { MyContext } from "./context";
import axios from "axios";

class PhotoShare extends React.Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      setUser: (userObj) => {
        this.setState({ user: userObj });
      },
      fetched: false,
      setFetch: (bool) => {
        this.setState({ fetched: bool });
      },
      userList: null,
      setUserList: (list) => {
        this.setState({ userList: list });
      },
    };

    this.fetch();
  }

  fetch = () => {
    axios
      .get("/currentUser")
      .then((res) => {
        this.state.setUser(res.data);
        this.setState({ fetched: true });
      })
      .catch((e) => {
        console.log(e);
        this.setState({ fetched: true });
      });
  };

  redirect = () => {
    if (!this.state.fetched) return;
    if (this.state.user) {
      return;
    }
    console.log(this.state.user);
    return <Redirect to="/login" />;
  };

  render() {
    return (
      <HashRouter>
        <MyContext.Provider value={this.state}>
          {this.redirect()}
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <Route
                path="/:variant/:userId"
                children={(props) => <TopBar {...props} />}
              ></Route>
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                <Route path="/" children={(props) => <UserList {...props} />} />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  <Route
                    path="/users/:userId"
                    render={(props) => <UserDetail {...props} />}
                  />
                  <Route
                    path="/photos/:userId"
                    render={(props) => <UserPhotos {...props} />}
                  />
                  <Route
                    path="/login"
                    render={(props) => <LoginRegister {...props} />}
                  />
                  <Route
                    path="/activity"
                    render={(props) => <Activities {...props} />}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </MyContext.Provider>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
