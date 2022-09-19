import React from "react";
import { useFormik } from "formik";
import { TextField } from "@material-ui/core";
import { Button, Box } from "@material-ui/core";
import { useState } from "react";
import axios from "axios";

var fieldNames = {};
fieldNames.password = "Password";
fieldNames.first_name = "First_name";
fieldNames.last_name = "Last name";
fieldNames.location = "Location";
fieldNames.description = "Description";
fieldNames.occupation = "Occupation";

import "../LoginRegister/LoginRegister.css";
const Register = () => {
  var [registerMessage, setRegisterMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      password: "",
      password_second: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",
    },
    onSubmit: (values) => {
      var errors = "";

      if (values.password.length < 1) {
        errors = errors.concat("First password field is required\n");
      }
      if (values.password_second.length < 1) {
        errors = errors.concat("Second password field is required\n");
      }
      if (values.first_name.length < 1) {
        errors = errors.concat("First name field is required\n");
      }
      if (values.last_name.length < 1) {
        errors = errors.concat("Last name field is required\n");
      }
      if (values.location.length < 1) {
        errors = errors.concat("Location field is required\n");
      }
      if (values.description.length < 1) {
        errors = errors.concat("Description field is required\n");
      }
      if (values.occupation.length < 1) {
        errors = errors.concat("Occupation field is required\n");
      }

      if (values.password !== values.password_second) {
        errors = errors.concat("Password does not match");
      }

      if (errors.length > 0) {
        setRegisterMessage(errors);
        return;
      }

      axios
        .post("/user", {
          password: values.password,
          first_name: values.first_name,
          last_name: values.last_name,
          location: values.location,
          description: values.description,
          occupation: values.occupation,
        })
        .then((res) => {
          setRegisterMessage("Registered!");
        })
        .catch((e) => {
          setRegisterMessage("Login name not available");
          console.log(e);
        });
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="mainContainer">
        <TextField
          margin="normal"
          required
          id="first_name"
          label="First Name"
          name="first_name"
          value={formik.values.first_name}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="last_name"
          label="Last Name"
          name="last_name"
          value={formik.values.last_name}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="password"
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="password_second"
          label="Password"
          name="password_second"
          type="password"
          value={formik.values.password_second}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="location"
          label="Location"
          name="location"
          value={formik.values.location}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="description"
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
        />
        <TextField
          margin="normal"
          required
          id="occupation"
          label="Occupation"
          name="occupation"
          value={formik.values.occupation}
          onChange={formik.handleChange}
        />
        <Box m="1rem">
          <Button variant="contained" type="submit" style={{ width: 200 }}>
            Register
          </Button>
        </Box>
        <div>{registerMessage}</div>
      </form>
    </div>
  );
};

export default Register;
