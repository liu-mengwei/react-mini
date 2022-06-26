export function createBaseFiber(element) {
  return {
    props: element.props,
    type: element.type,
    dom: null,
  };
}

// 我说为什么children 要放在props里面，是为了实现 funtion({props})
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // 这里做一步处理，引入文本节点，统计化
      children: children
        .filter((child) => child !== false && child !== undefined)
        .map((child) =>
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

export function isProperty(key) {
  return key !== "children" && !key.startsWith("__");
}

// 先处理添加，通过fiber生成真实的dom节点
export function createDom(fiber) {
  // 文本元素处理
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // 处理vdom的props传递
  // 是dom原生属性
  const isEvent = (key) => key.startsWith("on");

  Object.keys(fiber.props)
    .filter(isProperty)
    .filter((key) => !isEvent(key))
    .forEach((key) => {
      // 处理ref
      if (key === "ref") {
        handleRef(fiber, dom);
        return;
      }

      // 如果属性是一个对象就会比较麻烦 style类似
      if (typeof dom[key] === "object") {
        for (let prop in fiber.props[key]) {
          dom[key][prop] = fiber.props[key][prop];
        }
      } else {
        // 普通属性
        dom[key] = fiber.props[key];
      }
    });

  // 事件属性
  Object.keys(fiber.props)
    .filter(isProperty)
    .filter(isEvent)
    .forEach((key) => {
      dom.addEventListener(key.toLowerCase().slice(2), fiber.props[key]);
    });
  return dom;
}

function handleRef(fiber, dom) {
  // 向上找到最近的父组件节点
  while (fiber.parent) {
    if (typeof fiber.parent.type === "function") {
      // 找到那个对象
      let refHook = fiber.parent.refHooks?.find(
        (item) => item === fiber.props["ref"]
      );
      if (refHook) refHook.current = dom;
      break;
    }
    fiber.parent = fiber.parent.parent;
  }
}
