// Vayera
import vayeraPart1 from "./part1.json";
import vayeraPart2 from "./part2.json";
import vayeraPart3 from "./part3.json";
import vayeraPart4 from "./part4.json";
import vayeraPart5 from "./part5.json";

// Chayei Sarah
import chayeiSaraPart1 from "./chayei-sara-part1.json";
import chayeiSaraPart2 from "./chayei-sara-part2.json";
import chayeiSaraPart3 from "./chayei-sara-part3.json";
import chayeiSaraPart4 from "./chayei-sara-part4.json";
import chayeiSaraPart5 from "./chayei-sara-part5.json";

// Toldot
import toldotPart1 from "./toldot-part1.json";
import toldotPart2 from "./toldot-part2.json";
import toldotPart3 from "./toldot-part3.json";
import toldotPart4 from "./toldot-part4.json";
import toldotPart5 from "./toldot-part5.json";

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

export type Parsha = {
  slug: string;
  name: string;
  nameEn: string;
  emoji: string;
  parts: QuizPart[];
};

export const parshas: Parsha[] = [
  {
    slug: "vayera",
    name: "וירא",
    nameEn: "Vayera",
    emoji: "🔥",
    parts: [
      vayeraPart1 as QuizPart,
      vayeraPart2 as QuizPart,
      vayeraPart3 as QuizPart,
      vayeraPart4 as QuizPart,
      vayeraPart5 as QuizPart,
    ],
  },
  {
    slug: "chayei-sara",
    name: "חיי שרה",
    nameEn: "Chayei Sarah",
    emoji: "💍",
    parts: [
      chayeiSaraPart1 as QuizPart,
      chayeiSaraPart2 as QuizPart,
      chayeiSaraPart3 as QuizPart,
      chayeiSaraPart4 as QuizPart,
      chayeiSaraPart5 as QuizPart,
    ],
  },
  {
    slug: "toldot",
    name: "תולדות",
    nameEn: "Toldot",
    emoji: "👶",
    parts: [
      toldotPart1 as QuizPart,
      toldotPart2 as QuizPart,
      toldotPart3 as QuizPart,
      toldotPart4 as QuizPart,
      toldotPart5 as QuizPart,
    ],
  },
];
