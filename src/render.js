import { createDom, reconcileChildren } from "./utils";

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

  // 如果没有下个任务了，
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  window.requestIdleCallback(workloop);
}

function commitRoot() {
  // 再这里提交整个树，更新dom,
  // 但是问题来了，现在我的dom都是分立的dom，dom还没有被整合起来
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

// 递归提交变动所有节点 ?其实这里不是也用了递归吗，那我用fiber有太大的意义吗
function commitWork(fiber) {
  if (!fiber) return;

  commitWork(fiber.child);
  commitWork(fiber.sibling);

  // 等一下我这样写有意义吗，应该是无意义的，你可能不需要先从底部节点构建，现代浏览器这种都是批量更新的
  if (fiber?.parent?.dom) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
}

// nextUnitOfeWork 其实就是特殊的fiber，意思就是下一个fiber,理解成指针
let nextUnitOfWork = null;
let wipRoot = null; // 整个wip树的根节点
let currentRoot = null;

function performUnitOfWork(fiber) {
  // 创建dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);

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
  // 构建root根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, //需要保留上次构建的fiber树的引用
  };

  nextUnitOfWork = wipRoot;
}
