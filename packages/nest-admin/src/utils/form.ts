export const toOptions = <T extends readonly string[]>(values: T) =>
  values.map((v) => ({
    value: v,
    label: v.replace(/_/g, ' ').toUpperCase(),
  }))
