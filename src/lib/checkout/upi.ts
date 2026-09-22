export function rupeesForUpi(paise: number): string {
  return (Math.round(paise) / 100).toFixed(2);
}

export function buildUpiPayUrl(input: {
  vpa: string;
  payeeName: string;
  amountPaise: number;
  note: string;
}): string | null {
  const pa = input.vpa.trim();
  if (!pa || !pa.includes("@")) return null;
  const params = new URLSearchParams({
    pa,
    pn: input.payeeName.trim() || "Clumsy Cheetah",
    am: rupeesForUpi(input.amountPaise),
    cu: "INR",
    tn: input.note.slice(0, 50),
  });
  return `upi://pay?${params.toString()}`;
}

export function upiQrImageSrc(upiUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}`;
}
