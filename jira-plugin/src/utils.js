export function waitForDocument(cb) {
  console.log('Waiting for document to be ready');
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('Interactive or complete, calling ', cb);
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Dom Loaded. Calling ', cb);
      cb();
    });
  }
}