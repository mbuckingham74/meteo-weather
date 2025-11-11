import { useEffect, useState } from 'react';
import { MEDIA_QUERIES, BREAKPOINT_SEQUENCE } from '../constants/breakpoints';

const DESCENDING_BREAKPOINTS = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

const getActiveBreakpoint = () => {
  if (typeof window === 'undefined') {
    return 'base';
  }

  for (const key of DESCENDING_BREAKPOINTS) {
    const query = MEDIA_QUERIES.up[key];
    if (query && window.matchMedia(query).matches) {
      return key;
    }
  }

  return 'base';
};

const attach = (mql, handler) => {
  if (!mql) {
    return;
  }

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(handler);
  }
};

const detach = (mql, handler) => {
  if (!mql) {
    return;
  }

  if (typeof mql.removeEventListener === 'function') {
    mql.removeEventListener('change', handler);
  } else if (typeof mql.removeListener === 'function') {
    mql.removeListener(handler);
  }
};

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(() => getActiveBreakpoint());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mqlEntries = DESCENDING_BREAKPOINTS.map((key) => ({
      key,
      mql: window.matchMedia(MEDIA_QUERIES.up[key]),
    }));

    const handleChange = () => {
      setBreakpoint(getActiveBreakpoint());
    };

    mqlEntries.forEach(({ mql }) => attach(mql, handleChange));

    return () => {
      mqlEntries.forEach(({ mql }) => detach(mql, handleChange));
    };
  }, []);

  return breakpoint;
};

export const useBreakpointValue = (values = {}, fallback = undefined) => {
  const breakpoint = useBreakpoint();

  if (Object.prototype.hasOwnProperty.call(values, breakpoint)) {
    return values[breakpoint];
  }

  if (Object.prototype.hasOwnProperty.call(values, 'base')) {
    return values.base;
  }

  return fallback;
};

export const isBreakpointKey = (key) => BREAKPOINT_SEQUENCE.includes(key);

export default useBreakpoint;
