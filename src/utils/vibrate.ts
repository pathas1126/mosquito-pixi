export const vibrate = (ms = 20) => {
  //@ts-ignore
  const vibrateFunc = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

  if (vibrateFunc) vibrateFunc(ms);
};
