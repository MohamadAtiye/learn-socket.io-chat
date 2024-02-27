export const getFormatedTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString();
};
