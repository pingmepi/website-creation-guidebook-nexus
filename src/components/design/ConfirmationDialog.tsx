
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  onEdit
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Your Answers</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Please review your responses before continuing to the design stage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {answers.map((answer, index) => (
            <div key={index}>
              <h4 className="font-medium text-gray-800">{answer.question}</h4>
              {answer.question.includes("color") ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: answer.answer }}></div>
                  <p>{answer.answer}</p>
                </div>
              ) : (
                <p className="mt-1">{answer.answer}</p>
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="w-full sm:w-auto">
            Edit Answers
          </Button>
          <Button 
            onClick={onConfirm}
            className="w-full sm:w-auto">
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
