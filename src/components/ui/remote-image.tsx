"use client";

import Image from "next/image";
import { isOptimizableRemoteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
};

export function RemoteImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = "(max-width: 600px) 100vw, 600px",
  fill,
  priority,
}: Props) {
  if (isOptimizableRemoteImage(src)) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", className)}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 600}
        height={height ?? 400}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(fill && "absolute inset-0 size-full object-cover", className)}
    />
  );
}
