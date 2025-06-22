import { BasePdfTemplate, InvoiceData } from "./base-template";
import { ModernBlueTemplate } from "./modern-blue-template";
import { ClassicMinimalTemplate } from "./classic-minimal-template";
import { ProfessionalDarkTemplate } from "./professional-dark-template";
import { CreativeColorfulTemplate } from "./creative-colorful-template";

export type PdfTemplateType =
  | "MODERN_BLUE"
  | "CLASSIC_MINIMAL"
  | "PROFESSIONAL_DARK"
  | "CREATIVE_COLORFUL";

export interface TemplateInfo {
  id: PdfTemplateType;
  name: string;
  description: string;
  preview: string; // URL untuk preview image
  features: string[];
}

export const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  {
    id: "MODERN_BLUE",
    name: "Modern Blue",
    description: "Template modern dengan aksen biru yang profesional dan clean",
    preview: "/templates/modern-blue-preview.png",
    features: [
      "Header biru elegant",
      "Layout terstruktur",
      "Alternating row colors",
      "Professional footer",
    ],
  },
  {
    id: "CLASSIC_MINIMAL",
    name: "Classic Minimal",
    description:
      "Template klasik minimalis dengan desain yang bersih dan sederhana",
    preview: "/templates/classic-minimal-preview.png",
    features: [
      "Desain minimalis",
      "Typography klasik",
      "Layout sederhana",
      "Fokus pada konten",
    ],
  },
  {
    id: "PROFESSIONAL_DARK",
    name: "Professional Dark",
    description: "Template profesional dengan tema gelap dan aksen merah",
    preview: "/templates/professional-dark-preview.png",
    features: [
      "Dark theme",
      "Red accent colors",
      "Corporate look",
      "Premium feel",
    ],
  },
  {
    id: "CREATIVE_COLORFUL",
    name: "Creative Colorful",
    description:
      "Template kreatif dengan warna-warna cerah dan elemen visual menarik",
    preview: "/templates/creative-colorful-preview.png",
    features: [
      "Rainbow colors",
      "Creative elements",
      "Emoji icons",
      "Fun design",
    ],
  },
];

export class PdfTemplateFactory {
  static createTemplate(
    templateType: PdfTemplateType,
    data: InvoiceData
  ): BasePdfTemplate {
    switch (templateType) {
      case "MODERN_BLUE":
        return new ModernBlueTemplate(data);
      case "CLASSIC_MINIMAL":
        return new ClassicMinimalTemplate(data);
      case "PROFESSIONAL_DARK":
        return new ProfessionalDarkTemplate(data);
      case "CREATIVE_COLORFUL":
        return new CreativeColorfulTemplate(data);
      default:
        // Default fallback ke Modern Blue
        return new ModernBlueTemplate(data);
    }
  }

  static getTemplateInfo(
    templateType: PdfTemplateType
  ): TemplateInfo | undefined {
    return AVAILABLE_TEMPLATES.find((template) => template.id === templateType);
  }

  static getAllTemplates(): TemplateInfo[] {
    return AVAILABLE_TEMPLATES;
  }
}
