let nextUnitOfWork = null;

function workloop(deadline) {
  let shouldYield = false;

  // 任务存在并且浏览器不阻断任务
  while (nextUnitOfWork && !shouldYield) {
    // 执行任务 链表循环
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 判断剩余的时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  window.requestIdleCallback(nextUnitOfWork);
}

window.requestIdleCallback(workloop);

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}


