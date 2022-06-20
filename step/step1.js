// string 结构描述
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// );

const Didact = {
  createElement,
  render,
};

// const element = Didact.createElement(
//   "div",
//   { id: "foo" },
//   Didact.createElement("a", null, "bar"),
//   Didact.createElement("b")
// );

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // 这里做一步处理，引入文本节点，统计化
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 先处理添加
function render(element, container) {
  // 文本元素处理
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // 处理vdom的props传递
  const isProperty = (key) => key !== "children";

  Object.keys(element.props)
    .filter(isProperty)
    .forEach((key) => {
      dom[key] = element.props[key];
    });

  // 关键代码，递归创建元素 将元素映射到dom上
  element.props.children.forEach((child) => {
    render(child, dom);
  });

  container.appendChild(dom);
}

const container = document.getElementById("root");
React.render(element, container);

// 做完这一步，有几个问题
// 组件节点怎么处理
// 节点的更新删除怎么处理
// render 是个递归执行栈，一旦执行就停不下来，占用主线程，导致动画或者用户输入事件卡顿