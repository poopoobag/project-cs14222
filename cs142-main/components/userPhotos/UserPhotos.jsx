import React from "react";
import { Link } from "react-router-dom";
import { Grid, Typography, Button, TextField } from "@material-ui/core";
import "./userPhotos.css";
const axios = require("axios");
import { MyContext } from "../../context";
import MentionArea from "./MentionArea";
import { Result } from "express-validator";
import { forEachOf } from "async";
const { generateComment } = require("../../cs142comment");
/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  static contextType = MyContext;
  static isMounted = false;
  static fetching = false;
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      userId: null,
      setFetchRequired: () => {
        this.request();
      },
    };
  }

  fetch() {
    if (!this.state.userId) {
      this.request();
      return;
    }
    if (this.state.userId !== this.props.match.params.userId) {
      this.request();
    }
  }

  request = () => {
    if (this.fetching) {
      return;
    }
    axios
      .get(`/photosOfUser/${this.props.match.params.userId}`)
      .then((response) => {
        if (
          this._isMounted &&
          JSON.stringify(response.data) !== JSON.stringify(this.state.data)
        ) {
          this.setState({
            data: response.data,
            userId: this.props.match.params.userId,
          });
        }

        this.fetching = false;
      })
      .catch((err) => {
        console.error(err);
        if (this._isMounted) {
          this.setState({
            fetched: true,
          });
        }
      });
  };
  componentDidUpdate() {}

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  giveImages = (element) => {
    if (element.comments !== undefined) {
      const commentArr = Object.values(element.comments);
      return (
        <div>
          {commentArr.map((element, i) => {
            return (
              <div key={i}>
                <Link
                  style={{ color: "inherit", textDecoration: "inherit" }}
                  to={`/users/${element.user._id}`}
                >
                  <Typography variant="h4">{`${element.user.first_name} ${element.user.last_name}`}</Typography>
                </Link>
                <p>{element.date_time}</p>
                {generateComment(element.comment)}
              </div>
            );
          })}
        </div>
      );
    }
  };
  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.state.data === null) return <div></div>;

    var photosObj = this.state.data;

    const photos = Object.values(photosObj);

    return (
      <Grid container columns={{ sm: 2, md: 3 }}>
        {photos.map((element, index) => (
          <Grid
            style={{ maxHeight: 400, maxWidth: 300, overflow: "auto" }}
            item
            sm={12}
            md={4}
            key={index}
          >
            <img src={`images/${element.file_name}`} height="128"></img>
            <p>{element.date_time}</p>
            {this.giveImages(element)}
            <MentionArea
              fetch={this.state.setFetchRequired}
              data={this.context.userList}
              _id={element._id}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default UserPhotos;
