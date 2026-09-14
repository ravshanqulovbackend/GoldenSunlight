"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type KeyboardEvent,
  type OptionHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
}

interface OptionData {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function extractOptions(children: ReactNode): OptionData[] {
  const options: OptionData[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === "option") {
      const option = child as ReactElement<OptionHTMLAttributes<HTMLOptionElement>>;
      options.push({
        value: String(option.props.value ?? ""),
        label: option.props.children,
        disabled: option.props.disabled,
      });
    }
  });
  return options;
}

/**
 * Custom-styled stand-in for a native <select> — the browser/OS renders a native
 * <select>'s open dropdown itself and it can't be restyled with CSS, so a real
 * listbox (button + ARIA listbox popup) is built here instead. Callers keep using
 * it exactly like a native select (value/onChange/children as <option>).
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, label, id, children, value, onChange, disabled, name, "aria-label": ariaLabel, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? name ?? generatedId;
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const options = useMemo(() => extractOptions(children), [children]);
    const selectedIndex = options.findIndex((option) => option.value === String(value ?? ""));
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    useEffect(() => {
      if (!open) return;
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
      if (open) setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const item = listRef.current?.children[highlighted] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }, [highlighted, open]);

    function commit(index: number) {
      const option = options[index];
      if (!option || option.disabled) return;
      setOpen(false);
      if (onChange && option.value !== String(value ?? "")) {
        onChange({ target: { value: option.value, name } } as ChangeEvent<HTMLSelectElement>);
      }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      if (disabled) return;
      if (!open) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          setOpen(true);
        }
        return;
      }
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          setHighlighted((h) => Math.min(h + 1, options.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlighted((h) => Math.max(h - 1, 0));
          break;
        case "Home":
          event.preventDefault();
          setHighlighted(0);
          break;
        case "End":
          event.preventDefault();
          setHighlighted(options.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          commit(highlighted);
          break;
        default:
          break;
      }
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="label-md text-on-surface-variant">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
            ref={ref}
            type="button"
            id={inputId}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={ariaLabel}
            onClick={() => !disabled && setOpen((v) => !v)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 body-md text-on-surface",
              "transition-[border-color,box-shadow,background-color] duration-250 ease-soft",
              "hover:border-outline focus:outline-none focus:ring-2 focus:ring-secondary-fixed-dim",
              open ? "border-secondary ring-2 ring-secondary-fixed-dim" : "focus:border-secondary",
              disabled && "cursor-not-allowed opacity-60",
              className
            )}
          >
            <span className="truncate text-start">{selected?.label ?? " "}</span>
            <Icon
              name="expand_more"
              className={cn("shrink-0 text-[20px] text-on-surface-variant transition-transform duration-300 ease-spring", open && "rotate-180")}
            />
          </button>

          {open && (
            <ul
              ref={listRef}
              role="listbox"
              aria-activedescendant={options.length ? `${inputId}-option-${highlighted}` : undefined}
              className="absolute z-50 mt-1 max-h-64 w-full min-w-max origin-top animate-scale-in overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-xl"
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${inputId}-option-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-4 py-2.5 body-md text-on-surface",
                    "transition-[background-color,padding] duration-150 ease-soft hover:ps-5",
                    index === highlighted && "bg-surface-container-high",
                    option.disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Icon
                    name="check"
                    className={cn("shrink-0 text-[16px] text-primary", index !== selectedIndex && "invisible")}
                  />
                  <span className="truncate">{option.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";
