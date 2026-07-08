import { createElement, type FunctionComponent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import puppeteer, { type Browser } from "puppeteer";
import { ATSSafeTemplate } from "../../../client/src/components/templates/ATSSafeTemplate";
import { ClassicTemplate } from "../../../client/src/components/templates/ClassicTemplate";
import { MinimalTemplate } from "../../../client/src/components/templates/MinimalTemplate";
import { ModernTemplate } from "../../../client/src/components/templates/ModernTemplate";
import type { ResumeContent } from "../types";

type TemplateComponent = FunctionComponent<{ content: ResumeContent }>;

const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  modern: ModernTemplate as TemplateComponent,
  classic: ClassicTemplate as TemplateComponent,
  minimal: MinimalTemplate as TemplateComponent,
  "ats-safe": ATSSafeTemplate as TemplateComponent,
};

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

function wrapHtml(bodyMarkup: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; }
</style>
</head>
<body>${bodyMarkup}</body>
</html>`;
}

async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

export async function generateResumePdf(
  templateId: string,
  content: ResumeContent
): Promise<Buffer> {
  const Template = TEMPLATE_COMPONENTS[templateId] ?? ModernTemplate;
  const markup = renderToStaticMarkup(createElement(Template, { content }));
  return htmlToPdf(wrapHtml(markup));
}

export async function generateCoverLetterPdf(title: string, content: string): Promise<Buffer> {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px 0;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const markup = `
<div style="font-family:'Inter',sans-serif; color:#0F172A; padding:56px 64px; font-size:13px; line-height:1.7;">
  <h1 style="font-size:20px; font-weight:700; margin:0 0 24px 0;">${escapeHtml(title)}</h1>
  ${paragraphs}
</div>`;
  return htmlToPdf(wrapHtml(markup));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
