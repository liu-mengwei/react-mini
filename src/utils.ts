export function createBaseFiber(element) {
  return {
    props: element.props,
    type: element.type,
    dom: null,
  };
}

export function createElement(type, props, ...children) {
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

export function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 先处理添加，通过fiber生成真实的dom节点
export function createDom(fiber) {
  // 文本元素处理
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // 处理vdom的props传递
  const isProperty = (key) => key !== "children";

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((key) => {
      // 如果属性是一个对象就会比较麻烦
      if (typeof dom[key] === "object") {
        for (let prop in fiber.props[key]) {
          dom[key][prop] = fiber.props[key][prop];
        }
      } else {
        dom[key] = fiber.props[key];
      }
    });

  return dom;
}
