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

  // 如果没有下个任务了，
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  window.requestIdleCallback(workloop);
}

function commitRoot() {
  // 再这里提交整个树，更新dom,
  // 但是问题来了，现在我的dom都是分立的dom，dom还没有被整合起来
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

// nextUnitOfeWork 其实就是特殊的fiber，意思就是下一个fiber,理解成指针
let nextUnitOfWork = null;
let wipRoot = null; // 整个wip树的根节点
function performUnitOfWork(fiber) {
  // 创建dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 实时构建dom代码删除，而是整个fiber树构建好了，再一起渲染
  // 将创建好的dom 插入到父亲节点当中
  // if (fiber.parent) {
  //   if (fiber.parent.dom) {
  //     fiber.parent?.dom.appendChild(fiber.dom);
  //   } else {
  //     fiber.parent.appendChild(fiber.dom);
  //   }
  // }

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
    dom: container,
    props: {
      children: [element],
    },
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
  if (typeof type === "function") {
    const vdom = type(props);

    return {
      type: "FunctionComponent",
      props: {
        ...props,
        children: [vdom],
      },
      update: () => {
        const vdom = type(props);

        // 重新更新
        // 问题，我怎么触发这个update调用呢，function里面缺失信息能够调用到这里
        this.props.children = [vdom];
        // 更新nextUnitOfWork
      },
    };
  }

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

// 问题，我这里第一次渲染完了，nextUnitOfWork无了，我必须要有个更新，把指针指向nextUnitOfWork，就可以重新进行渲染了
// 我要怎么触发这个更新呢？
// 关键在于组件节点怎么处理
// 某个组件节点某些情况下触发更新 =》 运行渲染函数 =》 生成vdom节点 =》 生成fiber节点，并让下一个执行工作单元指向它，requestIdcallback会开启渲染流程
// const component = {
//   type: "FunctionComponent",
//   props: {
//     children: [],
//   },
// };
