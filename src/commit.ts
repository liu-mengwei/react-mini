import { clearDeleteFibers, deleteFibers } from "./reconciler";
import { clearWipRoot, setCurrentRoot } from "./render";

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
  }

  // 处理更新
  if (fiber.effectTag === "UPDATE") {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  // 处理删除
  if (fiber.effectTag === "DELETE") {
    if (fiber.dom) fiber.parent?.dom?.removeChild(fiber.dom);
    // 删除完成直接返回
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function updateDom(dom, prevProps, currentProps) {}
