import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LoginRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LoginRequiredModal({
  open,
  onClose,
  onConfirm,
}: LoginRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>로그인이 필요한 서비스</DialogTitle>
          <DialogDescription>
            로그인 페이지로 이동하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="button" onClick={onConfirm}>
            로그인 하러가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}