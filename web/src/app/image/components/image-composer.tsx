"use client";
import { ArrowUp, Check, ChevronDown, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type RefObject } from "react";

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
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [isSizeDrawerClosing, setIsSizeDrawerClosing] = useState(false);
  const sizeDrawerAnimRef = useRef<number | null>(null);
  const lightboxImages = useMemo(
    () => referenceImages.map((image, index) => ({ id: `${image.name}-${index}`, src: image.dataUrl })),
    [referenceImages],
  );
  const imageSizeOptions = [
    { value: "", label: "未指定" },
    { value: "1:1", label: "1:1 (正方形)" },
    { value: "16:9", label: "16:9 (横版)" },
    { value: "4:3", label: "4:3 (横版)" },
    { value: "3:4", label: "3:4 (竖版)" },
    { value: "9:16", label: "9:16 (竖版)" },
  ];
  const imageSizeLabel = imageSizeOptions.find((option) => option.value === imageSize)?.label || "未指定";

  const openSizeDrawer = useCallback(() => {
    setIsSizeDrawerClosing(false);
    setIsSizeDrawerOpen(true);
  }, []);

  const closeSizeDrawer = useCallback(() => {
    setIsSizeDrawerClosing(true);
    if (sizeDrawerAnimRef.current) {
      cancelAnimationFrame(sizeDrawerAnimRef.current);
    }
    sizeDrawerAnimRef.current = window.setTimeout(() => {
      setIsSizeDrawerOpen(false);
      setIsSizeDrawerClosing(false);
      sizeDrawerAnimRef.current = null;
    }, 220);
  }, []);

  const handleSelectSize = useCallback(
    (value: string) => {
      onImageSizeChange(value);
      closeSizeDrawer();
    },
    [onImageSizeChange, closeSizeDrawer],
  );

  useEffect(() => {
    return () => {
      if (sizeDrawerAnimRef.current) {
        clearTimeout(sizeDrawerAnimRef.current);
      }
    };
  }, []);

  const handleTextareaPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      return;
    }

    event.preventDefault();
    void onReferenceImageChange(imageFiles);
  };

  return (
    <>
      <div
        className={cn(
          "shrink-0 sm:relative",
          "fixed inset-x-0 bottom-0 z-30",
          "pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
          "bg-gradient-to-t from-white via-white/97 to-white/90 backdrop-blur-xl",
          "border-t border-stone-200/60",
          "sm:static sm:border-t-0 sm:bg-transparent sm:pb-0 sm:backdrop-blur-none sm:from-transparent",
        )}
      >
        <div className="flex justify-center px-2 pt-2 sm:px-0 sm:pt-0">
          <div style={{ width: "min(980px, 100%)" }}>
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
              <div className="mb-1.5 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:mb-3 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {referenceImages.map((image, index) => (
                  <div key={`${image.name}-${index}`} className="relative size-12 shrink-0 sm:size-16">
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxIndex(index);
                        setLightboxOpen(true);
                      }}
                      className="group size-12 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 transition hover:border-stone-300 sm:size-16 sm:rounded-2xl"
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
                "overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.25)] sm:rounded-[32px] sm:shadow-none",
                isUserMode &&
                  "border-slate-200/80 bg-white/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.3)] ring-1 ring-white/70 sm:shadow-[0_18px_80px_-48px_rgba(15,23,42,0.55)]",
              )}
            >
              <div
                className="relative cursor-text"
                onClick={() => {
                  textareaRef.current?.focus();
                }}
              >
                <ImageLightbox
                  images={lightboxImages}
                  currentIndex={lightboxIndex}
                  open={lightboxOpen}
                  onOpenChange={setLightboxOpen}
                  onIndexChange={setLightboxIndex}
                />
                <div className="flex items-end gap-2 px-3 pt-2.5 sm:px-6 sm:pt-6">
                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => onPromptChange(event.target.value)}
                    onPaste={handleTextareaPaste}
                    placeholder={
                      referenceImages.length > 0
                        ? "描述你希望如何修改参考图"
                        : "输入你想要生成的画面，也可直接粘贴图片"
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void onSubmit();
                      }
                    }}
                    className={cn(
                      "min-h-[44px] flex-1 resize-none rounded-[20px] border-0 bg-transparent px-1 pt-0 pb-0 text-[15px] leading-6 text-stone-900 shadow-none placeholder:text-stone-400 focus-visible:ring-0 sm:min-h-[148px] sm:rounded-[32px] sm:px-0 sm:pt-0 sm:pb-20 sm:leading-7",
                      isUserMode && "text-slate-950 placeholder:text-slate-400 sm:min-h-[132px]",
                    )}
                  />
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

                <div
                  className={cn(
                    "border-t border-stone-100 px-3 pb-3 pt-2 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-t-0 sm:bg-gradient-to-t sm:from-white sm:via-white/95 sm:to-transparent sm:px-6 sm:pb-4 sm:pt-6",
                    isUserMode && "border-slate-100 bg-slate-50/70 sm:from-white sm:via-white/96",
                  )}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="hide-scrollbar flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-8 shrink-0 rounded-full border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-700 shadow-none sm:h-10 sm:px-4 sm:text-sm",
                          isUserMode && "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
                        )}
                        onClick={onPickReferenceImage}
                        aria-label={referenceImages.length > 0 ? "添加参考图" : "上传"}
                      >
                        <ImagePlus className="size-3.5 sm:size-4" />
                        <span className="ml-1 hidden sm:inline">{referenceImages.length > 0 ? "添加参考图" : "上传"}</span>
                      </Button>
                      <div
                        className={cn(
                          "flex h-8 shrink-0 items-center rounded-full bg-stone-100 px-2.5 text-[10px] font-medium text-stone-600 sm:h-auto sm:px-3 sm:py-2 sm:text-xs",
                          isUserMode && "bg-slate-100 text-slate-600",
                        )}
                      >
                        {availableQuota}
                      </div>
                      {activeTaskCount > 0 && (
                        <div className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-[10px] font-medium text-amber-700 sm:h-auto sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs">
                          <LoaderCircle className="size-3 animate-spin" />
                          {activeTaskCount}
                        </div>
                      )}
                      <div
                        className={cn(
                          "flex h-8 shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-white px-2 sm:h-auto sm:gap-2 sm:px-3 sm:py-1",
                          isUserMode && "border-slate-200",
                        )}
                      >
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="100"
                          step="1"
                          value={imageCount}
                          onChange={(event) => onImageCountChange(event.target.value)}
                          className="h-6 w-[36px] border-0 bg-transparent px-0 text-center text-xs font-medium text-stone-700 shadow-none focus-visible:ring-0 sm:h-8 sm:w-[64px] sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={openSizeDrawer}
                        className={cn(
                          "flex h-8 shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-700 transition active:bg-stone-50 sm:h-auto sm:gap-2 sm:px-3 sm:py-1 sm:text-[13px]",
                          isUserMode && "border-slate-200",
                        )}
                      >
                        <span className="max-w-[72px] truncate sm:max-w-none">{imageSizeLabel}</span>
                        <ChevronDown className="size-3.5 shrink-0 opacity-50 sm:size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSizeDrawerOpen ? (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={closeSizeDrawer}>
          <div
            className={cn(
              "absolute inset-0 bg-black/30",
              isSizeDrawerClosing ? "animate-out fade-out-0" : "animate-in fade-in-0",
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pt-5 shadow-[0_-12px_60px_-24px_rgba(15,23,42,0.3)]",
              isSizeDrawerClosing ? "animate-out slide-out-to-bottom" : "animate-in slide-in-from-bottom",
            )}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-200" />
            <div className="mb-3 text-sm font-semibold text-stone-500">选择图片比例</div>
            <div className="grid grid-cols-3 gap-2">
              {imageSizeOptions.map((option) => {
                const active = option.value === imageSize;
                return (
                  <button
                    key={option.label}
                    type="button"
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-center transition",
                      active
                        ? "bg-stone-950 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100",
                    )}
                    onClick={() => handleSelectSize(option.value)}
                  >
                    <span className="text-[13px] font-bold">{option.value || "默认"}</span>
                    <span className="text-[10px] opacity-70">
                      {option.value === "1:1"
                        ? "正方形"
                        : option.value === "16:9"
                          ? "横版"
                          : option.value === "4:3"
                            ? "横版"
                            : option.value === "3:4"
                              ? "竖版"
                              : option.value === "9:16"
                                ? "竖版"
                                : "自适应"}
                    </span>
                    {active ? <Check className="mt-0.5 size-4" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
