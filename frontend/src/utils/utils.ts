// export const getChatId = (fromId: string, toId: string) => {
//   if (toId === "public") return toId;

//   return [fromId, toId].sort().join("-");
// };

export const a = 1;

export const getFormatedTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString();
};
