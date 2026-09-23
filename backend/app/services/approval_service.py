import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.db.repository import repo
from app.models.redistribution import RedistributionRecommendation, TransferRecord
from app.services.metrics_service import metrics_service
from app.config import settings

class ApprovalService:
    @staticmethod
    def process_action(
        recommendation_id: str,
        action: str,  # APPROVE, MODIFY, REJECT, ESCALATE
        reviewer_id: str,
        reviewer_name: str,
        reviewer_role: str,
        modified_quantity: Optional[int] = None,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        rec = repo.get_recommendation(recommendation_id)
        if not rec:
            raise ValueError(f"Recommendation {recommendation_id} not found")

        action_upper = action.upper()
        if action_upper not in ("APPROVE", "MODIFY", "REJECT", "ESCALATE"):
            raise ValueError(f"Invalid action: {action}. Must be APPROVE, MODIFY, REJECT, or ESCALATE.")

        original_quantity = rec.quantity
        final_quantity = original_quantity

        # Handle MODIFY
        if action_upper == "MODIFY":
            if modified_quantity is None or modified_quantity <= 0:
                raise ValueError("Modified quantity must be a positive integer.")
            if not reason or not reason.strip():
                raise ValueError("A formal operational reason is strictly required when modifying AI recommendations.")
            final_quantity = modified_quantity

        # Check Dual Authorization requirement
        if action_upper in ("APPROVE", "MODIFY") and rec.requires_dual_auth:
            if not rec.first_approval:
                # Record first stage of dual authorization
                rec.first_approval = {
                    "reviewer_id": reviewer_id,
                    "reviewer_name": reviewer_name,
                    "reviewer_role": reviewer_role,
                    "action": action_upper,
                    "approved_at": datetime.utcnow().isoformat(),
                    "quantity": final_quantity,
                    "reason": reason or "Initial dual-auth clearance granted."
                }
                rec.status = "PENDING_SECOND_APPROVAL"
                
                audit = repo.log_audit(
                    event_type="RECOMMENDATION_DUAL_AUTH_STAGE_1",
                    actor_id=reviewer_id,
                    actor_name=reviewer_name,
                    actor_role=reviewer_role,
                    recommendation_id=rec.id,
                    previous_value={"status": "PENDING_REVIEW"},
                    new_value={"status": "PENDING_SECOND_APPROVAL", "quantity": final_quantity},
                    reason=reason or "First authorization stage cleared for high-volume transfer",
                    model_version=rec.model_version
                )
                return {
                    "status": "PENDING_SECOND_APPROVAL",
                    "message": f"First clearance registered by {reviewer_name} ({reviewer_role}). Second authorization required for transfers exceeding {settings.DUAL_AUTH_THRESHOLD} units.",
                    "recommendation": rec.model_dump(),
                    "audit_id": audit.event_id
                }

        # Finalize Execution
        if action_upper in ("APPROVE", "MODIFY"):
            rec.status = "APPROVED" if action_upper == "APPROVE" else "MODIFIED_APPROVED"
            
            # Create formal transfer record
            tracking_code = f"TRK-{uuid.uuid4().hex[:8].upper()}"
            transfer = TransferRecord(
                id=f"XFER-{rec.id}",
                recommendation_id=rec.id,
                source_phc_id=rec.source_phc_id,
                source_name=rec.source_name,
                destination_phc_id=rec.destination_phc_id,
                destination_name=rec.destination_name,
                resource=rec.resource,
                quantity=final_quantity,
                status="COMPLETED",
                dispatched_at=datetime.utcnow(),
                received_at=datetime.utcnow(),
                tracking_code=tracking_code
            )
            repo.add_transfer(transfer)

            # Update inventory stocks
            med_id = "MED-ORS" if "ors" in rec.resource.lower() else "MED-PCM"
            for m in repo.get_medicines():
                if m.name.lower() in rec.resource.lower():
                    med_id = m.id
                    break

            repo.update_inventory_stock(rec.source_phc_id, med_id, -final_quantity, reason=f"Dispatched via transfer {transfer.id}")
            repo.update_inventory_stock(rec.destination_phc_id, med_id, final_quantity, reason=f"Received via transfer {transfer.id}")

            # Recalculate destination stress & resolve/mitigate alert
            dest_stress = metrics_service.calculate_hrsi(rec.destination_phc_id)
            repo.clear_alerts_for_phc(rec.destination_phc_id)

            # Log audit event
            audit = repo.log_audit(
                event_type="RECOMMENDATION_APPROVED" if action_upper == "APPROVE" else "RECOMMENDATION_MODIFIED",
                actor_id=reviewer_id,
                actor_name=reviewer_name,
                actor_role=reviewer_role,
                recommendation_id=rec.id,
                previous_value={"original_quantity": original_quantity, "status": "PENDING_REVIEW"},
                new_value={"approved_quantity": final_quantity, "status": rec.status, "transfer_id": transfer.id},
                reason=reason or "Approved under standard operational protocol.",
                model_version=rec.model_version,
                metadata={
                    "tracking_code": tracking_code,
                    "destination_new_hrsi": dest_stress.stress_index,
                    "destination_new_category": dest_stress.category
                }
            )

            return {
                "status": rec.status,
                "message": f"Transfer of {final_quantity} units {rec.resource} successfully executed and logged to immutable audit trail.",
                "recommendation": rec.model_dump(),
                "transfer": transfer.model_dump(),
                "audit_id": audit.event_id,
                "destination_post_transfer_stress": dest_stress.model_dump()
            }

        elif action_upper == "REJECT":
            if not reason:
                raise ValueError("A formal operational reason is required to reject an AI recommendation.")
            rec.status = "REJECTED"
            audit = repo.log_audit(
                event_type="RECOMMENDATION_REJECTED",
                actor_id=reviewer_id,
                actor_name=reviewer_name,
                actor_role=reviewer_role,
                recommendation_id=rec.id,
                previous_value={"status": "PENDING_REVIEW"},
                new_value={"status": "REJECTED"},
                reason=reason,
                model_version=rec.model_version
            )
            return {
                "status": "REJECTED",
                "message": f"Recommendation {rec.id} rejected by {reviewer_name}.",
                "recommendation": rec.model_dump(),
                "audit_id": audit.event_id
            }

        elif action_upper == "ESCALATE":
            rec.status = "ESCALATED"
            audit = repo.log_audit(
                event_type="RECOMMENDATION_ESCALATED",
                actor_id=reviewer_id,
                actor_name=reviewer_name,
                actor_role=reviewer_role,
                recommendation_id=rec.id,
                previous_value={"status": "PENDING_REVIEW"},
                new_value={"status": "ESCALATED"},
                reason=reason or "Escalated to State Coordinator for inter-district authorization.",
                model_version=rec.model_version
            )
            return {
                "status": "ESCALATED",
                "message": f"Recommendation {rec.id} escalated to higher administrative tier.",
                "recommendation": rec.model_dump(),
                "audit_id": audit.event_id
            }

approval_service = ApprovalService()
