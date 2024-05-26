const MAX_LEN = 5;

export const generate = () => {
  let ans = "";
  const source = "0123456789qwertyuiopasdfghjklzxcvbnm";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += source[Math.floor(Math.random() * source.length)];
  }
  return ans;
};
