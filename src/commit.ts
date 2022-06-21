import { clearDeleteFibers, deleteFibers } from "./reconciler";
import { clearWipRoot, setCurrentRoot } from "./render";
import { isProperty } from "./utils";

export function commitRoot(wipRoot) {
  // 再这里提交整个树，更新dom
  // 但是问题来了，现在我的dom都是分立的dom，dom还没有被整合起来
  // 处理删除
  deleteFibers.forEach(commitWork);
  // 处理啊添加更新
  commitWork(wipRoot.child);

  // 保留旧的fiber引用
  setCurrentRoot(wipRoot);
  // 任务完成，这个fiber树清空
  clearWipRoot();
  // 清理
  clearDeleteFibers();
}

// 递归提交变动所有节点 ?其实这里不是也用了递归吗，那我用fiber有太大的意义吗
function commitWork(fiber) {
  if (!fiber) return;

  // 等一下我把commitWork有意义吗，应该是无意义的，你可能不需要先从底部节点构建，现代浏览器这种都是批量更新的
  // 处理添加
  if (fiber.effectTag === "ADD") {
    if (fiber.parent?.dom && fiber.dom) fiber.parent.dom.appendChild(fiber.dom);
    fiber.effectTag = "";
  }

  // 处理更新
  if (fiber.effectTag === "UPDATE") {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    fiber.effectTag = "";
  }

  // 处理删除
  if (fiber.effectTag === "DELETE") {
    if (fiber.dom) fiber.parent?.dom?.removeChild(fiber.dom);
    fiber.effectTag = "";
    // 删除完成直接返回
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 主要处理3个问题
// 删除不存在的dom属性
// 添加或者更新新增的dom属性
// 事件处理
function updateDom(dom, prevProps, currentProps) {
  function isEvent(key) {
    return key.startsWith("on");
  }

  function isDeleted(key) {
    return !(key in currentProps);
  }

  function isNew(key) {
    return !(key in prevProps) || prevProps[key] !== currentProps[key];
  }

  // 删除属性
  Object.keys(prevProps)
    .filter((key) => !isEvent(key))
    .filter(isDeleted)
    .forEach((key) => {
      dom[key] = "";
    });

  // 为什么要做一次new的更新，不能直接赋值吗，可能对dom有影响

  Object.keys(currentProps)
    .filter((key) => !isEvent(key))
    .filter(isNew)
    .forEach((key) => {
      if (isProperty(key)) dom[key] = currentProps[key];
    });

  // 等一下，我为什么这里要做事件处理, 不能直接添加on事件吗我想了一下，让原生dom可以支持多事件？
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isDeleted)
    .forEach((key) => {
      dom.removeEventListener(key.toLowerCase().slice(2), prevProps[key]);
    });

  Object.keys(currentProps)
    .filter(isEvent)
    .filter(isNew)
    .forEach((key) => {
      dom.addEventListener(key.toLowerCase().slice(2), currentProps[key]);
    });
}
