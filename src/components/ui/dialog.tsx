// Shadcn UI Dialog 组件封装
import * as React from "react";
import {
  Dialog as RadixDialog,
  DialogContent as RadixDialogContent,
  DialogTitle as RadixDialogTitle,
  DialogTrigger as RadixDialogTrigger,
  DialogProps as RadixDialogProps,
  DialogContentProps as RadixDialogContentProps,
  DialogTitleProps as RadixDialogTitleProps,
  DialogTriggerProps as RadixDialogTriggerProps,
} from "@radix-ui/react-dialog";

export const Dialog: React.FC<RadixDialogProps> = RadixDialog;
export const DialogContent: React.FC<RadixDialogContentProps> = RadixDialogContent;
export const DialogTitle: React.FC<RadixDialogTitleProps> = RadixDialogTitle;
export const DialogTrigger: React.FC<RadixDialogTriggerProps> = RadixDialogTrigger; 