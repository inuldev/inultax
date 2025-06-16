"use client";

import { useForm } from "@conform-to/react";
import { CalendarIcon, PlusIcon, TrashIcon } from "lucide-react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SubmitButton } from "./SubmitButtons";

import { editInvoice } from "../actions";
import { invoiceSchema } from "../utils/zodSchemas";
import { Prisma } from "../../lib/generated/prisma";
import { formatCurrency } from "../utils/formatCurrency";

interface InvoiceItem {
  description: string;
  quantity: string;
  rate: string;
}

// Komponen AutoResize Textarea
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(
      Math.max(e.target.scrollHeight, 60),
      120
    )}px`;
    onChange(e);
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={2}
      className="min-h-[60px] max-h-[120px] resize-none overflow-hidden"
      style={{ height: "60px" }}
    />
  );
}

interface iAppProps {
  data: Prisma.InvoiceGetPayload<{
    include: {
      items: true;
    };
  }>;
}

export function EditInvoice({ data }: iAppProps) {
  const [lastResult, action] = useActionState(editInvoice, undefined);

  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: invoiceSchema.omit({ items: true }),
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [selectedDate, setSelectedDate] = useState(data.date);
  const [currency, setCurrency] = useState(data.currency);
  const [items, setItems] = useState<InvoiceItem[]>(
    data.items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toString(),
      rate: item.rate.toString(),
    }))
  );

  const calculateTotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return total + quantity * rate;
  }, 0);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input
            type="hidden"
            name={fields.date.name}
            value={selectedDate.toISOString()}
          />
          <input type="hidden" name="id" value={data.id} />

          <input
            type="hidden"
            name={fields.total.name}
            value={calculateTotal}
          />

          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Draft</Badge>
              <Input
                name={fields.invoiceName.name}
                key={fields.invoiceName.key}
                defaultValue={data.invoiceName}
                placeholder="Nama Faktur"
              />
            </div>
            <p className="text-sm text-red-500">{fields.invoiceName.errors}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>No. Faktur</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                  #
                </span>
                <Input
                  name={fields.invoiceNumber.name}
                  key={fields.invoiceNumber.key}
                  defaultValue={data.invoiceNumber}
                  className="rounded-l-none"
                  placeholder="5"
                />
              </div>
              <p className="text-red-500 text-sm">
                {fields.invoiceNumber.errors}
              </p>
            </div>

            <div>
              <Label>Mata Uang</Label>
              <Select
                defaultValue="IDR"
                name={fields.currency.name}
                key={fields.currency.key}
                onValueChange={(value) => setCurrency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Mata Uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">
                    United States Dollar -- USD
                  </SelectItem>
                  <SelectItem value="IDR">Rupiah -- Rp</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.currency.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Dari</Label>
              <div className="space-y-1">
                <Input
                  name={fields.fromName.name}
                  key={fields.fromName.key}
                  placeholder="Nama Anda"
                  defaultValue={data.fromName}
                />
                <p className="text-red-500 text-sm">{fields.fromName.errors}</p>
                <Input
                  placeholder="Email Anda"
                  name={fields.fromEmail.name}
                  key={fields.fromEmail.key}
                  defaultValue={data.fromEmail}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromEmail.errors}
                </p>
                <Input
                  placeholder="Alamat Anda"
                  name={fields.fromAddress.name}
                  key={fields.fromAddress.key}
                  defaultValue={data.fromAddress}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromAddress.errors}
                </p>
              </div>
            </div>

            <div>
              <Label>Kepada</Label>
              <div className="space-y-1">
                <Input
                  name={fields.clientName.name}
                  key={fields.clientName.key}
                  defaultValue={data.clientName}
                  placeholder="Nama Klien"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientName.errors}
                </p>
                <Input
                  name={fields.clientEmail.name}
                  key={fields.clientEmail.key}
                  defaultValue={data.clientEmail}
                  placeholder="Email Klien"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientEmail.errors}
                </p>
                <Input
                  name={fields.clientAddress.name}
                  key={fields.clientAddress.key}
                  defaultValue={data.clientAddress}
                  placeholder="Alamat Klien"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientAddress.errors}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div>
                <Label>Tanggal</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] text-left justify-start"
                  >
                    <CalendarIcon />
                    {selectedDate ? (
                      new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "long",
                      }).format(selectedDate)
                    ) : (
                      <span>Pilih Tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    mode="single"
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-red-500 text-sm">{fields.date.errors}</p>
            </div>

            <div>
              <Label>Jatuh Tempo</Label>
              <Select
                name={fields.dueDate.name}
                key={fields.dueDate.key}
                defaultValue={data.dueDate.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jatuh tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Bayar saat terima</SelectItem>
                  <SelectItem value="7">7 hari</SelectItem>
                  <SelectItem value="15">15 hari</SelectItem>
                  <SelectItem value="30">30 hari</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.dueDate.errors}</p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-12 gap-4 font-medium mb-4">
              <p className="col-span-5">Deskripsi</p>
              <p className="col-span-2">Kuantitas</p>
              <p className="col-span-2">Biaya/Harga</p>
              <p className="col-span-2">Jumlah</p>
              <p className="col-span-1">Aksi</p>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-5">
                  <AutoResizeTextarea
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].description = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Nama & deskripsi item"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].quantity = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].rate = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    value={formatCurrency({
                      amount:
                        (Number(item.quantity) || 0) * (Number(item.rate) || 0),
                      currency: currency as "USD" | "IDR",
                    })}
                    disabled
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setItems([
                    ...items,
                    { description: "", quantity: "1", rate: "0" },
                  ]);
                }}
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {formatCurrency({
                    amount: calculateTotal,
                    currency: currency as "USD" | "IDR",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t">
                <span>Total ({currency})</span>
                <span className="font-semibold underline underline-offset-4">
                  {formatCurrency({
                    amount: calculateTotal,
                    currency: currency as "USD" | "IDR",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>Catatan (Opsional)</Label>
            <Textarea
              name={fields.note.name}
              key={fields.note.key}
              defaultValue={data.note ?? undefined}
              placeholder="Tambahkan catatan Anda di sini..."
            />
            <p className="text-red-500 text-sm">{fields.note.errors}</p>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Perbarui Faktur" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
