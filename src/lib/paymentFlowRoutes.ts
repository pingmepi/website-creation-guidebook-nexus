const PAYMENT_ROUTES = ["/cart", "/checkout"] as const;

export const isPaymentFlowEnabled = (
  enablePaymentFlows: boolean | string | undefined,
): boolean => enablePaymentFlows === true || enablePaymentFlows === "true";

export const shouldBlockPaymentRoute = (
  pathname: string,
  enablePaymentFlows: boolean | string | undefined,
): boolean => {
  if (isPaymentFlowEnabled(enablePaymentFlows)) {
    return false;
  }

  return PAYMENT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};
