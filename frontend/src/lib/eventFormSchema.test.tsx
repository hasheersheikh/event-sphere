// Regression guard for the multi-slot "Please add at least one time slot" bug.
// Root cause: CreateEventPage/EditEventPage registered their own
// useFieldArray for the same names ("slots", "days", "lineup",
// "ticketTypes") as the step components. With react-hook-form 7.61, a
// second field-array instance on the same control does not observe appends
// made through the first — the page-level copy stays empty and the step
// guard rejected valid forms. The pages now read counts via
// form.getValues() instead, which this test proves stays in sync.
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, useFormContext, useFieldArray, FormProvider } from "react-hook-form";

type Values = { slots: { startTime: string; endTime?: string; label?: string }[] };

// Mirrors CreateEventScheduleStep — owns the only useFieldArray for "slots"
function StepComponent() {
  const form = useFormContext<Values>();
  const { fields, append } = useFieldArray({ name: "slots", control: form.control });
  return (
    <div>
      <div data-testid="child-count">{fields.length}</div>
      <button onClick={() => append({ startTime: "09:00", endTime: "11:00", label: "" })}>add</button>
    </div>
  );
}

let readSlots: (() => Values["slots"]) | null = null;

// Mirrors the page-level guard source: form.getValues("slots")
function Page() {
  const form = useForm<Values>({ defaultValues: { slots: [] } });
  readSlots = () => form.getValues("slots") || [];
  return (
    <FormProvider {...form}>
      <StepComponent />
    </FormProvider>
  );
}

describe("multi-slot step guard", () => {
  it("slot count read via getValues reflects slots added in the step component", () => {
    render(<Page />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("child-count").textContent).toBe("2");
    expect(readSlots!().length).toBe(2);
    expect(readSlots!()[1].startTime).toBe("09:00");
  });
});
