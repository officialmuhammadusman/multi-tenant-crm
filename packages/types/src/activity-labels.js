"use strict";
// packages/types/src/activity-labels.ts
// Single source of truth for human-readable activity log labels.
// Backend includes these in every ActivityLog response.
// Frontend reads them directly — no computation needed.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVITY_LABELS = void 0;
exports.getActivityLabel = getActivityLabel;
exports.ACTIVITY_LABELS = {
    CUSTOMER_CREATED: 'Customer Created',
    CUSTOMER_UPDATED: 'Customer Updated',
    CUSTOMER_DELETED: 'Customer Deleted',
    CUSTOMER_RESTORED: 'Customer Restored',
    NOTE_ADDED: 'Note Added',
    CUSTOMER_ASSIGNED: 'Customer Assigned',
};
function getActivityLabel(action) {
    return exports.ACTIVITY_LABELS[action] ?? action;
}
//# sourceMappingURL=activity-labels.js.map