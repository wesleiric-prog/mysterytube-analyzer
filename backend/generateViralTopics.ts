import fs from "fs";

const themes = JSON.parse(
  fs.readFileSync("./output/theme-analysis.json", "utf8")
);

const topWords = themes.slice(0, 20).map((item: any) => item[0]);

const templates = [
  "The Most Disturbing Unsolved Mystery From the Internet",
  "The Darkest Case That Still Has No Explanation",
  "The Scariest Real Story Hidden Online",
  "The Mysterious Incident That Shocked Everyone",
  "The Internet Rabbit Hole That Gets Worse the Deeper You Go",
  "The Secret Case They Tried to Erase",
  "The Creepiest Mystery Caught on Camera",
  "The Real Story Behind This Disturbing Disappearance",
  "The Dark History of a Place Nobody Wants to Visit",
  "The Cryptic Files That Were Never Explained"
];

const topics = templates.map((template, index) => ({
  id: index + 1,
  title: template,
  keywords: topWords.slice(index, index + 5),
  language: "en",
  style: "dark mystery documentary"
}));

fs.writeFileSync(
  "./output/viral-topics.json",
  JSON.stringify(topics, null, 2),
  "utf8"
);

console.table(topics);
console.log("✅ viral-topics.json criado");