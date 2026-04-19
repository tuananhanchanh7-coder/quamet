console.log('--- EMPTY.JS LOADED ---');
export const fetch = window.fetch.bind(window);
export const Headers = window.Headers;
export const Request = window.Request;
export const Response = window.Response;
export const FormData = window.FormData;
export const formDataToBlob = () => {};
export default fetch;