/**
 * Exports an on-screen <svg> as a PNG. CSS custom properties (design tokens) are
 * resolved at export time so the image matches the themed preview.
 */
export async function downloadSvgAsPng(svg: SVGSVGElement, filename: string, scale = 2) {
  const root = getComputedStyle(document.documentElement);
  const vb = svg.viewBox.baseVal;
  const width = vb?.width || svg.clientWidth;
  const height = vb?.height || svg.clientHeight;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.querySelectorAll("[data-export-ignore]").forEach((n) => n.remove());

  let markup = new XMLSerializer().serializeToString(clone);
  markup = markup.replace(/var\((--[\w-]+)\)/g, (_m, name: string) => root.getPropertyValue(name).trim() || "#000");

  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Görsel oluşturulamadı"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tarayıcı görsel oluşturmayı desteklemiyor");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    const png = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!png) throw new Error("Görsel oluşturulamadı");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(png);
    a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } finally {
    URL.revokeObjectURL(url);
  }
}