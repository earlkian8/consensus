import { Button } from "@/components/shadcnUI/button";

export default function EndSessionModal({ open, onCancel, onConfirm }) {
    return (
        <div className={`modal-bg ${open ? "" : "hidden"}`} id="end-modal">
            <div className="modal" style={{ maxHeight: "none" }}>
                <div className="modal-title">End session early?</div>
                <div className="modal-sub">
                    The scheduled end time has not been reached. Are you sure?
                </div>
                <div className="modal-actions">
                    <Button className="btn" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button className="btn btn-coral" type="button" onClick={onConfirm}>
                        Yes, end session
                    </Button>
                </div>
            </div>
        </div>
    );
}
