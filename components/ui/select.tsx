"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Children,
  forwardRef,
  isValidElement,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/class-names";

const EMPTY_VALUE = "__printchum_empty__";

type NativeOptionProps = {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
};

type SelectProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "multiple" | "size"
>;

function encodeValue(
  value: string | number | readonly string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return encodeValue(value[0]);
  }
  if (value === undefined || String(value) === "") {
    return EMPTY_VALUE;
  }
  return String(value);
}

function decodeValue(value: string): string {
  return value === EMPTY_VALUE ? "" : value;
}

function createChangeEvent(
  name: string | undefined,
  value: string,
): ChangeEvent<HTMLSelectElement> {
  return {
    target: { name, value },
    currentTarget: { name, value },
    type: "change",
  } as unknown as ChangeEvent<HTMLSelectElement>;
}

function collectOptions(children: ReactNode): ReactElement<NativeOptionProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<NativeOptionProps>(child)) {
      return [];
    }
    if (child.type === "option") {
      return [child];
    }
    if (child.type === "optgroup") {
      return collectOptions(child.props.children);
    }
    return [];
  });
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-required": ariaRequired,
      autoFocus,
      children,
      className,
      defaultValue,
      disabled,
      id,
      name,
      onBlur,
      onChange,
      required,
      title,
      value,
    },
    ref,
  ) {
    const options = collectOptions(children);
    const controlledValue =
      value === undefined ? undefined : encodeValue(value);
    const initialValue =
      defaultValue === undefined
        ? undefined
        : encodeValue(defaultValue);

    return (
      <SelectPrimitive.Root
        value={controlledValue}
        defaultValue={initialValue}
        disabled={disabled}
        name={name}
        required={required}
        onValueChange={(nextValue) => {
          onChange?.(
            createChangeEvent(name, decodeValue(nextValue)),
          );
        }}
      >
        <SelectPrimitive.Trigger
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-required={ariaRequired}
          autoFocus={autoFocus}
          ref={ref}
          id={id}
          title={title}
          onBlur={(event) =>
            onBlur?.(
              event as unknown as FocusEvent<HTMLSelectElement>,
            )
          }
          className={cn(
            "group flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 text-left text-sm font-medium text-[var(--gray-800)] outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--gray-300)] hover:bg-[var(--gray-100)] focus-visible:border-[var(--gray-400)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ink)_14%,transparent)] data-[state=open]:border-[var(--gray-400)] data-[state=open]:bg-[var(--surface)] data-[state=open]:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ink)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className="mr-0.5 size-3.5 shrink-0 text-[var(--gray-500)] transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className="z-[70] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px] border border-[var(--gray-300)] bg-[var(--surface)] text-[var(--ink)] shadow-[0_18px_48px_-18px_rgba(0,0,0,0.5)] data-[state=closed]:animate-out data-[state=open]:animate-in"
          >
            <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center bg-[var(--surface)] text-[var(--gray-500)]">
              <ChevronUp className="size-3.5" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option, index) => {
                const optionValue = encodeValue(option.props.value);
                return (
                  <SelectPrimitive.Item
                    key={`${optionValue}-${index}`}
                    value={optionValue}
                    disabled={option.props.disabled}
                    className="relative flex min-h-8 cursor-default select-none items-center rounded-md py-1.5 pl-2.5 pr-8 text-sm font-medium text-[var(--gray-700)] outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[var(--gray-100)] data-[highlighted]:text-[var(--ink)] data-[state=checked]:text-[var(--ink)]"
                  >
                    <SelectPrimitive.ItemText>
                      {option.props.children}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex items-center justify-center">
                      <Check className="size-3.5" strokeWidth={2} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center bg-[var(--surface)] text-[var(--gray-500)]">
              <ChevronDown className="size-3.5" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);

Select.displayName = "Select";
