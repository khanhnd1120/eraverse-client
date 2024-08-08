const Constants = {
  CharacterCodes: [
    "FEMALE_10",
    "FEMALE_09",
    "FEMALE_08",
    "FEMALE_07",
    "FEMALE_06",
    "FEMALE_05",
    "FEMALE_04",
    "FEMALE_03",
    "FEMALE_02",
  ],
  // right - bottom - left - top
  DanceAnim: [
    {
      anim: "capoeira",
      name: "Capoeira",
    },
    {
      anim: "chicken_dance",
      name: "Chicken Dance",
    },
    {
      anim: "falling",
      name: "Falling",
    },
    {
      anim: "flair",
      name: "Flair",
    },
    {
      anim: "gangnam_style",
      name: "Gangnam Style",
    },
    {
      anim: "hiphop",
      name: "Hiphop",
    },
  ],
  AnimClipModel: [
    { name: "idle" },
    { name: "run_backward" },
    { name: "run_forward" },
    { name: "run_left" },
    { name: "run_right" },
    { name: "capoeira" },
    { name: "chicken_dance" },
    { name: "falling" },
    { name: "flair" },
    { name: "gangnam_style" },
    { name: "hiphop" },
    { name: "ninja_idle" },
    { name: "punch", timeScale: 2 },
    { name: "jump", timeScale: 1.5 },
  ],
};
export default Constants;
