"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { type AnchorHTMLAttributes, type ReactNode, useEffect, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

type PendingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
    pendingLabel?: string;
    showLoader?: boolean;
    buttonStyle?: boolean;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "md" | "lg";
  };

export function PendingLink({
  href,
  children,
  className,
  pendingLabel,
  showLoader = false,
  buttonStyle = false,
  variant = "primary",
  size = "md",
  onClick,
  ...props
}: PendingLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hrefValue = typeof href === "string" ? href : href.toString();

  useEffect(() => {
    router.prefetch(hrefValue);
  }, [hrefValue, router]);

  return (
    <Link
      {...props}
      href={href}
      className={
        buttonStyle
          ? buttonClassName({
              variant,
              size,
              className,
              isLoading: isPending,
            })
          : cn(
              "transition duration-200 ease-out",
              isPending && "opacity-70",
              className
            )
      }
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        ) {
          return;
        }

        event.preventDefault();
        startTransition(() => {
          router.push(hrefValue);
        });
      }}
    >
      {isPending && showLoader ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          <span>{pendingLabel || children}</span>
        </>
      ) : (
        children
      )}
    </Link>
  );
}
