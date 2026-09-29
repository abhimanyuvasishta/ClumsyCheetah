"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintBillBar({ autoPrint = false }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    const id = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(id);
  }, [autoPrint]);

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <Button type="button" onClick={() => window.print()}>
        <Printer data-icon="inline-start" />
        Print bill
      </Button>
      <p className="text-xs text-muted-foreground">
        Opens this computer’s print dialog. Pick a USB, AirPrint, or Wi‑Fi printer already installed on the device.
      </p>
    </div>
  );
}
