export const serve = (handler: any) => {
    (globalThis as any).registeredEdgeFunction = handler;
};
export const EdgeRuntime = {
    waitUntil: (promise: Promise<any>) => Promise.resolve(promise)
};
