import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const ProfileEditActions = ({
  canSave,
  isSaving,
  onCancel,
  onSave,
  className = "",
}) => (
  <div className={`mt-5 space-y-2.5 ${className}`}>
    <Button
      type="button"
      disabled={isSaving || !canSave}
      onClick={onSave}
      className="w-full"
    >
      {isSaving && <Loader2 className="animate-spin" />}
      Save changes
    </Button>
    <Button
      type="button"
      variant="outline"
      disabled={isSaving}
      onClick={onCancel}
      className="w-full"
    >
      Cancel
    </Button>
  </div>
);

export default ProfileEditActions;
