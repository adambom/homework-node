# Eaze Node.js Homework

> Our Node.js code challenge for engineering applicants

# Adam's Notes

Hey there, just wanted to add a little commentary for anyone who may be reviewing the code. After solving this for N=10, I moved to a strategy that downloads records in batches, so that if N is very large, it's no problem to download everything. I didn't have any trouble downloading N=1000. The `Downloader` class takes a `batchSize` argument, and defaults to `100`. It might be interesting to experiment with that parameter. I seemed to be limited by the network in my testing.

I'm using a couple nifty features in node that are probably worth explaining...

## async/await

My preferred way of handling async stuff in node. It's pretty much the reason that I use node for anything server-side these days. You can write non-blocking i/o code in synchronous style. No need for callbacks or promise semantics.

Here's an example:

```javascript
async function doSomethinAsynchronously() {
  let results;

  try {
    results = await callTheInternet();
  } catch (e) {
    console.error('Something went horribly wrong');
    return;
  }

  return process(results);
}
```

Is equivalent to:


```javascript
function doSomethinAsynchronously() {
  return callTheInternet()
    .then(process)
    .catch(e => {
      console.log('Something went horribly wrong');
    });
}
```

## Generators and for ... of loops

I've also made liberal use of generators in this project. I like generators as a pattern whenever I'm batching stuff. You'll see code like this in a couple places:

```javascript
for await (let batch of batches) {
  // do something with batch
}
```

What that code does is iterate over a generator, where the generator produces results asynchronously. If you've got thoughts on this pattern, I'd love to discuss it with you. It's served me well in the past, and when I discovered it I thought it was really cool. This was a good opportunity to leverage this pattern.

## Gotchas

There were a couple gotchas that I discovered as I worked on this problem, and I made some assumptions that allowed me to deal with them. I thought these were worth a mention.


### Scoped packages are problematic

If you have a scoped package, e.g. `@angular/core`, the registry url, e.g. `https://registry.npmjs.org/@angular/core/latest` responds with a 401 error. For this reason, I exclude all scoped packages from our results.


### Package names can be duplicated

If two versions of a single package are included in the top N results, then we'll get a conflict. Obviously we can only store one version, unless we were to intelligently determine an alternate location on the filesystem in these cases. I opted to disallow duplicates. We ignore any duplicate package names.


### Uppercase and lowercase versions of the same package

NPM treats package names with case-sensitivity, but my file system does not. For example, MD5 and md5 are both in the top 1000 depended-upon packages. I opted to make my program case-insensitive, and if two package names are the same when converted to lowercase, I will ignore everything except the first incidence of this package.


## Project

1. Get the 10 [most depended on packages](https://www.npmjs.com/browse/depended) from npm.
2. For each package, download the latest tarball from the npm registry.
3. Extract the tarball into `./packages/${pkg.name}`, e.g. `./packages/lodash`.

## Setup

Start by cloning this repo. Everything you'll need to get started is already configured for you. You'll need to commit your code at least once, but probably more often. Please use whatever commit and code style you like best, but please make sure all syntax is supported by Node v8.

We've already created an `index.js` file as your entry point. Create as many additional files as you'd like.

## Testing

We've created a failing `npm test` command for you. You can add additional tests if you'd like and even bring in a tool other than [`tape`](https://github.com/substack/tape) as long as these initial tests remain unchanged and `npm test` sets correct exit codes.

Passing tests don't guarantee that your solution is perfect but a failing test definitely indicates a problem.

## Bonus

How high can you go? Set the `COUNT` environment variable when running your tests to download more than the top 10.
