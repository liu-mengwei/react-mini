export function createBase(element) {
  return {
    props: element.props,
    type: element.type,
    dom: null,
  };
}

// wip是半成品的意思，意思是经过了这个函数，子元素全部生成了新的fiber,并且引用正确
export function reconcileChildren(wipFiber, elements) {
  // 构建新的fibers
  let lastFiber;
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let newFiber = {
      dom: null,
      parent: wipFiber,
      ...createBase(element),
    };

    if (i === 0) {
      wipFiber.child = newFiber;
    } else {
      lastFiber.sibling = newFiber;
    }
    lastFiber = newFiber;
  }
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
