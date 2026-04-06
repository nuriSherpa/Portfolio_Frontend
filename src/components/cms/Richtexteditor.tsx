'use client';

import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Code2,
  Quote,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Minus,
  Crop,
  Trash2,
  Maximize2,
  Check,
  X,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolBtn({ onClick, title, active, children, disabled, ...rest }: any) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={`p-1.5 text-sm transition-colors disabled:opacity-40 ${
        active
          ? 'bg-[var(--color-red)] text-[var(--color-white)]'
          : 'text-black/60 hover:bg-black/5 hover:text-[var(--color-black)]'
      }`}
      style={{ borderRadius: 0 }}
      {...rest}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-black/10 mx-1" />;
}

function SquareIconBtn({
  title,
  onMouseDown,
  variant,
  children,
}: {
  title: string;
  onMouseDown: (e: React.MouseEvent) => void;
  variant: 'dark' | 'red';
  children: React.ReactNode;
}) {
  const cls =
    variant === 'red'
      ? 'bg-[var(--color-red)] text-[var(--color-white)]'
      : 'bg-[var(--color-black)] text-[var(--color-white)]';

  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`w-9 h-9 flex items-center justify-center ${cls}`}
      style={{ borderRadius: 0 }}
    >
      {children}
    </button>
  );
}

