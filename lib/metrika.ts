declare global {
  interface Window {
    ym?: (id: number, method: string, goal: string) => void
  }
}

const METRIKA_ID = 108238897

export function reachGoal(goal: string) {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'reachGoal', goal)
  }
}
