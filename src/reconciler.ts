import { createBaseFiber } from "./utils";

export let deleteFibers = [] as any;

// 较为hack
export function clearDeleteFibers() {
  deleteFibers = [];
}

// wip是半成品的意思，意思是经过了这个函数，子元素全部生成了新的fiber,并且引用正确
export function reconcileChildren(wipFiber, elements) {
  let index = 0;

  // 拿到旧节点的引用
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  let prevFiber;
  // 干了两件事，子fiber树的生成（和之前生成的fiber children进行比较）
  while (index < elements.length || oldFiber) {
    const element = elements[index];

    // 判断如果两个节点如果同时存在，且类型相同则更新节点
    // 疑问如果类型不同怎么办，应该要直接替换节点, 和添加节点的逻辑是一样的
    let newFiber = createFiberByEleAndOldFiber(element, oldFiber);
    if (newFiber) {
      newFiber = {
        ...createBaseFiber(element),
        ...newFiber,
        parent: wipFiber,
      };
    }

    // 继续遍历
    if (index === 0 && newFiber) {
      wipFiber.child = newFiber;
    } else {
      prevFiber.sibling = newFiber;
    }

    index++;
    oldFiber = oldFiber?.sibling;
    prevFiber = newFiber;
  }
}

// 未经优化的vdom比较算法
// 可以优化，算法复杂度？ on3?
function createFiberByEleAndOldFiber(element, oldFiber) {
  const sameType = element && oldFiber && element.type === oldFiber.type;

  let newFiber = null as any;
  if (sameType) {
    // 节点更新
    // 复用节点
    newFiber = {
      dom: oldFiber.dom,
      effectTag: "UPDATE",
      alternate: oldFiber,
    };
  }

  // 节点添加
  // 如果新的元素存在，但旧元素不存在，则添加节点
  // 这里面同时包含了旧节点存在但类型不同，旧节点不存在这两种情况，都是添加节点
  if (element && !sameType) {
    newFiber = {
      dom: null,
      effectTag: "ADD",
      alternate: null,
    };
    // 同时把旧节点删除
    if (oldFiber) {
      oldFiber["effectTag"] = "DELETE";
      deleteFibers.push(oldFiber);
    }
  }

  // 节点删除 不产生新的节点，而是在老节点加一个标志
  if (oldFiber && !element) {
    oldFiber["effectTag"] = "DELETE";
    // 添加进需要commit的数组
    deleteFibers.push(oldFiber); // 副作用写法，应该是简化写法
    newFiber = null;
  }

  return newFiber;
}
