import React from "react";
import axios from "axios";
import { useState } from "react";

const Activities = () => {
  var [data, setData] = useState();

  var handleClick = () => {
    axios
      .get("/activity")
      .then((res) => {
        setData(JSON.stringify(res.data));
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div>
      <button onClick={handleClick()}>refresh</button>
      <div>{data}</div>
    </div>
  );
};

export default Activities;
