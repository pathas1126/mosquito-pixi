export const vibrate = (ms = 20) => {
  //@ts-ignore
  navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
  if (navigator.vibrate) navigator.vibrate(ms);
};
