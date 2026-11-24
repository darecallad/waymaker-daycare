"use client";

/**
 * Form controls of the partner application. Every choice is a real radio or checkbox inside
 * its label, every message is tied to its control with aria-describedby, and every target
 * is at least 44px high.
 */
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const fieldId = (name: string) => `pa-${name.replace(".", "-")}`;
const errorId = (name: string) => `${fieldId(name)}-error`;
const hintId = (name: string) => `${fieldId(name)}-hint`;
const describedBy = (...ids: (string | false | null | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

const labelClass = "block text-[15px] font-semibold text-ink";
const legendClass = "mb-2 block text-[15px] font-semibold text-ink";
const controlClass = (invalid: boolean, warning = false) =>
  cn(
    "mt-2 block min-h-12 w-full rounded-xl bg-white px-4 py-3 text-base text-text placeholder:text-text-3 focus-visible:border-ink",
    invalid ? "border-2 border-error" : warning ? "border-[1.5px] border-amber" : "border-[1.5px] border-field hover:border-text-2",
  );
const choiceFocus = "has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus";

export interface LabelText {
  required?: boolean;
  /** "(required)" / "(optional)" in the page language. */
  marks: { required: string; optional: string };
}

/** `*` for sighted users; text controls also carry `required`, groups get the word for screen readers. */
function Mark({ required, marks, group }: LabelText & { group?: boolean }) {
  if (!required) return <span className="ml-1 text-sm font-medium text-text-2">{marks.optional}</span>;
  return (
    <>
      <span aria-hidden="true" className="ml-1 text-error">*</span>
      {group && <span className="sr-only"> {marks.required}</span>}
    </>
  );
}

export function FieldMessage({ id, message, tone = "error" }: { id: string; message?: string | null; tone?: "error" | "warning" }) {
  if (!message) return null;
  return (
    <p id={id} className={cn("mt-1.5 flex items-start gap-1.5 text-sm font-semibold", tone === "error" ? "text-error" : "text-amber")}>
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function Hint({ name, children }: { name: string; children?: ReactNode }) {
  if (!children) return null;
  return <p id={hintId(name)} className="mt-1.5 text-sm text-text-2">{children}</p>;
}

interface TextFieldProps extends LabelText, Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "required"> {
  name: string;
  label: string;
  value: string;
  onValue: (value: string) => void;
  error?: string | null;
  warning?: string | null;
  hint?: ReactNode;
}

export function TextField({ name, label, value, onValue, error, warning, hint, required, marks, ...input }: TextFieldProps) {
  const id = fieldId(name);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        <Mark required={required} marks={marks} />
      </label>
      <input
        id={id}
        name={name}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint !== undefined && hintId(name), (error || warning) && errorId(name))}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onValue(event.target.value)}
        className={controlClass(Boolean(error), Boolean(warning))}
        {...input}
      />
      <FieldMessage id={errorId(name)} message={error ?? warning} tone={error ? "error" : "warning"} />
      <Hint name={name}>{hint}</Hint>
    </div>
  );
}

interface SelectFieldProps extends LabelText {
  name: string;
  label: string;
  value: string;
  onValue: (value: string) => void;
  onBlur?: () => void;
  options: { value: string; label: string }[];
  placeholder: string;
  error?: string | null;
  autoComplete?: string;
}

export function SelectField({ name, label, value, onValue, onBlur, options, placeholder, error, required, marks, autoComplete }: SelectFieldProps) {
  const id = fieldId(name);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        <Mark required={required} marks={marks} />
      </label>
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId(name) : undefined}
        onChange={(event) => onValue(event.target.value)}
        onBlur={onBlur}
        className={controlClass(Boolean(error))}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <FieldMessage id={errorId(name)} message={error} />
    </div>
  );
}

interface TextAreaFieldProps extends LabelText {
  name: string;
  label: string;
  value: string;
  onValue: (value: string) => void;
  onBlur?: () => void;
  maxLength: number;
  count: string;
  error?: string | null;
}

export function TextAreaField({ name, label, value, onValue, onBlur, maxLength, count, error, required, marks }: TextAreaFieldProps) {
  const id = fieldId(name);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        <Mark required={required} marks={marks} />
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        rows={4}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hintId(name), error && errorId(name))}
        onChange={(event) => onValue(event.target.value)}
        onBlur={onBlur}
        className={cn(controlClass(Boolean(error)), "min-h-[120px] resize-y")}
      />
      <FieldMessage id={errorId(name)} message={error} />
      <p id={hintId(name)} className="mt-1.5 text-right text-sm text-text-2">{count}</p>
    </div>
  );
}

