"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AppImage } from "@/components/ui/AppImage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface MessageComposerProps {
  onSend: (payload: { message?: string; image?: File }) => void;
  isSending: boolean;
  placeholder?: string;
  /** Admin thread only (`ConversationThread`) — the customer-facing panel never
   * passes this, so the AI-suggest button only ever appears for admins. Never
   * sends anything itself; it only fills the text field for the admin to edit. */
  onSuggest?: () => Promise<string>;
  isSuggesting?: boolean;
}

export function MessageComposer({
  onSend,
  isSending,
  placeholder = "Write a message...",
  onSuggest,
  isSuggesting,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be uploaded");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must not exceed 5MB");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSend() {
    if (!text.trim() && !imageFile) return;
    onSend({ message: text.trim() || undefined, image: imageFile ?? undefined });
    setText("");
    clearImage();
  }

  async function handleSuggest() {
    if (!onSuggest) return;
    setError(null);
    try {
      const draft = await onSuggest();
      setText(draft);
    } catch {
      // Xatolik toast orqali (chaqiruvchi `useSuggestReply`ning `onError`i) allaqachon
      // ko'rsatilgan — bu yerda faqat matnni to'ldirmasdan qoldiramiz.
    }
  }

  return (
    <div className="border-t border-outline-variant bg-surface-container-lowest p-4">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-outline-variant">
            <AppImage src={imagePreview} alt="" className="h-full w-full" />
          </div>
          <button type="button" onClick={clearImage} className="label-sm text-error">
            Remove
          </button>
        </div>
      )}
      {error && <p className="label-sm mb-2 text-error">{error}</p>}
      <div className="flex items-end gap-2">
        <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
          <Icon name="attach_file" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        {onSuggest && (
          <button
            type="button"
            onClick={handleSuggest}
            disabled={isSuggesting}
            aria-label="Suggest an AI reply"
            title="Suggest an AI reply — you review and edit before sending"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container disabled:opacity-40"
          >
            <Icon name={isSuggesting ? "hourglass_empty" : "auto_awesome"} />
          </button>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-32 flex-1 resize-none rounded-lg border border-outline-variant bg-surface px-4 py-2.5 body-md text-on-surface focus:border-secondary focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !imageFile)}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40"
        >
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
}
