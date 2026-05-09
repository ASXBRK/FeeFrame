import { useEffect } from 'react';

interface DocMeta {
  title: string;
  description: string;
  ogUrl?: string;
}

function setMeta(attrName: string, attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function useDocumentMeta({ title, description, ogUrl }: DocMeta) {
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (ogUrl) setMeta('property', 'og:url', ogUrl);
  }, [title, description, ogUrl]);
}
