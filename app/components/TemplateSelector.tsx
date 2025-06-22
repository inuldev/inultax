"use client";

import { Check, Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AVAILABLE_TEMPLATES,
  PdfTemplateType,
} from "../utils/pdf-templates/template-factory";

interface TemplateSelectorProps {
  selectedTemplate: PdfTemplateType;
  onTemplateChange: (template: PdfTemplateType) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pilih Template PDF</h3>
          <p className="text-sm text-muted-foreground">
            Pilih desain template untuk invoice PDF Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Preview Image Placeholder */}
              <div className="relative mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-xs text-gray-600">Preview</div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {template.features.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.features.length - 2} lainnya
                  </Badge>
                )}
              </div>

              {/* Preview Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{template.name}</DialogTitle>
                    <DialogDescription>
                      {template.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Large Preview */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">📄</div>
                        <div className="text-sm text-gray-600">
                          Preview {template.name}
                        </div>
                      </div>
                    </div>

                    {/* All Features */}
                    <div>
                      <h4 className="font-semibold mb-2">Fitur Template:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Select Button */}
                    <Button
                      className="w-full"
                      onClick={() => {
                        onTemplateChange(template.id);
                      }}
                      disabled={selectedTemplate === template.id}
                    >
                      {selectedTemplate === template.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Template Terpilih
                        </>
                      ) : (
                        "Pilih Template Ini"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="font-medium">Template Terpilih:</span>
            <span className="text-primary">
              {AVAILABLE_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
