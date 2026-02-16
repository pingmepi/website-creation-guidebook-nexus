import { NextRequest, NextResponse } from "next/server";
import { shouldBlockPaymentRoute } from "@/lib/paymentFlowRoutes";

export function middleware(request: NextRequest) {
  if (
    shouldBlockPaymentRoute(
      request.nextUrl.pathname,
      process.env.NEXT_PUBLIC_ENABLE_PAYMENT_FLOWS,
    )
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/:path*", "/checkout/:path*"],
};
