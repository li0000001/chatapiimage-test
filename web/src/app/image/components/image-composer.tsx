"use client";

import { ArrowUp, Check, ChevronDown, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type RefObject } from "react";

import { ImageLightbox } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ImageComposerProps = {
  isUserMode?: boolean;
  prompt: string;
  imageCount: string;
  imageSize: string;
  availableQuota: string;
  activeTaskCount: number;
  referenceImages: Array<{ name: string; dataUrl: string }>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onPromptChange: (value: string) => void;
  onImageCountChange: (value: string) => void;
  onImageSizeChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onPickReferenceImage: () => void;
  onReferenceImageChange: (files: File[]) => void | Promise<void>;
  onRemoveReferenceImage: (index: number) => void;
};

const imageSizeOptions = [
  { value: "", label: "未指定", shortLabel: "未指定" },
  { value: "1:1", label: "1:1（正方形）", shortLabel: "1:1" },
  { value: "16:9", label: "16:9（横版）", shortLabel: "16:9" },
  { value: "4:3", label: "4:3（横版）", shortLabel: "4:3" },
  { value: "3:4", label: "3:4（竖版）", shortLabel: "3:4" },
  { value: "9:16", label: "9:16（竖版）", shortLabel: "9:16" },
];

export function ImageComposer({
  isUserMode = false,
  prompt,
  imageCount,
  imageSize,
  availableQuota,
  activeTaskCount,
  referenceImages,
  textareaRef,
  fileInputRef,
  onPromptChange,
  onImageCountChange,
  onImageSizeChange,
  onSubmit,
  onPickReferenceImage,
  onReferenceImageChange,
  onRemoveReferenceImage,
}: ImageComposerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [sizeMenuPos, setSizeMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuBtnRef = useRef<HTMLButtonElement>(null);

  const lightboxImages = useMemo(
    () => referenceImages.map((image, index) => ({ id: `${image.name}-${index}`, src: image.dataUrl })),
    [referenceImages],
  );
  const selectedSize = imageSizeOptions.find((option) => option.value === imageSize) ?? imageSizeOptions[0];

  useEffect(() => {
    if (!isSizeMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sizeMenuRef.current?.contains(target) || sizeMenuBtnRef.current?.contains(target)) {
        return;
      }
      setIsSizeMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isSizeMenuOpen]);

  const handleTextareaPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    event.preventDefault();
    void onReferenceImageChange(imageFiles);
  };

  const openSizeMenu = () => {
    if (!isSizeMenuOpen && sizeMenuBtnRef.current) {
      const rect = sizeMenuBtnRef.current.getBoundingClientRect();
      const menuWidth = Math.min(220, window.innerWidth - 24);
      setSizeMenuPos({
        top: Math.max(12, rect.top - 8),
        left: Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12)),
      });
    }
    setIsSizeMenuOpen((open) => !open);
  };

  const pickImageSize = (value: string) => {
    onImageSizeChange(value);
    setIsSizeMenuOpen(false);
  };

  const sizeOptionButtons = imageSizeOptions.map((option) => {
    const active = option.value === imageSize;
    return (
      <button
        key={option.value || "default"}
        type="button"
        className={cn(
          "flex h-11 items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition",
          active
            ? "border-slate-950 bg-slate-950 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        )}
        onClick={() => pickImageSize(option.value)}
      >
        <span>{option.label}</span>
        {active ? <Check className="size-4" /> : null}
      </button>
    );
  });

  return (
    <div className="flex shrink-0 justify-center px-1 sm:px-0">
      <div className="w-full max-w-[980px]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void onReferenceImageChange(Array.from(event.target.files || []));
          }}
        />

        {referenceImages.length > 0 ? (
          <div className="mb-2 flex gap-2 overflow-x-auto px-1 pb-1 sm:mb-3 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {referenceImages.map((image, index) => (
              <div key={`${image.name}-${index}`} className="relative size-14 shrink-0 sm:size-16">
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="group size-14 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition hover:border-stone-300 sm:size-16"
                  aria-label={`预览参考图 ${image.name || index + 1}`}
                >
                  <img
                    src={image.dataUrl}
                    alt={image.name || `参考图 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveReferenceImage(index);
                  }}
                  className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-800"
                  aria-label={`移除参考图 ${image.name || index + 1}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_14px_60px_-42px_rgba(15,23,42,0.45)] sm:rounded-[32px] sm:shadow-none",
            isUserMode &&
              "border-slate-200/80 bg-white/95 shadow-[0_18px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 sm:shadow-[0_18px_80px_-48px_rgba(15,23,42,0.55)]",
          )}
        >
          <div className="relative cursor-text" onClick={() => textareaRef.current?.focus()}>
            <ImageLightbox
              images={lightboxImages}
              currentIndex={lightboxIndex}
              open={lightboxOpen}
              onOpenChange={setLightboxOpen}
              onIndexChange={setLightboxIndex}
            />

            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onPaste={handleTextareaPaste}
              placeholder={
                referenceImages.length > 0
                  ? "描述你希望如何修改参考图"
                  : "输入你想要生成的画面，也可以直接粘贴图片"
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void onSubmit();
                }
              }}
              className={cn(
                "min-h-[86px] resize-none rounded-[24px] border-0 bg-transparent px-4 pt-4 pb-2 text-[15px] leading-6 text-stone-900 shadow-none placeholder:text-stone-400 focus-visible:ring-0 sm:min-h-[148px] sm:rounded-[32px] sm:px-6 sm:pt-6 sm:pb-20 sm:leading-7",
                isUserMode && "text-slate-950 placeholder:text-slate-400 sm:min-h-[132px]",
              )}
            />

            <div
              className={cn(
                "rounded-b-[24px] border-t border-stone-100 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 sm:absolute sm:inset-x-0 sm:bottom-0 sm:rounded-b-none sm:border-t-0 sm:bg-gradient-to-t sm:from-white sm:via-white/95 sm:to-transparent sm:px-6 sm:pb-4 sm:pt-6",
                isUserMode && "border-slate-100 bg-slate-50/70 sm:from-white sm:via-white/96",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-1 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 shrink-0 rounded-full border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 shadow-none sm:h-10 sm:px-4 sm:text-sm",
                      isUserMode && "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
                    )}
                    onClick={onPickReferenceImage}
                    aria-label={referenceImages.length > 0 ? "添加参考图" : "上传"}
                  >
                    <ImagePlus className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">{referenceImages.length > 0 ? "添加参考图" : "上传"}</span>
                  </Button>

                  <div
                    className={cn(
                      "flex h-9 shrink-0 items-center rounded-full bg-stone-100 px-3 text-xs font-semibold text-stone-700 sm:h-10 sm:text-sm",
                      isUserMode && "bg-slate-100 text-slate-700",
                    )}
                  >
                    剩余额度：{availableQuota}
                  </div>

                  {activeTaskCount > 0 ? (
                    <div className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 text-xs font-semibold text-amber-700 sm:h-10 sm:gap-1.5 sm:text-sm">
                      <LoaderCircle className="size-3 animate-spin" />
                      {activeTaskCount}<span className="hidden sm:inline"> 个任务处理中</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:gap-3">
                  <div
                    className={cn(
                      "flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2 py-0.5 sm:h-auto sm:gap-2 sm:px-3 sm:py-1",
                      isUserMode && "border-slate-200",
                    )}
                  >
                    <span className="hidden text-[11px] font-medium text-stone-700 sm:inline sm:text-sm">张数</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="100"
                      step="1"
                      value={imageCount}
                      onChange={(event) => onImageCountChange(event.target.value)}
                      className="h-7 w-[42px] border-0 bg-transparent px-0 text-center text-xs font-medium text-stone-700 shadow-none focus-visible:ring-0 sm:h-8 sm:w-[64px] sm:text-sm"
                    />
                  </div>

                  <div
                    className={cn(
                      "relative flex h-10 min-w-0 flex-1 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-0.5 text-[11px] sm:h-auto sm:w-[180px] sm:flex-none sm:gap-2 sm:px-3 sm:py-1 sm:text-[13px]",
                      isUserMode && "border-slate-200",
                    )}
                  >
                    <span className="hidden font-medium text-stone-700 sm:inline sm:text-sm">比例</span>
                    <button
                      ref={sizeMenuBtnRef}
                      type="button"
                      className="flex h-8 min-w-0 flex-1 items-center justify-between bg-transparent text-left text-xs font-bold text-stone-700 sm:w-[132px] sm:flex-none"
                      onClick={openSizeMenu}
                    >
                      <span className="truncate sm:hidden">比例：{selectedSize.shortLabel}</span>
                      <span className="hidden truncate sm:inline">{selectedSize.label}</span>
                      <ChevronDown className={cn("size-4 shrink-0 opacity-60 transition", isSizeMenuOpen && "rotate-180")} />
                    </button>

                    {isSizeMenuOpen ? (
                      <div
                        ref={sizeMenuRef}
                        className="fixed z-[80] hidden max-h-[45dvh] overflow-y-auto rounded-3xl border border-white/80 bg-white p-2 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] sm:block"
                        style={{
                          top: sizeMenuPos.top,
                          left: sizeMenuPos.left,
                          transform: "translateY(-100%)",
                          width: "min(220px, calc(100vw - 1.5rem))",
                        }}
                      >
                        <div className="grid gap-1">
                          {imageSizeOptions.map((option) => {
                            const active = option.value === imageSize;
                            return (
                              <button
                                key={option.value || "default-desktop"}
                                type="button"
                                className={cn(
                                  "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100",
                                  active && "bg-stone-100 font-medium text-stone-950",
                                )}
                                onClick={() => pickImageSize(option.value)}
                              >
                                <span>{option.label}</span>
                                {active ? <Check className="size-4" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => void onSubmit()}
                    disabled={!prompt.trim()}
                    className={cn(
                      "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 sm:size-11",
                      isUserMode && "bg-slate-950 shadow-[0_14px_34px_-20px_rgba(15,23,42,0.85)] hover:bg-slate-800",
                    )}
                    aria-label={referenceImages.length > 0 ? "编辑图片" : "生成图片"}
                  >
                    <ArrowUp className="size-3.5 sm:size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSizeMenuOpen ? (
          <div className="fixed inset-0 z-[90] sm:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/35"
              aria-label="关闭比例选择"
              onClick={() => setIsSizeMenuOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] border border-white/80 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-24px_70px_-38px_rgba(15,23,42,0.55)]">
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-950">选择尺寸比例</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">当前：{selectedSize.label}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  onClick={() => setIsSizeMenuOpen(false)}
                  aria-label="关闭比例选择"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">{sizeOptionButtons}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
