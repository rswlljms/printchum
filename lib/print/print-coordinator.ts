import type { PdfExportResult } from "@/lib/pdf/types";

export type PrintSession = {
  dispose: () => void;
};

export function printPdfResult(result: PdfExportResult): Promise<PrintSession> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(result.blob);
    const frame = document.createElement("iframe");
    frame.title = "PrintChum print document";
    frame.hidden = true;
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
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        resolve({ dispose });
        setTimeout(dispose, 60_000);
      } catch {
        dispose();
        reject(
          new Error(
            "The browser could not open the print dialog. Download the PDF and print it manually.",
          ),
        );
      }
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
