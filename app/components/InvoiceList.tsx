import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceActions } from "./InvoiceActions";

export async function InvoiceList() {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Faktur</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>#1</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>$55.00</TableCell>
            <TableCell>Lunas</TableCell>
            <TableCell>01/11/2024</TableCell>
            <TableCell className="text-right">
              <InvoiceActions />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
