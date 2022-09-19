import React from "react";
import { Link } from "react-router-dom";
import { Typography, Grid, Button } from "@material-ui/core";
import "./userDetail.css";
const axios = require("axios");
import { MyContext } from "../../context";
const { generateComment } = require("../../cs142comment");
/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  static contextType = MyContext;
  static _isMounted = false;
  static fetching = false;

  constructor(props) {
    super(props);
    var _isMounted = false;

    this.state = {
      data: null,
    };
  }

  fetch = () => {
    if (!this.state._id) {
      this.request();
      return;
    }
    if (this.state.data._id !== this.props.match.userId) {
      this.request();
    }
  };

  request = () => {
    if (this.fetching) {
      return;
    }
    this.fetching = true;
    axios
      .get(`/user/${this.props.match.params.userId}`)
      .then((response) => {
        if (
          this._isMounted === true &&
          JSON.stringify(this.state.data) !== JSON.stringify(response.data)
        ) {
          this.setState({ data: response.data });
        }
        this.fetching = false;
      })
      .catch((err) => {
        console.error(err);
        this.fetching = false;
      });
  };
  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentDidUpdate() {
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  giveMentions = () => {
    if (!this.state.data.photos || this.state.data.photos.length === 0) {
      return <div>No mentions</div>;
    }

    console.log(this.state.data.photos);

    return this.state.data.photos.map((element, index) => {
      return (
        <div key={index}>
          <img src={`images/${element.file_name}`} height="100"></img>
          <div className="comment">
            {element.comments.map((elementComment, index) => {
              return (
                <div key={index}>{generateComment(elementComment.comment)}</div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  givePhotos = (element) => {};
  render() {
    if (this.state.data === null) return <div></div>;

    var user = this.state.data.user;
    return (
      <div className="main">
        <div>
          <Typography variant="h3">
            {`${user.first_name} ${user.last_name}`}
          </Typography>
          <Grid
            container
            direction="column"
            justifycontent="center"
            spacing={2}
            columns={16}
          >
            <Grid item={true} xs={2} sm={4} md={4} key="1">
              <p>{user.location}</p>
            </Grid>
            <Grid item={true} xs={2} sm={4} md={4} key="2">
              <p>{user.description}</p>
            </Grid>
            <Grid item={true} xs={2} sm={4} md={4} key="3">
              <p>{user.occupation}</p>
            </Grid>
            <Grid item={true} xs={2} sm={4} md={4} key="4">
              <Button>
                <Link
                  to={`/photos/${user._id}`}
                  style={{ color: "inherit", textDecoration: "inherit" }}
                >
                  See Photos
                </Link>
              </Button>
            </Grid>
          </Grid>
        </div>
        <div>
          <Typography variant="h3">Mentions: </Typography>
          <div>{this.giveMentions()}</div>
        </div>
      </div>
    );
  }
}

export default UserDetail;
