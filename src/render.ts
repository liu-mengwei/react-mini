import { commitRoot } from "./commit";
import { resetHookIndex, resetRefHookIndex, setWipFiber } from "./hooks";
import { reconcileChildren } from "./reconciler";
import { createDom } from "./utils";

// nextUnitOfeWork 其实就是特殊的fiber，意思就是下一个fiber,理解成指针
let nextUnitOfWork = null;
let wipRoot: any = null; // 整个wip树的根节点
let currentRoot = null;

window.requestIdleCallback(workloop);

function workloop(deadline) {
  let shouldYield = false;

  // 任务存在并且浏览器不阻断任务
  while (nextUnitOfWork && !shouldYield) {
    // 执行任务 链表循环
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 判断剩余的时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果没有下个任务了
  // 完整构建出了新的fiber树，代码难理解的地方其实就是频繁改全局变量
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  window.requestIdleCallback(workloop);
}

function updateFunctionComponentNode(fiber) {
  // 将当前fiber指向一个全局变量
  // 后续useState会用到，因为这里没有函数参数传递，只能执行全局变量
  setWipFiber(fiber);
  fiber.hooks = [];
  resetHookIndex();
  resetRefHookIndex()

  // 运行得到 children
  const children = fiber.type(fiber.props);
  reconcileChildren(fiber, [children]); //在react中 dom只有一个节点
}

function updateDomNode(fiber) {
  // 创建dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function performUnitOfWork(fiber) {
  if (typeof fiber.type === "function") {
    updateFunctionComponentNode(fiber); // 判断如果是函数节点
  } else {
    updateDomNode(fiber); // 如果是普遍dom节点
  }

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

export function render(element, container) {
  // 构建root根节点 这个是一个新的 fiber树起点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, //需要保留上次构建的fiber树的引用
  };

  nextUnitOfWork = wipRoot;
}

export function clearWipRoot() {
  wipRoot = null;
}

export function setCurrentRoot(fiber) {
  currentRoot = fiber;
}

export function getCurrentRoot() {
  return currentRoot;
}

export function getWipRoot() {
  return wipRoot;
}

export function setWipRoot() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot, //需要保留上次构建的fiber树的引用
  };

  nextUnitOfWork = wipRoot;
}
