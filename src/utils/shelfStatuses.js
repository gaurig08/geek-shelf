// src/utils/shelfStatuses.js
//
// The one place shelf-item status values are defined. Everything that
// needs to read, set, filter, or weight by status imports from here
// instead of hardcoding its own copy of this list.

export const STATUSES = [
  { value: "Planning",    label: "Planning"    },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed",   label: "Completed"   },
  { value: "Dropped",     label: "Dropped"     },
];

export const DEFAULT_STATUS = "Planning";
