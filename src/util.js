import { isArray } from 'lodash';


export function asyncForEach(arr, fn) {
  return Promise.all(arr.map(async (item, i) => {
    await fn(item, i);
  }));
}


export function iterator(collection) {
  if (isArray(collection)) {
    return arrayIterator(collection);
  } else {
    return objectIterator(collection);
  }
}


function *objectIterator(object) {
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      yield [object[key], key];
    }
  }
}


function *arrayIterator(array) {
  for (let i = 0; i < array.length; i++) {
    yield array[i];
  }
}
