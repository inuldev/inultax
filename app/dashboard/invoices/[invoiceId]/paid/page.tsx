import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import prisma from "@/app/utils/db";
import PaidGif from "@/public/paid.gif";
import { requireUser } from "@/app/utils/hooks";
import { MarkAsPaidAction } from "@/app/actions";
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

export default async function MarkAsPaid({ params }: { params: Params }) {
  const { invoiceId } = await params;
  const session = await requireUser();
  await Authorize(invoiceId, session.user?.id as string);

  return (
    <div className="flex flex-1 justify-center items-center">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Tandai Sebagai Lunas?</CardTitle>
          <CardDescription>
            Apakah Anda yakin ingin menandai faktur ini sebagai lunas?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image src={PaidGif} alt="Paid Gif" className="rounded-lg" />
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
              await MarkAsPaidAction(invoiceId);
            }}
          >
            <SubmitButton text="Tandai Lunas!" />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
