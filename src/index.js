import { render } from "./render";
import { createElement } from "./utils";

const React = {
  createElement,
  render,
};

function main() {
  const container = document.querySelector("#root");

  React.render(
    React.createElement(
      "div",
      {
        style: { background: "red", width: "100px", height: "100px" },
      },
      "memeda"
    ),

    container
  );
}

main();
