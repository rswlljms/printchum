import type { PdfExportResult } from "@/lib/pdf/types";

export type PrintSession = {
  dispose: () => void;
};

export function printPdfResult(result: PdfExportResult): Promise<PrintSession> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(result.blob);
    const frame = document.createElement("iframe");
    frame.title = "PrintChum print document";
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    frame.src = objectUrl;
    document.body.append(frame);
    let disposed = false;
    const dispose = (): void => {
      if (disposed) {
        return;
      }
      disposed = true;
      frame.remove();
      URL.revokeObjectURL(objectUrl);
    };
    frame.onload = () => {
      window.setTimeout(() => {
        try {
          const printWindow = frame.contentWindow;
          if (!printWindow) {
            throw new Error("The print frame is unavailable.");
          }
          printWindow.focus();
          printWindow.print();
          resolve({ dispose });
          window.setTimeout(dispose, 60_000);
        } catch {
          dispose();
          reject(
            new Error(
              "The browser could not open the print dialog. Download the PDF and print it manually.",
            ),
          );
        }
      }, 250);
    };
    frame.onerror = () => {
      dispose();
      reject(
        new Error(
          "The print document could not be opened. Download the PDF and print it manually.",
        ),
      );
    };
  });
}
