
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Answer } from "./QuestionFlow";

interface ConfirmationDialogProps {
  open: boolean;
  answers: Answer[];
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const ConfirmationDialog = ({
  open,
  answers,
  onClose,
  onConfirm,
  onEdit,
}: ConfirmationDialogProps) => {
  console.log("ConfirmationDialog displaying answers:", answers);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Design Preferences</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please review your design preferences before continuing:
          </p>
          <div className="space-y-2 border rounded-md p-4">
            {answers.length === 0 ? (
              <p className="text-gray-500">No preferences selected.</p>
            ) : (
              answers.map((answer, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600 font-medium">{answer.question}</span>
                  <span>{answer.answer}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Preferences
          </Button>
          <Button onClick={onConfirm}>
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
