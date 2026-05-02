import part1 from "./chayei-sara-part1.json";
import part2 from "./chayei-sara-part2.json";
import part3 from "./chayei-sara-part3.json";
import part4 from "./chayei-sara-part4.json";
import part5 from "./chayei-sara-part5.json";

export type Question = {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
  rashiInsight: string;
};

export type QuizPart = {
  partId: number;
  partTitle: string;
  partSubtitle: string;
  questions: Question[];
};

export const parts: QuizPart[] = [
  part1 as QuizPart,
  part2 as QuizPart,
  part3 as QuizPart,
  part4 as QuizPart,
  part5 as QuizPart,
];

export const parsha = "חיי שרה";
