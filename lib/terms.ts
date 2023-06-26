import type Term from './components/term';

// react Term components add themselves
// to this object upon mounting / unmounting
// this is to allow imperative access to the
// term API, which is a performance
// optimization for the most common action
// within the system

const terms: Record<string, Term | null> = {};
export default terms;
