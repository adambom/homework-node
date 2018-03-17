export function asyncForEach(arr, fn) {
  return Promise.all(arr.map(async (item, i) => {
    await fn(item, i);
  }));
}
