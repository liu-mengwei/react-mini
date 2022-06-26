// 每次只能入栈一个函数组件节点

import { setWipRoot } from "./render";

// 我将信息存入当前的fiber结构中

// setState 做类似 render那个方法里的是，构造一个新树的起点
// 是一个工作循环，workLoop

// fiber
// {
//   hooks: {
//     state: 1,
//     action: fn
//   }
// }

let hookIndex = 0;

export function resetHookIndex() {
  hookIndex = 0;
}

let wipFiber = null;

export function setWipFiber(fiber) {
  wipFiber = fiber;
}

// 必须保证每次hooks的数量是一致的
export function useState(initialValue) {
  // 获取值和旧值比较
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initialValue,
    quene: [],
  };

  // 我这里要拿到老的循环的quene
  // 这里实现一个队列是为了 setState(prev => prev + 1)这样的API
  oldHook?.quene.forEach((action) => {
    if (typeof action === "function") {
      hook.state = action[hook.state]; //这里的hookstate就是老值了
    } else {
      hook.state = action;
    }
  });

  // 将此次的执行结果赋值到这次的节点上
  wipFiber.hooks.push(hook);

  // 更新节点，直接指向一颗新的树
  function setState(action) {
    // 这里难理解的一点是
    // 我要改的是下一次useState的state, 而不是这次的state
    hook.quene.push(action);

    // 构建新树则触发更新，重复调用setState，则只是替换树
    // 在一个循环里，只会渲染一次
    setWipRoot();
  }

  hookIndex++;
  return [hook.state, setState];
}

// const effect = {
//   effect: () => {},
//   deps: [],
// };
let effectHooks = [];

export function useEffect(effect, deps) {
  let newEffectHook = {
    effect,
    deps,
    fiber: wipFiber,
  };

  // 将副作用也挂到组件节点上
  if (!wipFiber.effectHooks) {
    wipFiber.effectHooks = [];
  }
  wipFiber.effectHooks.push(newEffectHook);

  effectHooks.push(newEffectHook);
}

export function clearEffectHooks() {
  effectHooks = [];
}

function shouldRefresh(oldDeps, deps) {
  // 如果有没传的deps依赖，每次都进行effect运算
  if (oldDeps === undefined || deps === undefined) return true;

  // 数组类型 浅比较
  if (oldDeps instanceof Array && deps instanceof Array) {
    let shouldRefresh = false;
    for (let i = 0; i < oldDeps.length; i++) {
      let oldDep = oldDeps[i];
      if (oldDep !== deps[i]) {
        shouldRefresh = true;
        break;
      }
    }
    return shouldRefresh;
  }

  return true;
}

export function performEffects() {
  let hookIndex = 0;
  let currentFiber;

  effectHooks?.forEach((effectHook) => {
    const { effect, deps, fiber } = effectHook;
    // 重置
    if (fiber !== currentFiber) {
      hookIndex = 0;
      currentFiber = fiber;
    }

    // 找到之前的组件节点的状态
    let oldEffect = fiber?.alternate?.effectHooks?.[hookIndex];

    // 浅比较
    let unEffect;
    if (shouldRefresh(oldEffect?.deps, deps)) {
      // 清理前一次的unEffect
      if (oldEffect?.unEffect) oldEffect?.unEffect();

      unEffect = effect();
    }

    // 继承旧的unEffect
    fiber.effectHooks[hookIndex].unEffect = unEffect || oldEffect?.unEffect;

    hookIndex++;
  });

  clearEffectHooks();
}

let refHookIndex = 0;

export function resetRefHookIndex() {
  refHookIndex = 0;
}

export function useRef(initialValue) {
  const oldHook = wipFiber?.alternate?.refHooks?.[refHookIndex];

  let newHook = oldHook || {
    current: initialValue,
  };

  if (!wipFiber.refHooks) wipFiber.refHooks = [];
  wipFiber.refHooks.push(newHook);
  
  refHookIndex++;

  return newHook;
}
