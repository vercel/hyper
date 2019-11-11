// react Term components add themselves
// to this object upon mounting / unmounting
// this is to allow imperative access to the
// term API, which is a performance
// optimization for the most common action
// within the system

const terms = {};
export default terms;
