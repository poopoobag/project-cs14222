import React from "react";

import axios from "axios";

import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@material-ui/core";

import { MyContext } from "../../context";

import { Formik } from "formik";
import { useContext } from "react";

export default function UploadFile() {
  const [open, setOpen] = React.useState(false);

  const Context = useContext(MyContext);

  var uploadInput;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  var handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then((res) => {
          Context.setFetch(false);
          handleClose();
        })
        .catch((err) => console.log(`POST ERR: ${err}`));
    }
  };

  return (
    <div>
      <Button
        style={{ color: "#3f51b5" }}
        variant="contained"
        onClick={handleClickOpen}
      >
        Upload Photo
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            type="file"
            ref={(domFileRef) => {
              uploadInput = domFileRef;
            }}
            id="upload"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <label htmlFor="upload">
            <Button onClick={handleUploadButtonClicked}>Submit</Button>
          </label>
        </DialogActions>
      </Dialog>
    </div>
  );
}
