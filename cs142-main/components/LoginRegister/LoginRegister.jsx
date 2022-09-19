import React from "react";
import { TextField, CssBaseline, Button, Box } from "@material-ui/core";
import { useFormik } from "formik";
import { MyContext } from "../../context";
import { Redirect, Switch, Route } from "react-router";
import { useContext, useState } from "react";
import Register from "../Register/Register";
import axios from "axios";
import "./LoginRegister.css";
const LoginRegister = () => {
  const Context = useContext(MyContext);

  const [loginMessage, setLoginMessage] = useState("");

  // Pass the useFormik() hook initial form values and a submit function that will
  // be called when the form is submitted
  const formik = useFormik({
    initialValues: {
      username: "",
      login_password: "",
    },
    onSubmit: (values) => {
      axios
        .post("/admin/login", {
          login_name: values.login_name,
          password: values.login_password,
        })
        .then((res) => {
          Context.setUser(res.data);
        })
        .catch((e) => {
          setLoginMessage("Username or Password is incorrect");
          console.error(e);
        });
    },
  });
  const redirect = () => {
    if (Context.user) {
      return <Redirect to={`/users/${Context.user._id}`} />;
    }
  };

  return (
    <div className="outer">
      {redirect()}

      <form className="mainContainer" onSubmit={formik.handleSubmit}>
        <TextField
          margin="normal"
          required
          id="login_name"
          label="Username"
          name="login_name"
          autoComplete="name"
          value={formik.values.email}
          onChange={formik.handleChange}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          name="login_password"
          label="Password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
          id="login_password"
          autoComplete="current-password"
        />
        <Box m="1rem">
          <Button type="submit" variant="contained" style={{ width: 200 }}>
            Sign In
          </Button>
        </Box>
        <div>{loginMessage}</div>
      </form>
      <Register />
    </div>
  );
};

export default LoginRegister;
