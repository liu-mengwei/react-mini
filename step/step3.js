function workloop(deadline) {
  let shouldYield = false;

  // 任务存在并且浏览器不阻断任务
  while (nextUnitOfWork && !shouldYield) {
    // 执行任务 链表循环
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    console.log(nextUnitOfWork, "nextUnitOfWork");

    // 判断剩余的时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  window.requestIdleCallback(workloop);
}

// 先处理添加，通过fiber生成真实的dom节点
function createDom(fiber) {
  console.log(fiber, "fiber");
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

function performUnitOfWork(fiber) {
  // 创建dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 将创建好的dom 插入到父亲节点当中
  if (fiber.parent) {
    if (fiber.parent.dom) {
      fiber.parent?.dom.appendChild(fiber.dom);
    } else {
      fiber.parent.appendChild(fiber.dom);
    }
  }

  // 构建新的fibers
  let lastFiber;
  for (let i = 0; i < fiber.props.children.length; i++) {
    const element = fiber.props.children[i];
    let newFiber = {
      dom: null,
      parent: fiber,
      ...createBase(element),
    };

    if (i === 0) {
      fiber.child = newFiber;
    } else {
      lastFiber.sibling = newFiber;
    }
    lastFiber = newFiber;
  }

  // 返回下一个fiber
  console.log(fiber, "fiber");
  // 拼错了，这就是ts的好处
  if (fiber.child) return fiber.child;

  // 返回兄弟元素
  if (fiber.sibling) return fiber.sibling;

  // 往上找
  let parent = fiber.parent;
  while (parent) {
    if (parent.sibling) return parent.sibling;
    parent = parent.parent;
  }

  return null;
}

// fiber基本结构
// const fiber = {
//   dom: Dom, //dom元素
//   parent: Fiber, //父元素
//   child: Fiber, //子元素
//   sibling: Fiber, // 兄弟元素
//   props: Props // 将prop复制过来
//   type: type // 类型
// };
function render(element, container) {
  // 构建root根节点
  nextUnitOfWork = {
    ...createBase(element),
    dom: null,
    parent: container,
  };
}

function createBase(element) {
  return {
    props: element.props,
    type: element.type,
    dom: null,
  };
}

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

// nextUnitOfeWork 其实就是特殊的fiber，意思就是下一个fiber
let nextUnitOfWork = null;

const React = {
  createElement,
  render,
};

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

window.requestIdleCallback(workloop);

// 问题
// 对对，我这里想到了，这样的渲染方式是间断的，用户可能会看到一点一点的页面，体验不好
