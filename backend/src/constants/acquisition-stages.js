export const acquisitionStages = [
    'PROPOSAL',
    'SCRUTINY',
    'SURVEY',
    'NOTIFICATION',
    'AWARD',
    'COMPENSATION',
    'POSSESSION',
    'RR',
    'COMPLETED'
];

export const validStageTransitions = new Map(
    acquisitionStages.map((stage, index) => [stage, acquisitionStages[index + 1] ?? null])
);