function useImgRect(img: HTMLImageElement | null) {
  const [rect, setRect] = useState({ width: 0, height: 0, top: 0, left: 0 });

  const update = useCallback(() => {
    if (!img) return;
    const r = img.getBoundingClientRect();
    setRect({ width: r.width, height: r.height, top: r.top, left: r.left });
  }, [img]);

  useEffect(() => {
    if (!img) return;
    update();

    const onScroll = () => update();
    const onResize = () => update();

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [img, update]);

  return { rect, update };
}

/** CROP overlay */
function CropOverlay({
  img,
  onApply,
  onCancel,
}: {
  img: HTMLImageElement;
  onApply: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const { rect: imgRect } = useImgRect(img);

  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [didInit, setDidInit] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<'se' | 'sw' | 'ne' | 'nw' | ''>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCrop, setInitialCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (didInit) return;
    if (!imgRect.width || !imgRect.height) return;
    setCrop({ x: 0, y: 0, width: imgRect.width, height: imgRect.height });
    setDidInit(true);
  }, [didInit, imgRect.width, imgRect.height]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imgRect.width - crop.width));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imgRect.height - crop.height));
        setCrop((p) => ({ ...p, x: newX, y: newY }));
        return;
      }
      if (isResizing) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        let x = initialCrop.x;
        let y = initialCrop.y;
        let w = initialCrop.width;
        let h = initialCrop.height;

        if (resizeDir === 'se') {
          w = Math.min(imgRect.width - initialCrop.x, Math.max(20, initialCrop.width + dx));
          h = Math.min(imgRect.height - initialCrop.y, Math.max(20, initialCrop.height + dy));
        } else if (resizeDir === 'sw') {
          w = Math.min(initialCrop.x + initialCrop.width, Math.max(20, initialCrop.width - dx));
          h = Math.min(imgRect.height - initialCrop.y, Math.max(20, initialCrop.height + dy));
          x = initialCrop.x + (initialCrop.width - w);
        } else if (resizeDir === 'ne') {
          w = Math.min(imgRect.width - initialCrop.x, Math.max(20, initialCrop.width + dx));
          h = Math.min(initialCrop.y + initialCrop.height, Math.max(20, initialCrop.height - dy));
          y = initialCrop.y + (initialCrop.height - h);
        } else if (resizeDir === 'nw') {
          w = Math.min(initialCrop.x + initialCrop.width, Math.max(20, initialCrop.width - dx));
          h = Math.min(initialCrop.y + initialCrop.height, Math.max(20, initialCrop.height - dy));
          x = initialCrop.x + (initialCrop.width - w);
          y = initialCrop.y + (initialCrop.height - h);
        }

        setCrop({ x, y, width: w, height: h });
      }
    };

    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [isDragging, isResizing, dragStart, crop, imgRect, initialCrop, resizeDir]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const startResize = (e: React.MouseEvent, dir: 'se' | 'sw' | 'ne' | 'nw') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCrop({ ...crop });
  };

  const apply = () => {
    if (crop.width < 10 || crop.height < 10) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    onApply(canvas.toDataURL('image/png'));
  };

  return (
    <div
      className="fixed z-50"
      style={{
        left: imgRect.left,
        top: imgRect.top,
        width: imgRect.width,
        height: imgRect.height,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.6)',
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%, ${crop.x}px ${crop.y}px,
            ${crop.x}px ${crop.y + crop.height}px,
            ${crop.x + crop.width}px ${crop.y + crop.height}px,
            ${crop.x + crop.width}px ${crop.y}px,
            ${crop.x}px ${crop.y}px
          )`,
        }}
      />

      <div
        className="absolute border-2 border-[var(--color-white)] cursor-move"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          borderRadius: 0,
        }}
        onMouseDown={startDrag}
      >
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/30" />
          ))}
        </div>

        <div
          className="absolute -right-1 -bottom-1 w-3 h-3 bg-[var(--color-white)] border-2 border-[var(--color-red)] cursor-se-resize"
          style={{ borderRadius: 0 }}
          onMouseDown={(e) => startResize(e, 'se')}
        />
        <div
          className="absolute -left-1 -bottom-1 w-3 h-3 bg-[var(--color-white)] border-2 border-[var(--color-red)] cursor-sw-resize"
          style={{ borderRadius: 0 }}
          onMouseDown={(e) => startResize(e, 'sw')}
        />
        <div
          className="absolute -right-1 -top-1 w-3 h-3 bg-[var(--color-white)] border-2 border-[var(--color-red)] cursor-ne-resize"
          style={{ borderRadius: 0 }}
          onMouseDown={(e) => startResize(e, 'ne')}
        />
        <div
          className="absolute -left-1 -top-1 w-3 h-3 bg-[var(--color-white)] border-2 border-[var(--color-red)] cursor-nw-resize"
          style={{ borderRadius: 0 }}
          onMouseDown={(e) => startResize(e, 'nw')}
        />
      </div>

      <div className="absolute -top-12 right-0 flex items-center gap-2">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCrop({ x: 0, y: 0, width: imgRect.width, height: imgRect.height });
          }}
          className="px-3 py-1.5 bg-[var(--color-black)] text-[var(--color-white)] text-sm"
          style={{ borderRadius: 0 }}
        >
          Reset
        </button>

        <SquareIconBtn
          title="Cancel crop"
          variant="dark"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
        >
          <X className="w-5 h-5" />
        </SquareIconBtn>

        <SquareIconBtn
          title="Apply crop"
          variant="red"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            apply();
          }}
        >
          <Check className="w-5 h-5" />
        </SquareIconBtn>
      </div>
    </div>
  );
}

/** RESIZE overlay */
function ResizeOverlay({
  img,
  onApply,
  onCancel,
}: {
  img: HTMLImageElement;
  onApply: (dataUrl: string, w: number, h: number) => void;
  onCancel: () => void;
}) {
  const { rect: imgRect } = useImgRect(img);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [didInit, setDidInit] = useState(false);

  const [isResizing, setIsResizing] = useState(false);
  const [dir, setDir] = useState<'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | ''>('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const aspect = useMemo(() => {
    const w = img?.naturalWidth || 1;
    const h = img?.naturalHeight || 1;
    return h / w;
  }, [img]);

  useEffect(() => {
    if (didInit) return;
    if (!imgRect.width || !imgRect.height) return;
    setSize({ width: imgRect.width, height: imgRect.height });
    setDidInit(true);
  }, [didInit, imgRect.width, imgRect.height]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      let w = startSize.width;
      let h = startSize.height;

      switch (dir) {
        case 'e':
        case 'se':
          w = Math.max(50, startSize.width + dx);
          h = w * aspect;
          break;
        case 'w':
        case 'sw':
          w = Math.max(50, startSize.width - dx);
          h = w * aspect;
          break;
        case 's':
          h = Math.max(50, startSize.height + dy);
          w = h / aspect;
          break;
        case 'n':
          h = Math.max(50, startSize.height - dy);
          w = h / aspect;
          break;
        case 'ne':
          h = Math.max(50, startSize.height - dy);
          w = h / aspect;
          break;
        case 'nw':
          h = Math.max(50, startSize.height - dy);
          w = h / aspect;
          break;
      }

      setSize({ width: w, height: h });
    };

    const onUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [isResizing, dir, startPos, startSize, aspect]);

  const start = (e: React.MouseEvent, nextDir: typeof dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDir(nextDir);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
  };

  const apply = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.round(size.width);
    canvas.height = Math.round(size.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    onApply(canvas.toDataURL('image/png'), canvas.width, canvas.height);
  };

  return (
    <div
      className="fixed z-50"
      style={{ left: imgRect.left, top: imgRect.top, width: size.width, height: size.height }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          border: `2px solid var(--color-red)`,
          background: 'rgba(191,30,45,0.06)',
          borderRadius: 0,
        }}
      />

      <div
        className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-10 cursor-e-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'e')}
      />
      <div
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-10 cursor-w-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'w')}
      />
      <div
        className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-10 h-2 cursor-s-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 's')}
      />
      <div
        className="absolute left-1/2 -top-1 -translate-x-1/2 w-10 h-2 cursor-n-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'n')}
      />

      <div
        className="absolute -right-1 -bottom-1 w-3 h-3 cursor-se-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'se')}
      />
      <div
        className="absolute -left-1 -bottom-1 w-3 h-3 cursor-sw-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'sw')}
      />
      <div
        className="absolute -right-1 -top-1 w-3 h-3 cursor-ne-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'ne')}
      />
      <div
        className="absolute -left-1 -top-1 w-3 h-3 cursor-nw-resize"
        style={{ background: 'var(--color-red)', borderRadius: 0 }}
        onMouseDown={(e) => start(e, 'nw')}
      />

      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 pointer-events-none"
        style={{
          background: 'var(--color-black)',
          color: 'var(--color-white)',
          borderRadius: 0,
        }}
      >
        {Math.round(size.width)} × {Math.round(size.height)}
      </div>

      <div className="absolute -top-12 right-0 flex items-center gap-2">
        <SquareIconBtn
          title="Cancel resize"
          variant="dark"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
        >
          <X className="w-5 h-5" />
        </SquareIconBtn>

        <SquareIconBtn
          title="Apply resize"
          variant="red"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            apply();
          }}
        >
          <Check className="w-5 h-5" />
        </SquareIconBtn>
      </div>
    </div>
  );
}

/**
 * Find drop position in contentEditable:
 * Use caretPositionFromPoint if available, otherwise caretRangeFromPoint.
 */
function getRangeFromPoint(x: number, y: number): Range | null {
  const doc: any = document;

  if (doc.caretPositionFromPoint) {
    const pos = doc.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const r = document.createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.collapse(true);
    return r;
  }

  if (doc.caretRangeFromPoint) {
    return doc.caretRangeFromPoint(x, y) as Range;
  }

  return null;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = 400,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const savedRange = useRef<Range | null>(null);

  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [editMode, setEditMode] = useState<'crop' | 'resize' | null>(null);

  // caret indicator (insertion cursor)
  const [caretRect, setCaretRect] = useState<DOMRect | null>(null);

  // image drag-to-move state
  const [isImgDragging, setIsImgDragging] = useState(false);
  const dragImgRef = useRef<HTMLImageElement | null>(null);
  const dragPlaceholderRef = useRef<HTMLSpanElement | null>(null);

  const normalizeImages = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll('img').forEach((node) => {
      const im = node as HTMLImageElement;
      im.style.maxWidth = '100%';
      im.style.height = 'auto';
      im.style.borderRadius = '0';
      im.style.objectFit = 'contain';
      im.style.transform = 'none';
      im.style.transition = 'none';
      im.style.cursor = 'pointer';
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || hasInitializedRef.current) return;
    editor.innerHTML = value || '';
    hasInitializedRef.current = true;
    normalizeImages();
  }, [value, normalizeImages]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isUpdatingRef.current) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
      normalizeImages();
    }
  }, [value, normalizeImages]);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();

      try {
        const r = range.cloneRange();
        r.collapse(true);
        const rects = r.getClientRects();
        const rect = rects?.[0];
        setCaretRect(rect ? (rect as DOMRect) : null);
      } catch {
        setCaretRect(null);
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
        return;
      }
    }

    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  const exec = useCallback(
    (command: string, valueArg?: string) => {
      restoreSelection();
      document.execCommand(command, false, valueArg);
      editorRef.current?.focus();
      isUpdatingRef.current = true;
      onChange(editorRef.current?.innerHTML ?? '');
      requestAnimationFrame(() => (isUpdatingRef.current = false));
      normalizeImages();
    },
    [restoreSelection, onChange, normalizeImages],
  );

  const handleInput = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    onChange(editorRef.current?.innerHTML ?? '');
    requestAnimationFrame(() => (isUpdatingRef.current = false));
  }, [onChange]);

  const setBlock = useCallback(
    (tag: string) => {
      restoreSelection();
      document.execCommand('formatBlock', false, tag);
      editorRef.current?.focus();
      isUpdatingRef.current = true;
      onChange(editorRef.current?.innerHTML ?? '');
      requestAnimationFrame(() => (isUpdatingRef.current = false));
      normalizeImages();
    },
    [restoreSelection, onChange, normalizeImages],
  );

  const insertCodeBlock = useCallback(() => {
    restoreSelection();
    const lang = window.prompt('Language (e.g. javascript, python, bash):', 'javascript') ?? 'text';
    const html = `<pre><code class="language-${lang.trim() || 'text'}">// code here</code></pre><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    isUpdatingRef.current = true;
    onChange(editorRef.current?.innerHTML ?? '');
    requestAnimationFrame(() => (isUpdatingRef.current = false));
    normalizeImages();
  }, [restoreSelection, onChange, normalizeImages]);

  const insertLink = useCallback(() => {
    restoreSelection();
    const url = window.prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  }, [restoreSelection, exec]);

  const insertImageAsBase64 = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (!base64) return;

        restoreSelection();
        const imgHtml = `<img src="${base64}" alt="${file.name.replace(/\.[^.]+$/, '')}" style="max-width:100%;height:auto;border-radius:0;object-fit:contain;transform:none;transition:none;" />`;
        document.execCommand('insertHTML', false, imgHtml);

        editorRef.current?.focus();
        isUpdatingRef.current = true;
        onChange(editorRef.current?.innerHTML ?? '');
        requestAnimationFrame(() => (isUpdatingRef.current = false));
        normalizeImages();
      };
      reader.readAsDataURL(file);
    },
    [restoreSelection, onChange, normalizeImages],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) insertImageAsBase64(file);
      e.target.value = '';
    },
    [insertImageAsBase64],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) insertImageAsBase64(blob);
          return;
        }
      }
    },
    [insertImageAsBase64],
  );

  // Click image select + start drag (custom image moving)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onMouseDown = (e: MouseEvent) => {
      if (editMode) return; // don't interfere with overlays

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const img = target.closest('img') as HTMLImageElement | null;
      if (!img) {
        setSelectedImage(null);
        return;
      }

      // select image
      e.preventDefault();
      e.stopPropagation();
      normalizeImages();
      setSelectedImage(img);
      setEditMode(null);

      // start drag-to-move
      dragImgRef.current = img;
      setIsImgDragging(true);

      // create placeholder marker (red line)
      if (!dragPlaceholderRef.current) {
        const ph = document.createElement('span');
        ph.setAttribute('data-img-drop', '1');
        ph.style.display = 'inline-block';
        ph.style.width = '2px';
        ph.style.height = '1.2em';
        ph.style.verticalAlign = 'middle';
        ph.style.background = 'var(--color-red)';
        ph.style.margin = '0 4px';
        ph.style.pointerEvents = 'none';
        dragPlaceholderRef.current = ph;
      }

      // make image look "picked up" (no scaling, just opacity)
      img.style.opacity = '0.6';
    };

    editor.addEventListener('mousedown', onMouseDown);
    return () => editor.removeEventListener('mousedown', onMouseDown);
  }, [editMode, normalizeImages]);

  // Global drag move + drop
  useEffect(() => {
    if (!isImgDragging) return;

    const onMove = (e: MouseEvent) => {
      const editor = editorRef.current;
      const img = dragImgRef.current;
      const ph = dragPlaceholderRef.current;
      if (!editor || !img || !ph) return;

      // compute caret range at pointer
      const r = getRangeFromPoint(e.clientX, e.clientY);
      if (!r) return;
      if (!editor.contains(r.startContainer)) return;

      // Insert placeholder at caret position (move it around)
      const parent = ph.parentNode;
      if (parent) parent.removeChild(ph);

      // Avoid inserting inside the dragged image itself
      const containerEl =
        r.startContainer.nodeType === Node.ELEMENT_NODE
          ? (r.startContainer as Element)
          : r.startContainer.parentElement;

      if (containerEl && containerEl.closest('img') === img) return;

      r.insertNode(ph);

      // update caretRect indicator to placeholder position
      const phRect = ph.getBoundingClientRect();
      setCaretRect(phRect as DOMRect);
    };

    const onUp = () => {
      const editor = editorRef.current;
      const img = dragImgRef.current;
      const ph = dragPlaceholderRef.current;

      setIsImgDragging(false);

      if (!editor || !img || !ph) {
        dragImgRef.current = null;
        return;
      }

      // if placeholder is in DOM, replace it with the image (move)
      if (ph.parentNode && editor.contains(ph)) {
        ph.parentNode.replaceChild(img, ph);
      }

      // cleanup
      img.style.opacity = '1';
      dragImgRef.current = null;

      // commit change
      isUpdatingRef.current = true;
      onChange(editor.innerHTML);
      requestAnimationFrame(() => (isUpdatingRef.current = false));
      normalizeImages();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isImgDragging, onChange, normalizeImages]);

  const handleDeleteImage = useCallback(() => {
    if (!selectedImage || !editorRef.current) return;
    selectedImage.remove();
    setSelectedImage(null);
    setEditMode(null);
    isUpdatingRef.current = true;
    onChange(editorRef.current.innerHTML);
    requestAnimationFrame(() => (isUpdatingRef.current = false));
  }, [selectedImage, onChange]);

  const handleCropApplied = useCallback(
    (dataUrl: string) => {
      if (!selectedImage || !editorRef.current) return;
      selectedImage.src = dataUrl;
      setEditMode(null);
      setSelectedImage(null);
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      requestAnimationFrame(() => (isUpdatingRef.current = false));
      normalizeImages();
    },
    [selectedImage, onChange, normalizeImages],
  );

  const handleResizeApplied = useCallback(
    (dataUrl: string, w: number, _h: number) => {
      if (!selectedImage || !editorRef.current) return;
      selectedImage.src = dataUrl;
      selectedImage.style.width = `${w}px`;
      selectedImage.style.height = 'auto';
      selectedImage.style.borderRadius = '0';
      setEditMode(null);
      setSelectedImage(null);
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      requestAnimationFrame(() => (isUpdatingRef.current = false));
      normalizeImages();
    },
    [selectedImage, onChange, normalizeImages],
  );

  // caret indicator should track scroll/resize
  useEffect(() => {
    const update = () => saveSelection();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [saveSelection]);

  return (
    <div
      className="border border-black/10 overflow-hidden focus-within:border-[var(--color-red)] transition-colors bg-[var(--color-white)] relative"
      style={{ borderRadius: 0 }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-black/10 bg-black/[0.02]">
        <ToolBtn onClick={() => setBlock('h1')} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock('h2')} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock('h3')} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock('h4')} title="Heading 4">
          <Heading4 className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => exec('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline">
          <Underline className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered list">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => setBlock('blockquote')} title="Blockquote">
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraph">
          <Minus className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={() => exec('insertHTML', '<code>code</code>')} title="Inline code">
          <Code className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={insertCodeBlock} title="Code block">
          <Code2 className="w-4 h-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={insertLink} title="Insert link">
          <Link className="w-4 h-4" />
        </ToolBtn>

        {selectedImage && !editMode && (
          <>
            <Divider />
            <div
              className="flex items-center gap-0.5 px-1"
              style={{ background: 'rgba(191,30,45,0.10)', borderRadius: 0 }}
            >
              <ToolBtn onClick={() => setEditMode('crop')} title="Crop">
                <Crop className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={() => setEditMode('resize')} title="Resize">
                <Maximize2 className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={handleDeleteImage} title="Delete image">
                <Trash2 className="w-4 h-4" />
              </ToolBtn>
            </div>
          </>
        )}

        <ToolBtn
          title="Insert image"
          onClick={() => fileInputRef.current?.click()}
          onMouseDownCapture={(e: any) => {
            e.preventDefault();
            saveSelection();
          }}
        >
          <Image className="w-4 h-4" />
        </ToolBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Red caret indicator (insertion cursor + drop indicator) */}
      {caretRect && (
        <div
          className="fixed z-[70] pointer-events-none"
          style={{
            left: caretRect.left,
            top: caretRect.top,
            height: Math.max(16, caretRect.height || 16),
            width: 2,
            background: 'var(--color-red)',
          }}
        />
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          handleInput();
          normalizeImages();
        }}
        onSelect={saveSelection}
        onKeyUp={() => {
          saveSelection();
          normalizeImages();
        }}
        onMouseUp={() => {
          saveSelection();
          normalizeImages();
        }}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight, borderRadius: 0 }}
        className="rich-text-editor px-5 py-4 text-[var(--color-black)] text-sm leading-relaxed outline-none prose prose-sm max-w-none"
      />

      {selectedImage && editMode === 'crop' && (
        <CropOverlay
          img={selectedImage}
          onApply={handleCropApplied}
          onCancel={() => setEditMode(null)}
        />
      )}

      {selectedImage && editMode === 'resize' && (
        <ResizeOverlay
          img={selectedImage}
          onApply={handleResizeApplied}
          onCancel={() => setEditMode(null)}
        />
      )}

      {/* Optional: during image drag show a subtle hint */}
      {isImgDragging && (
        <div
          className="fixed z-[80] pointer-events-none px-2 py-1 text-xs"
          style={{
            left: 12,
            bottom: 12,
            background: 'var(--color-black)',
            color: 'var(--color-white)',
            borderRadius: 0,
          }}
        >
          Dragging image… release to drop
        </div>
      )}
    </div>
  );
}

export async function processImagesInContent(
  content: string,
  uploadFn: (file: File) => Promise<{ url: string }>,
): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src');
    if (!src || !src.startsWith('data:')) continue;

    const res = await fetch(src);
    const blob = await res.blob();
    const file = new File([blob], 'image.png', { type: blob.type });

    try {
      const result = await uploadFn(file);
      img.setAttribute('src', result.url);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  }

  return doc.body.innerHTML;
}
