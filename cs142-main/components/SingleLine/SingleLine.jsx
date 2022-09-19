import React, { useState } from "react";

import { MentionsInput, Mention } from "react-mentions";

import defaultStyle from "./defaultStyle";
import defaultMentionStyle from "./defaultMentionStyle";

const SingleLine = (props) => {
  return (
    <div className="single-line">
      <MentionsInput
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        style={defaultStyle}
        placeholder={"Mention people using '@'"}
      >
        <Mention trigger="@" data={props.data} style={defaultMentionStyle} />
      </MentionsInput>
    </div>
  );
};

export default SingleLine;
