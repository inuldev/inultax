import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import prisma from "@/app/utils/db";
import WarningGif from "@/public/warning.gif";
import { DeleteInvoice } from "@/app/actions";
import { requireUser } from "@/app/utils/hooks";
import { SubmitButton } from "@/app/components/SubmitButtons";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function Authorize(invoiceId: string, userId: string) {
  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
      userId: userId,
    },
  });

  if (!data) {
    return redirect("/dashboard/invoices");
  }
}
type Params = Promise<{ invoiceId: string }>;

export default async function DeleteInvoiceRoute({
  params,
}: {
  params: Params;
}) {
  const session = await requireUser();
  const { invoiceId } = await params;
  await Authorize(invoiceId, session.user?.id as string);

  return (
    <div className="flex flex-1 justify-center items-center">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Hapus Faktur</CardTitle>
          <CardDescription>
            Apakah Anda yakin ingin menghapus faktur ini?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image src={WarningGif} alt="Warning Gif" className="rounded-lg" />
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/dashboard/invoices"
          >
            Batal
          </Link>
          <form
            action={async () => {
              "use server";
              await DeleteInvoice(invoiceId);
            }}
          >
            <SubmitButton text="Hapus Faktur" variant={"destructive"} />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
