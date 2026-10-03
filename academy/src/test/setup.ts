import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom implementeert play() niet: het schrijft een stacktrace naar stderr en
// geeft undefined terug. Echte browsers geven een Promise, dus die geven we ook.
Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
  writable: true,
  value: () => Promise.resolve(),
});
