import * as React from "react";
import { useEffect, useRef, useState, useCallback } from 'react';
import { ReactReader, ReactReaderStyle, type IReactReaderStyle } from 'react-reader';
import type { Contents, Rendition } from 'epubjs';
import useLocalStorageState from 'use-local-storage-state';
import { getWheelPageAction } from './wheelNavigation';

export const EpubReader = ({ contents, title, scrolled, mouseWheelPageTurn }: {
  contents: ArrayBuffer;
  title: string;
  scrolled: boolean;
  mouseWheelPageTurn: boolean;
}) => {
  const [location, setLocation] = useLocalStorageState<string | number>(`epub-${title}`, { defaultValue: 0 });
  const renditionRef = useRef<Rendition | null>(null);
  const readerHostRef = useRef<HTMLDivElement | null>(null);
  const lastWheelPageTurnAtRef = useRef(0);
  const wheelSettingsRef = useRef({ scrolled, mouseWheelPageTurn });
  const [fontSize, setFontSize] = useState(100); 

  wheelSettingsRef.current = { scrolled, mouseWheelPageTurn };

  const isDarkMode = document.body.classList.contains('theme-dark');

  const locationChanged = useCallback((epubcifi: string | number) => {
    setLocation(epubcifi);
  }, [setLocation]);

  const updateTheme = useCallback((rendition: Rendition, theme: 'light' | 'dark') => {
    const themes = rendition.themes;
    themes.override('color', theme === 'dark' ? '#fff' : '#000');
    themes.override('background', theme === 'dark' ? '#000' : '#fff');
  }, []);

  const updateFontSize = useCallback((size: number) => {
    renditionRef.current?.themes.fontSize(`${size}%`);
  }, []);

  useEffect(() => {
    updateFontSize(fontSize);
  }, [fontSize, updateFontSize]);

  useEffect(() => {
    const readerHost = readerHostRef.current;
    if (!readerHost) return;

    const resizeRendition = () => {
      if (readerHost.clientWidth > 0 && readerHost.clientHeight > 0) {
        renditionRef.current?.resize(readerHost.clientWidth, readerHost.clientHeight);
      }
    };

    const resizeObserver = new ResizeObserver(resizeRendition);
    resizeObserver.observe(readerHost);
    resizeRendition();

    return () => resizeObserver.disconnect();
  }, []);

  const handleContentWheel = useCallback((event: WheelEvent) => {
    const settings = wheelSettingsRef.current;
    const now = Date.now();
    const action = getWheelPageAction({
      deltaY: event.deltaY,
      isPaginated: !settings.scrolled,
      enabled: settings.mouseWheelPageTurn,
      isModified: event.ctrlKey || event.metaKey || event.altKey,
      now,
      lastTurnAt: lastWheelPageTurnAtRef.current,
    });

    if (action == null) return;

    event.preventDefault();
    event.stopPropagation();
    lastWheelPageTurnAtRef.current = now;

    if (action === 'next') {
      renditionRef.current?.next();
    } else {
      renditionRef.current?.prev();
    }
  }, []);

  const readerStyles = isDarkMode ? darkReaderTheme : lightReaderTheme;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
      <div style={{ flex: '0 0 auto', padding: '10px' }}>
        <label htmlFor="fontSizeSlider">Adjust Font Size: </label>
        <input
          id="fontSizeSlider"
          type="range"
          min="80"
          max="160"
          value={fontSize}
          onChange={e => setFontSize(parseInt(e.target.value))}
        />
      </div>
      <div ref={readerHostRef} style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        <ReactReader
          title={title}
          showToc={true}
          location={location}
          locationChanged={locationChanged}
          swipeable={false}
          url={contents}
          getRendition={(rendition: Rendition) => {
            renditionRef.current = rendition;
            rendition.hooks.content.register((contents: Contents) => {
              const body = contents.window.document.body;
              body.oncontextmenu = () => false;
              contents.window.addEventListener('wheel', handleContentWheel, { passive: false });
            });
            updateTheme(rendition, isDarkMode ? 'dark' : 'light');
            updateFontSize(fontSize);
          }}
          epubOptions={scrolled ? {
            allowPopups: true,
            flow: "scrolled",
            manager: "continuous",
          } : undefined}
          readerStyles={readerStyles}
        />
      </div>
    </div>
  );
};

const lightReaderTheme: IReactReaderStyle = {
  ...ReactReaderStyle,
  readerArea: {
    ...ReactReaderStyle.readerArea,
    transition: undefined,
  },
};

const darkReaderTheme: IReactReaderStyle = {
  ...ReactReaderStyle,
  arrow: {
    ...ReactReaderStyle.arrow,
    color: 'white',
  },
  arrowHover: {
    ...ReactReaderStyle.arrowHover,
    color: '#ccc',
  },
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: '#000',
    transition: undefined,
  },
  titleArea: {
    ...ReactReaderStyle.titleArea,
    color: '#ccc',
  },
  tocArea: {
    ...ReactReaderStyle.tocArea,
    background: '#111',
  },
  tocButtonExpanded: {
    ...ReactReaderStyle.tocButtonExpanded,
    background: '#222',
  },
  tocButtonBar: {
    ...ReactReaderStyle.tocButtonBar,
    background: '#fff',
  },
  tocButton: {
    ...ReactReaderStyle.tocButton,
    color: 'white',
  },
};
