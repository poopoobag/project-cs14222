import React from "react";

var generateComment = (inputComment) => {
  var regDisplay = /@\[.*?\]\(.*?\)/g;
  var matches = inputComment.matchAll(regDisplay);

  var displayMatches = [];

  for (const match of matches) {
    displayMatches.push(match[0]);
  }

  var result = BoldedText(inputComment, displayMatches);

  return <div>{result}</div>;
};

var BoldedText = (text, shouldBeBold) => {
  var commentElem = [];

  var regMention = /(?<=@\[)(.*?)(?=\])/g;

  var keyElem = 0;

  shouldBeBold.forEach((element) => {
    var test = {};
    test.first = text.indexOf(element);
    test.last = test.first + element.length - 1;

    var comment = {};
    comment.firstPart = text.slice(0, test.first);
    comment.middlePart = element;
    comment.lastPart = text.slice(test.last + 1, text.length);

    if (comment.firstPart) {
      commentElem.push(<span key={keyElem}>{comment.firstPart}</span>);
      keyElem++;
    }
    var filter = comment.middlePart.match(regMention);
    var idReg = /(?<=\]\()(.*?)(?=\))/g;
    var id = comment.middlePart.match(idReg);
    commentElem.push(
      <a
        href={`photo-share.html#/users/${id}`}
        style={{ textDecoration: "none", color: "inherit" }}
        key={keyElem}
      >
        <b>{filter[0]}</b>
      </a>
    );
    keyElem++;
    text = comment.lastPart;
  });
  if (text) {
    commentElem.push(<span key={keyElem}>{text}</span>);
  }

  // shouldBeBold.forEach((element) => {
  //   var textArray = text.split(element);
  //   textArray.forEach((item, index) => {
  //     console.log(key);
  //     comment.push(
  //       <span>
  //         {item}
  //         {index !== textArray.length - 1 && <b>{shouldBeBold}</b>}
  //       </span>
  //     );
  //   });
  //   key++;
  // });

  return commentElem;
};

exports.generateComment = generateComment;