interface GroupProps<T extends string | number> extends LabelText {
  name: string;
  legend: string;
  hint?: ReactNode;
  error?: string | null;
  options: { value: T; label: string; hint?: string; lang?: string }[];
  onBlur?: () => void;
  className?: string;
}

function Group<T extends string | number>({ name, legend, hint, error, required, marks, children, className }: GroupProps<T> & { children: ReactNode }) {
  return (
    <fieldset aria-describedby={describedBy(hint !== undefined && hintId(name), error && errorId(name))} className={className}>
      <legend className={legendClass}>
        {legend}
        <Mark required={required} marks={marks} group />
      </legend>
      <Hint name={name}>{hint}</Hint>
      <FieldMessage id={errorId(name)} message={error} />
      {children}
    </fieldset>
  );
}

/** One choice as a large tile: radio + bold label + one line of explanation. */
export function ChoiceTiles({ value, onValue, ...props }: GroupProps<string> & { value: string; onValue: (value: string) => void }) {
  return (
    <Group {...props}>
      <div className="mt-1 grid gap-3 md:grid-cols-2">
        {props.options.map((option, index) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-field bg-white p-4 hover:border-text-2 has-[:checked]:border-2 has-[:checked]:border-link has-[:checked]:bg-mint-tint has-[:checked]:p-[15.5px]",
              choiceFocus,
            )}
          >
            <input
              type="radio"
              id={index === 0 ? fieldId(props.name) : undefined}
              name={props.name}
              value={option.value}
              checked={value === option.value}
              required={props.required}
              onChange={() => onValue(option.value)}
              onBlur={props.onBlur}
              className="mt-0.5 h-5 w-5 shrink-0 accent-link focus-visible:outline-none"
            />
            <span>
              <span className="block font-semibold text-ink">{option.label}</span>
              {option.hint && <span className="block text-sm text-text-2">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </Group>
  );
}

/** Short radio choices in a row, e.g. role or reply language. */
export function RadioPills({ value, onValue, ...props }: GroupProps<string> & { value: string; onValue: (value: string) => void }) {
  return (
    <Group {...props}>
      <div className="mt-1 flex flex-wrap gap-3">
        {props.options.map((option, index) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-field bg-white px-4 hover:border-text-2 has-[:checked]:border-link has-[:checked]:bg-mint-tint",
              choiceFocus,
            )}
          >
            <input
              type="radio"
              id={index === 0 ? fieldId(props.name) : undefined}
              name={props.name}
              value={option.value}
              checked={value === option.value}
              required={props.required}
              onChange={() => onValue(option.value)}
              onBlur={props.onBlur}
              className="h-4 w-4 accent-link focus-visible:outline-none"
            />
            <span lang={option.lang}>{option.label}</span>
          </label>
        ))}
      </div>
    </Group>
  );
}

/** Multiple choice as pills: real checkboxes, visually hidden, with the pill as the label. */
export function Chips<T extends string | number>({ values, onValues, ...props }: GroupProps<T> & { values: T[]; onValues: (values: T[]) => void }) {
  return (
    <Group {...props}>
      <div className="mt-1 flex flex-wrap gap-2">
        {props.options.map((option, index) => {
          const checked = values.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors motion-reduce:transition-none",
                checked ? "border-ink bg-ink text-white" : "border-field bg-white text-ink hover:bg-mint-tint",
                choiceFocus,
              )}
            >
              <input
                type="checkbox"
                id={index === 0 ? fieldId(props.name) : undefined}
                name={props.name}
                value={String(option.value)}
                checked={checked}
                onChange={() => onValues(checked ? values.filter((v) => v !== option.value) : [...values, option.value])}
                onBlur={props.onBlur}
                className="sr-only"
              />
              {checked && <Check aria-hidden="true" className="h-4 w-4" />}
              {option.label}
            </label>
          );
        })}
      </div>
    </Group>
  );
}

export function ConsentCheckbox({ name, label, checked, onChecked, error, marks }: {
  name: string;
  label: string;
  checked: boolean;
  onChecked: (checked: boolean) => void;
  error?: string | null;
  marks: LabelText["marks"];
}) {
  return (
    <div>
      <label className="grid cursor-pointer grid-cols-[24px_1fr] items-start gap-3 py-1 text-[15px] text-text">
        <input
          type="checkbox"
          id={fieldId(name)}
          name={name}
          checked={checked}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId(name) : undefined}
          onChange={(event) => onChecked(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-link"
        />
        <span>
          {label}
          <Mark required marks={marks} />
        </span>
      </label>
      <FieldMessage id={errorId(name)} message={error} />
    </div>
  );
}
