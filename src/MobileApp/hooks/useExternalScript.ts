import { useState, useEffect } from 'react';

export const useExternalScript = (src: string) => {
  const [state, setState] = useState(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setState('idle');
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;

    const handleScript = (e: Event) => {
      setState(e.type === 'load' ? 'ready' : 'error');
    };

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      script.addEventListener('load', handleScript);
      script.addEventListener('error', handleScript);
    } else {
      setState('ready');
    }

    return () => {
      if (script) {
        script.removeEventListener('load', handleScript);
        script.removeEventListener('error', handleScript);
      }
    };
  }, [src]);

  return state;
};

export default useExternalScript;
