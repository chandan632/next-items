"use client";

type ToastProps = {
  message: string | null;
  tone?: "success" | "error";
};

export function Toast({ message, tone = "success" }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className={`banner ${tone === "error" ? "banner-error" : ""}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
