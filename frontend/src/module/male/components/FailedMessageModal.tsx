import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MaterialSymbol } from "../types/material-symbol";
import type { Message } from "../types/male.types";
import { useTranslation } from "../../../core/hooks/useTranslation";

interface FailedMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  coinBalance: number;
  messageCost: number;
  onResend: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onBuyCoins: () => void;
}

export const FailedMessageModal: React.FC<FailedMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  coinBalance,
  messageCost,
  onResend,
  onDelete,
  onBuyCoins,
}) => {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = "";
      }, 280);
    }

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAnimatedClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleResend = () => {
    if (!message) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onResend(message);
    }, 250);
  };

  const handleDelete = () => {
    if (!message) return;
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onDelete(message.id || (message as any)._id);
    }, 250);
  };

  const handleRecharge = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onBuyCoins();
    }, 250);
  };

  if (!isMounted || !message) return null;

  const hasEnoughCoinsNow = coinBalance >= messageCost;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-end justify-center sm:items-center transition-all duration-300 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}>
      {/* 1. Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleAnimatedClose}
      />

      {/* 2. Modal Sheet */}
      <div
        className={`relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-8 shadow-2xl border-t sm:border border-red-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 sm:scale-95 sm:translate-y-6"
        }`}>
        {/* Drag handle */}
        <div className="mx-auto w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-5" />

        {/* Header with Alert Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-11 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-500 border border-red-200/60 dark:border-red-900/40 flex items-center justify-center shrink-0">
            <MaterialSymbol
              name="error"
              size={26}
              filled
              className="text-red-500"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {t("messageNotSent", { defaultValue: "Message Not Sent" })}
            </h3>
            <p className="text-xs font-semibold text-red-500">
              {t("insufficientCoins", {
                defaultValue: "Insufficient coins in wallet",
              })}
            </p>
          </div>
          <button
            onClick={handleAnimatedClose}
            className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center active:scale-90 transition-all">
            <MaterialSymbol name="close" size={18} />
          </button>
        </div>

        {/* Message preview snippet */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t("unsentContent", { defaultValue: "Unsent message" })}
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-3 break-words">
            "{message.content}"
          </p>
        </div>

        {/* Coins status card */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {t("requiredCoins", { defaultValue: "Required per message" })}
              </div>
              <div className="text-xs font-black text-pink-600 dark:text-pink-400">
                {messageCost} coins
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {t("currentBalance", { defaultValue: "Your Balance" })}
            </div>
            <div
              className={`text-xs font-black ${hasEnoughCoinsNow ? "text-emerald-600" : "text-red-500"}`}>
              {coinBalance} coins
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Resend Button */}
          <button
            onClick={handleResend}
            className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:opacity-95 shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2">
            <MaterialSymbol name="refresh" size={20} />
            <span>
              {t("resendMessage", { defaultValue: "Resend Message" })}
            </span>
          </button>

          {/* If low on coins, show prominent Buy Coins button */}
          {!hasEnoughCoinsNow && (
            <button
              onClick={handleRecharge}
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 active:scale-98 transition-all flex items-center justify-center gap-2 border border-amber-200">
              <MaterialSymbol
                name="monetization_on"
                size={20}
                className="text-amber-700"
                filled
              />
              <span>
                {t("buyCoinsToSendMessage", {
                  defaultValue: "Buy Coins to Send",
                })}
              </span>
            </button>
          )}

          {/* Delete Message Button */}
          <button
            onClick={handleDelete}
            className="w-full py-3 px-4 rounded-2xl text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 active:scale-98 transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30">
            <MaterialSymbol name="delete" size={18} />
            <span>
              {t("deleteMessage", { defaultValue: "Delete from my side" })}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
