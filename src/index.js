import { render } from "./render";
import { createElement } from "./utils";
import "./index.css";

const Didact = {
  createElement,
  render,
};

let visible = true;

function main() {
  const container = document.querySelector("#root");

  /** @jsx Didact.createElement */
  function updateValue(e) {
    rerender(e.target.value, visible);
  }

  function rerender(value) {
    Didact.render(
      <input
        onInput={updateValue}
        className={value === "" && "input"}
        value={value}
        style={{ fontSize: "18px" }} // 无法更新
      />,
      container
    );
  }

  rerender("hello world", visible);
}

main();
