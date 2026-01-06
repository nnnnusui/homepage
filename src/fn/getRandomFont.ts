export const getRandomFont = (): Font => {
  const randomIndex = Math.floor(Math.random() * fonts.length);
  return fonts[randomIndex]!;
};

type Font = {
  family: string;
  url: string;
};

const fonts: Font[] = [
  {
    family: "'Reggae One', cursive",
    url: "https://fonts.googleapis.com/css2?family=Reggae+One",
  },
  {
    family: "'Dela Gothic One', cursive",
    url: "https://fonts.googleapis.com/css2?family=Dela+Gothic+One",
  },
  {
    family: "'Sacramento', cursive",
    url: "https://fonts.googleapis.com/css2?family=Sacramento",
  },
  {
    family: "'Kalam', cursive",
    url: "https://fonts.googleapis.com/css2?family=Kalam:wght@300",
  },
  {
    family: "'Press Start 2P', cursive",
    url: "https://fonts.googleapis.com/css2?family=Press+Start+2P",
  },
  {
    family: "'Parisienne', cursive",
    url: "https://fonts.googleapis.com/css2?family=Parisienne",
  },
  {
    family: "'Cinzel Decorative', cursive",
    url: "https://fonts.googleapis.com/css2?family=Cinzel+Decorative",
  },
  {
    family: "'Coming Soon', cursive",
    url: "https://fonts.googleapis.com/css2?family=Coming+Soon",
  },
  {
    family: "'Graduate', cursive",
    url: "https://fonts.googleapis.com/css2?family=Graduate",
  },
  {
    family: "'Merienda One', cursive",
    url: "https://fonts.googleapis.com/css2?family=Merienda+One",
  },
  {
    family: "'Wallpoet', cursive",
    url: "https://fonts.googleapis.com/css2?family=Wallpoet",
  },
  {
    family: "'Rammetto One', cursive",
    url: "https://fonts.googleapis.com/css2?family=Rammetto+One",
  },
  {
    family: "'Oleo Script Swash Caps', cursive",
    url: "https://fonts.googleapis.com/css2?family=Oleo+Script+Swash+Caps",
  },
];
