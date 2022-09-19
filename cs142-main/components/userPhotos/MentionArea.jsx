import React from "react";

import { MentionsInput, Mention } from "react-mentions";
import { Button } from "@material-ui/core";
import defaultStyle from "./defaultStyle";
import defaultMentionStyle from "./defaultMentionStyle";
import { useState } from "react";
import axios from "axios";
const MentionArea = (props) => {
  var [value, setValue] = useState("");

  var handleChange = (e) => {
    setValue(e.target.value);
  };

  var handleSubmit = (e) => {
    if (!value) {
      return;
    }
    var regDisplay = /(?<=\]\()(.*?)(?=\))/g;
    var matches = value.matchAll(regDisplay);

    var displayMatches = [];

    for (const match of matches) {
      displayMatches.push(match[0]);
    }

    axios
      .post(`/commentsOfPhoto/${props._id}`, {
        comment: value,
        mentions: displayMatches,
      })
      .then((res) => {
        setValue("");
      });

    console.log(props.fetch);
    props.fetch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <MentionsInput
        value={value}
        onChange={handleChange}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
        a11ySuggestionsListLabel={"Suggested mentions"}
      >
        <Mention data={props.data} style={defaultMentionStyle} />
      </MentionsInput>
      <Button type="submit">Enter</Button>
    </form>
  );
};

export default MentionArea;
