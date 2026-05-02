export interface PartSummary {
  partId: number;
  hebrew: string;
  english: string;
}

export const summariesByParsha: Record<string, PartSummary[]> = {
  vayera: [
    {
      partId: 1,
      hebrew: `פרשת וירא נפתחת ביום השלישי לאחר ברית המילה של אברהם. הקדוש ברוך הוא בא לבקר את אברהם — ומכאן אנו לומדים את מצוות ביקור חולים. אברהם יושב פתח האוהל בחום הקשה, מחפש אורחים להכניס. הקדוש ברוך הוא הוציא חמה מנרתיקה כדי שלא יטריחוהו עוברי אורח, אך כשראה שאברהם מצטער, שלח לו שלושה מלאכים.

מדוע דווקא שלושה? כי אין מלאך אחד עושה שתי שליחויות: מיכאל בא לבשר על לידת יצחק, רפאל לרפא את אברהם, וגבריאל להפוך את סדום. למרות כאבו, אברהם רץ לקראתם — האהבה למצוות דוחפת אותו לפעול בזריזות.

אברהם פונה להשםבבקשה "אל נא תעבור" — מבקש מהשכינה להמתין בזמן שהוא מקבל פני האורחים. הוא מבקש מהם לרחוץ את רגליהם לפני שנכנסים, כדי להסיר את אבק עבודה זרה. הוא מבקש משרה סולת לעוגות וקמח רגיל לכיסוי הקדרה. הוא שוחט שלושה פרים כדי להגיש לכל אחד לשון בחרדל. את ישמעאל הוא שולח להכין — כדי לחנכו במצוות.

שרה לא יכלה להגיש את הלחם שאפתה, כי אורח כנשים חזר אליה ונטמא הבצק. המלאכים נראו כאוכלים אך לא אכלו באמת — ללמד שלא לסטות ממנהג המקום.

המלאכים שואלים "איה שרה?" — למרות שידעו — כדי להסב תשומת לב לצניעותה. יש נקודות מעל "אליו" בתורה, ללמד ששאלו גם את שרה היכן אברהם. המלאך מבטיח "כעת חיה" — בפסח הבא ייוולד יצחק. הוא מדבר בשם השם, כי מלאכים מדברים בגוף ראשון בשליחות הקדוש ברוך הוא.

שרה צוחקת ואומרת "הייתה לי עדנה" — עורה חזר להיות חלק כבימי נעוריה. כשהשםמספר לאברהם, הוא משנה את דבריה: במקום "ואדוני זקן" הוא אומר "ואני זקנתי" — למען שלום בית. השם מחליט שלא להסתיר מאברהם את חורבן סדום, כי הרי נתן לו את הארץ.`,

      english: `Parshat Vayera opens on the third day after Avraham's circumcision. Hashem comes to visit him — teaching us the mitzvah of bikur cholim (visiting the sick). Avraham sits at the tent entrance in intense heat, searching for guests. Hashem made the day extremely hot so travelers wouldn't burden Avraham while he recovered, but when He saw Avraham was distressed at having no guests, He sent three angels.

Why exactly three? Because one angel cannot perform two missions: Michael came to announce Yitzchak's birth, Refael to heal Avraham, and Gavriel to overturn Sodom. Despite his pain, Avraham ran to greet them — his love of mitzvot drove him to act with eagerness.

Avraham turns to Hashem saying "please don't pass by" — asking the Shechina to wait while he tends to guests. He asks them to wash their feet before entering, to remove the dust of idol worship. He requests fine flour for cakes and regular flour for covering the pot. He slaughters three bulls to serve each guest a tongue with mustard. He sends his son Yishmael to prepare the food — to train him in mitzvot.

Sarah couldn't serve the bread she baked because her cycle returned miraculously, making the dough impure. The angels appeared to eat but didn't actually — teaching us not to deviate from local custom.

The angels ask "Where is Sarah?" — even though they knew — to highlight her modesty. There are dots above the word "eilav" in the Torah, teaching that they also asked Sarah where Avraham was. The angel promises "at this time next year" — by next Pesach, Yitzchak will be born. He speaks in Hashem's name, as angels speak in the first person on behalf of God.

Sarah laughs and says she experienced "edna" — her skin became smooth again like in her youth. When Hashem reports to Avraham, He changes her words: instead of "my husband is old," He says "I am old" — for the sake of shalom bayit (peace in the home). Hashem decides not to hide Sodom's destruction from Avraham, since He had given him the land.`
    },
    {
      partId: 2,
      hebrew: `השם אומר על אברהם "כי ידעתיו" — מילת "ידיעה" כאן מבטאת חיבה, כמו אדם שמקרב את מי שהוא אוהב. הזעקה מסדום "גדלה כבר" — הטעם המלעילי מלמד שהרשעות הולכת ונמשכת. איזו זעקה? רשי מספר על נערה שנתנה אוכל לעני ואנשי סדום הרגוה בעונש אכזרי.

השם אומר "ארדה נא ואראה" — ללמד שופטים שאסור לפסוק בדיני נפשות בלי לחקור ישירות. אברהם "ניגש" אל השם — ובמילה הזו שלוש כוונות: דיבור קשה, פיוס ותפילה.

אברהם פותח בחמישים צדיקים — עשרה לכל אחת מחמש הערים, כמו מניין. הוא אומר "ואנכי עפר ואפר" — מודה שהיה הופך לעפר ביד המלכים ולאפר בכבשנו של נמרוד לולא השם. כשמבקש על ארבעים וחמישה, הוא מקווה שהשם יצטרף כעשירי בכל עיר. הוא עוצר בעשרה, כי זוכר שבדור המבול שמונה צדיקים לא הצליחו להציל.

המלאכים מגיעים לסדום בערב — הם חיכו בסבלנות לראות אם טיעוני אברהם יצילו את העיר. לוט יושב בשער — הוא מונה לשופט באותו יום ממש. הוא למד הכנסת אורחים מביתו של אברהם.

לוט מציע ללון קודם ולרחוץ בבוקר — כדי שהאורחים ייראו כאילו הגיעו זה עתה. המלאכים מסרבים בהתחלה — כי מותר לסרב לאדם רגיל. לוט מגיש מצות — כי היה פסח.

"כל העם מקצה" מקיפים את הבית — מנער ועד זקן, אף אחד לא מוחה. הם צועקים "גש הלאה" — ביטוי של בוז. המלאכים מכים אותם בסנוורים, ומתחילים מהצעירים — כי הם אלה שהחלו בחטא. חתני לוט מסרבים לעזוב כי חושבים שהוא מתלוצץ.`,

      english: `Hashem says of Avraham "ki yedativ" (I have known him) — the word "knowing" here expresses endearment, like someone drawing close one they love. The cry from Sodom "has grown great" — the cantillation mark teaches that the wickedness had been ongoing. What cry specifically? Rashi tells of a girl who gave food to a poor person and the people of Sodom killed her cruelly.

Hashem says "I will go down and see" — teaching judges never to rule in capital cases without investigating directly. Avraham "approached" Hashem — and that word carries three intentions: harsh speech, appeasement, and prayer.

Avraham starts with fifty righteous — ten for each of the five cities, like a minyan. He says "I am but dust and ashes" — acknowledging he would have become dust by the kings and ashes in Nimrod's furnace without Hashem. When asking for forty-five, he hopes Hashem will join as the tenth in each city. He stops at ten, remembering that in the generation of the Flood, eight righteous people couldn't save their generation.

The angels arrive in Sodom in the evening — they waited patiently to see if Avraham's arguments would save the city. Lot sits at the gate — he was appointed judge that very day. He learned hospitality from Avraham's household.

Lot offers lodging first, washing in the morning — so the guests would appear as if they'd just arrived. The angels initially refuse — because it's proper to decline a lesser host. Lot serves matzot — because it was Pesach.

"All the people from every quarter" surround the house — young and old, not one person objected. They shout "move aside!" — an expression of contempt. The angels strike them with blindness, starting with the young ones — because they initiated the sin. Lot's sons-in-law refuse to leave because they think he's joking.`
    },
    {
      partId: 3,
      hebrew: `המלאכים דוחקים בלוט לקחת רק את אשתו ושתי בנותיו הרווקות — הנשואות נשארות. לוט מתמהמה — הוא רוצה להציל את רכושו. המלאך אומר "אל תביט אחריך" — כי גם לוט ראוי לעונש, ולא ראוי שיראה באובדנם כשהוא ניצל רק בזכות אברהם.

לוט מסרב לברוח לאברהם — חושש שליד צדקותו של אברהם, חטאיו שלו יבלטו. הוא בוחר בצוער — כי היא עיר צעירה וחטאיה טרם התמלאו. המלאך אומר "לא אוכל לעשות דבר" — עונש על שהתפאר "כי משחיתים אנחנו", ללמד שאין למלאכים כוח עצמאי.

החורבן מגיע בשחר — כדי שגם עובדי השמש וגם עובדי הירח יראו שאלוהיהם לא הגנו. "המטיר גפרית ואש" — התחיל כגשם רגיל ואז הפך לאש. הכתוב אומר "מאת השםמן השמים" בגוף שלישי — כי זהו סגנון מקראי של מלך המדבר על עצמו.

אשת לוט הופכת לנציב מלח — מידה כנגד מידה, כי היא סירבה לתת מלח לאורחים. אברהם רואה "קיטור כבשן" — עשן כמו כבשן סיד. השם"זוכר את אברהם" ומציל את לוט — כי לוט שמר את סודו של אברהם במצרים.

בנות לוט חושבות שכל העולם נחרב כמו בדור המבול. הן מוצאות יין במערה — השםסיפק אותו בהשגחה פרטית כדי שייוולדו עמון ומואב. הנקודה מעל "ובקומה" מלמדת שלוט ידע כשהבכירה קמה — ובכל זאת שתה שוב בלילה השני.

הבכירה קוראת לבנה "מואב" — "מאב" — חושפת את מקורו בגלוי. הצעירה קוראת "בן עמי" — בלשון נקייה, ולכן השםנתן לעמון הגנה מיוחדת מפני ישראל.

אברהם עובר לגרר — מתרחק ממוניטין לוט, ומפני שפסקו האורחים. הוא אומר על שרה "אחותי היא" — כי אין "יראת אלוהים" במקום הזה.`,

      english: `The angels urge Lot to take only his wife and two unmarried daughters — the married ones stay behind. Lot delays — he wants to save his possessions. The angel says "don't look back" — because Lot too deserved punishment, and it wasn't fitting for him to watch others perish when he was saved only through Avraham's merit.

Lot refuses to flee to Avraham — fearing that next to Avraham's righteousness, his own sins would stand out. He chooses Tzo'ar — because it's a young city whose sins haven't yet filled up. The angel says "I cannot do anything" — punishment for having boasted "we are destroying," teaching that angels have no independent power.

The destruction comes at dawn — so that both sun-worshippers and moon-worshippers would see their gods couldn't protect them. "He rained sulfur and fire" — it began as regular rain then transformed into fire. The verse says "from Hashem, from heaven" in third person — because it's standard biblical style for a king to refer to himself.

Lot's wife turns into a pillar of salt — measure for measure, because she refused to give salt to guests. Avraham sees "smoke like a furnace" — thick smoke like a lime kiln. Hashem "remembers Avraham" and saves Lot — because Lot kept Avraham's secret in Egypt.

Lot's daughters believe the entire world was destroyed like in the Flood generation. They find wine in the cave — Hashem provided it providentially so that Ammon and Moav would be born. The dot above "uvkumah" teaches that Lot knew when the older daughter rose — yet he drank again the next night.

The older daughter names her son "Moav" — meaning "from father" — exposing his origin openly. The younger names hers "Ben-Ami" — in modest language, and therefore Hashem gave Ammon extra protection from Israel.

Avraham moves to Gerar — distancing himself from Lot's reputation, and because travelers had stopped coming. He says of Sarah "she is my sister" — because there is no "fear of God" in this place.`
    },
    {
      partId: 4,
      hebrew: `אבימלך טוען בחלומו "הגוי גם צדיק תהרוג" — משווה את האיום של השםלדור המבול ומגדל בבל. הוא מצדיק את עצמו — "בתום לבבי" — כי אברהם עצמו אמר "אחותי היא". אך השם אומר שמנע ממנו פיזית לגעת בשרה — "ואחשך" — אין זה נקיון כפיים אלא התערבות אלוהית.

השם אומר לאבימלך להחזיר את שרה כי אברהם הוא נביא ויתפלל עליו. כל פתחי הגוף בבית אבימלך נאטמו — מכה ייחודית שמנעה לידה ותפקוד. אברהם מסביר ששרה היא אכן "אחותו" — בת אחיו הרן, כי בני בנים נקראים בנים. אבימלך נותן "כסות עיניים" — אלף כסף לכבודה.

התורה מספרת על ריפוי אבימלך לפני פקידת שרה — ללמד שהמתפלל על חברו והוא צריך לאותו דבר, נענה תחילה. השםפקד את שרה "כאשר אמר" — כפי שהבטיח המלאך. הוא שרט סימן בשמש ואמר שכשתגיע לאותו מקום בשנה הבאה, שרה תלד.

יצחק נולד "לזקוניו" — "זיו איקונין" — פניו היו העתק מדויק של אברהם, כדי שלא יטענו שאבימלך הוא האב. באותו יום נרפאו חולים רבים ונשים עקרות נפקדו. שרה אומרת "הניקה בנים" — ברבים — כי הניקה את תינוקות השרות כדי להוכיח שהיא באמת ילדה.

המשתה הגדול נערך ביום הגמילה — בגיל 24 חודשים. שרה רואה את ישמעאל "מצחק" — עוסק בחטאים חמורים. השם אומר לאברהם "שמע בקולה" — כי שרה עליונה ממנו בנבואה.

המים נגמרים מהר כי ישמעאל חולה בחום. הגר יושבת "כמטחווי קשת" — מרחק שתי יריות חץ. השםשומע "את קול הנער" — תפילת החולה עצמו יעילה ביותר. מלאכי השרת מוחים על הצלתו — כי צאצאיו יהרגו ישראלים בעתיד.`,

      english: `Avimelech claims in his dream "will You kill a righteous nation?" — comparing Hashem's threat to the Flood and Tower of Babel. He justifies himself — "in innocence of heart" — because Avraham himself said "she is my sister." But Hashem says He physically prevented Avimelech from touching Sarah — "I held you back" — it wasn't self-restraint but divine intervention.

Hashem tells Avimelech to return Sarah because Avraham is a prophet who will pray for him. All bodily orifices in Avimelech's household were sealed — a unique plague preventing birth and normal function. Avraham explains Sarah is indeed his "sister" — his brother Haran's daughter, since grandchildren are called children. Avimelech gives a "covering of the eyes" — a thousand silver pieces for her honor.

The Torah tells of Avimelech's healing before Sarah's conception — teaching that one who prays for another when they need the same thing is answered first. Hashem visited Sarah "as He had said" — as the angel promised. He scratched a mark on the sun and said when it reaches that spot next year, Sarah would give birth.

Yitzchak was born "in his old age" — "ziv ikonin" — his face was an exact copy of Avraham's, so no one could claim Avimelech was the father. That same day, many sick people were healed and barren women conceived. Sarah says she "nursed children" — plural — because she nursed the noblewomen's babies to prove she truly gave birth.

The great feast was held at weaning — at 24 months. Sarah sees Yishmael "metzachek" — engaging in grave sins. Hashem tells Avraham "listen to her voice" — because Sarah was superior to him in prophecy.

The water runs out quickly because Yishmael is sick with fever. Hagar sits "two bowshots" away. Hashem hears "the voice of the boy" — the sick person's own prayer is most effective. The angels protest his rescue — because his descendants would kill Israelites in the future.`
    },
    {
      partId: 5,
      hebrew: `השם דן את ישמעאל "באשר הוא שם" — לפי מעשיו הנוכחיים, לא לפי העתיד. הגר לוקחת לו אישה ממצרים — "זרוק חוטרא לאוירא, אעיקריה קאי" — חוזרת לשורשיה.

אבימלך רוצה ברית שלום — כי ראה שהשםמציל את אברהם בכל מצב. הוא מבקש עד שלושה דורות — לו, לבנו ולנכדו. המחלוקת על הבאר נפתרת כשהמים עולים לקראת אברהם בנס. אברהם נוטע "אשל" — פרדס או פונדק — ומלמד את אורחיו לברך את השם במקום להודות לו. הוא גר בפלשת 26 שנים — שנה יותר מחברון.

ואז מגיעה העקידה. השטן קטרג שאברהם לא הקריב להשםכלום. אברהם עונה "הנני" — ביטוי של ענווה ומוכנות. השם אומר "נא" — בבקשה — כדי שיעמוד בניסיון האחרון הזה. הוא חושף בהדרגה: "את בנך, את יחידך, אשר אהבת, את יצחק" — כדי לא להבהילו ולהגדיל את שכרו.

"ארץ המוריה" היא ירושלים — מקום בית המקדש העתידי. אברהם חובש את החמור בעצמו — "אהבה מקלקלת את השורה". הוא לוקח את ישמעאל ואליעזר כמלווים. המסע נמשך שלושה ימים — כדי שלא יאמרו שפעל מטירוף פתאומי. אברהם מזהה את ההר על ידי ענן שריחף מעליו.

הוא אומר למשרתים "ונשתחווה ונשובה" — ומתנבא מבלי משים שגם הוא וגם יצחק יחזרו. הסכין נקראת "מאכלת" — כי היא אוכלת בשר או מכשירה אותו לאכילה. "וילכו שניהם יחדו" חוזר פעם שנייה — גם לאחר שיצחק הבין, הוא הלך ברצון. המלאך צועק "אל תעש לו מאומה" — כי אברהם רצה לפחות להוציא טיפת דם.`,

      english: `Hashem judges Yishmael "as he is now" — by his present actions, not by the future. Hagar finds him a wife from Egypt — "throw a stick in the air and it falls back to its root" — she returns to her origins.

Avimelech wants a peace treaty — because he witnessed Hashem saving Avraham in every situation. He requests it cover three generations — himself, his son, and grandson. The well dispute is resolved when water miraculously rises toward Avraham. Avraham plants an "eshel" — an orchard or inn — and teaches his guests to bless Hashem instead of thanking him. He lives in Philistine land for 26 years — one year more than in Hebron.

Then comes the Akeidah. The Satan accused Avraham of never offering anything to Hashem. Avraham answers "Hineni" — an expression of humility and readiness. Hashem says "na" — please — asking him to stand firm in this final test. He reveals gradually: "your son, your only one, whom you love, Yitzchak" — so as not to shock him and to multiply his reward.

"Eretz HaMoriah" is Jerusalem — the site of the future Temple. Avraham saddles the donkey himself — "love overrides normal dignity." He takes Yishmael and Eliezer as companions. The journey lasts three days — so cynics couldn't say he acted in sudden madness. Avraham identifies the mountain by a cloud hovering above it.

He tells his servants "we will worship and return" — unknowingly prophesying that both he and Yitzchak would come back alive. The knife is called "ma'achelet" — because it "eats" flesh or makes meat fit to eat. "They went together" repeats a second time — even after Yitzchak understood, he went willingly. The angel shouts "don't do anything to him!" — because Avraham wanted to at least draw a drop of blood.`
    }
  ],

  "chayei-sara": [
    {
      partId: 1,
      hebrew: `פרשת חיי שרה נפתחת בגילה של שרה אמנו: "מאה שנה ועשרים שנה ושבע שנים". מדוע נכתבה המילה "שנה" ליד כל מספר? ללמד שכל גיל נדרש לעצמו — בת מאה כבת עשרים ללא חטא, ובת עשרים כבת שבע ליופי. "שני חיי שרה" — כולן היו שוות לטובה.

שרה מתה בקרית ארבע, היא חברון. על שם מי נקראה? לפי הפשט — על שם ארבעת הענקים; לפי המדרש — על שם ארבעת הזוגות שנקברו בה. רש"י מסמיך את מותה לעקידה: כששמעה שבנה כמעט נשחט, פרחה נשמתה.

אברהם בא מבאר שבע לספוד לשרה, ופונה לבני חת: "גר ותושב אנכי עמכם" — אם תרצו אקנה כגר, ואם תסרבו אקח כתושב מדין, שהרי הארץ הובטחה לי. בני חת נענים: "איש ממנו את קברו לא יכלה ממך" — לא ימנע ממך. אברהם מבקש "פגעו לי" — לשון בקשה, שילכו לעפרון.

מערת המכפלה — לפי הפשט, בית ועלייה על גביו; לפי המדרש, כפולה בזוגות שנקברו בה. אברהם דורש לקנות "בכסף מלא" — שוויה המלא. עפרון "יושב" בכתיב חסר — כי התמנה לשוטר באותו יום לכבוד אברהם. "כל באי שער עירו" — כולם בטלו ממלאכתם לגמול חסד לשרה.

עפרון אומר "לא אדוני, שמעני" — מעמיד פנים של נדיבות, "השדה נתתי לך" — כאילו כבר נתן. אברהם דוחה: "הלוואי ותשמע — איני רוצה בחינם". עפרון אומר "ביני ובינך מה היא" על ארבע מאות שקל — מציג את הסכום כזוטות אך דורשו במלואו. שמו נכתב חסר ("עפרן") — אמר הרבה ואפילו מעט לא עשה.`,

      english: `Parshat Chayei Sarah opens with Sarah's age: "one hundred years, twenty years, and seven years." Why is "year" repeated? Each age is interpreted independently — at one hundred she was like twenty without sin, at twenty like seven in beauty. "The years of Sarah's life" — all were equally good.

Sarah dies in Kiryat Arba (Hebron). The name comes from the four giants (pshat) or the four couples buried there (midrash). Rashi connects her death to the Akeidah — when she heard her son was nearly slaughtered, her soul departed.

Avraham comes from Be'er Sheva to mourn. He tells the Hittites: "I am a stranger and resident among you" — if you agree, I'll buy as a stranger; if not, I'll take by right, since the land was promised to me. They reply: "No one will withhold his grave from you." Avraham asks them to intercede with Ephron.

The Cave of Machpelah — literally a double structure (house with upper story), or symbolically doubled for the couples buried there. Avraham insists on "full price." Ephron "sat" (spelled deficiently) — he was appointed leader that very day in Avraham's honor. "All who entered the gate" — everyone stopped work to honor Sarah.

Ephron plays generous: "I give you the field" — past tense, as if already given. Avraham refuses the gift. Ephron says "four hundred silver — what is that between us?" — pretending it's nothing while demanding it all. His name is spelled without a vav ("Efron") — he promised much but delivered nothing.`
    },
    {
      partId: 2,
      hebrew: `אברהם שוקל לעפרון "כסף עובר לסוחר" — שקלים גדולים ("קנטרין") המתקבלים בכל מקום. "ויקם שדה עפרון" — הייתה לשדה "תקומה" כשעבר מיד הדיוט ליד מלך וצדיק. ההקנאה נעשתה "בכל באי שער עירו" — במעמד פומבי.

"וה' ברך את אברהם בכל" — "בכל" עולה בגימטריה "בן", ומכאן הבין אברהם שהגיע הזמן להשיא את יצחק. הוא פונה ל"זקן ביתו" — המילה בפתח כי סמוכה ל"ביתו". הוא דורש מאליעזר "שים ידך תחת ירכי" — כי הנשבע צריך לאחוז חפץ של מצווה, וברית המילה הייתה המצווה הראשונה שבאה בצער.

אברהם מכנה את ה' "אלוהי השמים" בלבד — כי כשלקחו מחרן, טרם הוכר בארץ. "מבית אבי" — מחרן; "מארץ מולדתי" — מאור כשדים. "ואשר דיבר לי" — לצורכי ולענייני. "ואשר נשבע לי" — בברית בין הבתרים. "רק את בני לא תשב שמה" — המילה "רק" ממעטת: בני לא, אבל נכדי (יעקב) כן יחזור.

עשרת הגמלים היו ניכרים — פיהם חסום בזמם שלא ירעו בשדות אחרים. "כל טוב אדוניו בידו" — שטר מתנה שכתב אברהם ליצחק על כל נכסיו. "ארם נהריים" — ארץ שבין שני נהרות. "ויברך הגמלים" — הרביצם על ברכיהם.

אליעזר מתפלל: "הוכחת" — ביררת; "ובה אדע" — לשון תחינה. "כי עשית חסד" — אם תהיה מהמשפחה, ידע שעשה ה' חסד. "בתולה" — במשמעות ההלכתית הישירה. "ואיש לא ידעה" — נקייה אף שלא כדרכה.`,

      english: `Avraham weighs out silver "current with the merchant" — the largest, most accepted coins. "The field of Ephron arose" — it gained stature moving from a commoner to a king and tzaddik. The transfer was public — "before all who entered the gate."

"Hashem blessed Avraham with everything" — "bakol" equals "ben" (son) in gematria, signaling it was time to find Yitzchak a wife. He turns to "the elder of his house" — "zakan" has a patach because it's in construct form. He requires Eliezer to "place your hand under my thigh" — the one swearing must hold a sacred object, and circumcision was Avraham's first mitzvah, precious because it came with pain.

Avraham calls Hashem "God of heaven" only — because when He took him from Charan, He wasn't yet recognized on earth. "My father's house" — Charan; "my birthplace" — Ur Kasdim. "Who spoke to me" — for my sake. "Who swore to me" — at the Covenant Between the Parts. "Only my son shall not return there" — "only" excludes: my son no, but my grandson (Yaakov) will return.

The ten camels were distinctive — muzzled so they wouldn't graze in others' fields. "All his master's goods in his hand" — a deed of gift Avraham wrote giving Yitzchak everything. "Aram Naharayim" — the land between two rivers. "He made the camels kneel" — brought them down on their knees.

Eliezer prays: "You have clarified" — tested and chosen. "Through her I will know" — a plea, not a statement. "For You have done kindness" — if she's from the family, it proves Hashem's chesed. "Betulah" — in its direct halachic meaning. "No man had known her" — pure even in unconventional ways.`
    },
    {
      partId: 3,
      hebrew: `אליעזר רץ לקראת רבקה — כי ראה שמי הבאר עלו לקראתה בנס. "הגמיאיני" — לשון גמיעה ולגימה. "ותורד כדה" — הורידה מעל שכמה. "עד אם כילו לשתות" — "אם" כאן במובן "אשר". "ותער" — לשון מזיגה. "השוקת" — אבן חלולה לשתיית גמלים.

אליעזר "משתאה לה" — לשון שממה ותדהמה, לא שתייה. מבחינה דקדוקית, הת' אינה מפרידה כי השורש מתחיל ב-ש' (כמו "משתולל"). "לה" — עליה, אודותיה.

התכשיטים רומזים לעתיד: "בקע" — מחצית השקל שכל ישראלי ייתן. "שני צמידים" — שני לוחות הברית. "עשרה זהב משקלם" — עשרת הדיברות. אליעזר שאל מי היא רק אחרי שנתן — כי בטח בזכות אברהם.

"ללין" — לילה אחד; "ללון" — לינות רבות. רבקה הציעה יותר ממה שביקש. היא ענתה בסדר: "על ראשון ראשון ועל אחרון אחרון". "מספוא" — מזון כללי לגמלים. "בדרך" — הפתח מציין דרך מסוימת ומושגחת.

רבקה סיפרה "לבית אמה" — כי לנשים היה אוהל נפרד, ובת מגידה דברים כאלו לאמה. לבן רץ — "וירץ לבן" — כי ראה את התכשיטים, "עשיר הוא זה", ונתן עיניו בממון. "עומד על הגמלים" — לשמרם ולטפל בהם.`,

      english: `Eliezer runs toward Rivkah — because he saw the well water rise miraculously to meet her. "Hagmi'ini" — means to give drink, to let me sip. "She lowered her jug" — from her shoulder. "Until they finished drinking" — "im" here means "asher" (that). "She poured" — emptied the vessel. "The trough" — a hollowed stone for watering camels.

Eliezer is "mishtaeh" — astonished, not drinking. Grammatically, the tav doesn't separate because the root begins with shin (like "mishtolel"). "Lah" — about her, concerning her.

The jewelry hints at the future: "beka" — the half-shekel every Israelite would give. "Two bracelets" — the two Tablets of the Covenant. "Ten gold their weight" — the Ten Commandments. Eliezer asked who she was only after giving gifts — trusting in Avraham's merit.

"Lalin" — one night; "lalun" — many nights. Rivkah offered more than he requested. She answered in perfect order: "first things first, last things last." "Mispo" — general animal feed. "Baderech" — the patach indicates a specific, divinely guided path.

Rivkah told "her mother's house" — because women had their own tent, and a daughter shares such things with her mother first. Lavan ran — "vayaratz Lavan" — because he saw the jewelry, thought "this one is wealthy," and set his eyes on the money. "Standing over the camels" — watching and tending them.`
    },
    {
      partId: 4,
      hebrew: `לבן אומר "ואנכי פיניתי הבית" — לפי המדרש, טען שפינה את הבית מעבודה זרה כדי להתחנף לאורח. "ויפתח הגמלים" — התיר את הזמם מפיהם, שעכשיו אוכלים מזון מותר. "עד אם דיברתי" — "אם" במובן "כי" או "אשר".

אליעזר מראה למשפחה את שטר המתנה — "ויתן לו את כל אשר לו". הוא מסביר שמותר לקחת מבנות כנען רק אם משפחת אברהם תסרב. "אולי לא תלך" — נכתב חסר, נקרא "אלי": אליעזר קיווה שיצחק יישא את בתו, אך אברהם ענה שכנעני ארור אינו מידבק בברוך.

"ואבוא היום" — היום יצאתי והיום הגעתי, קפצה לו הארץ. "הוכיח" — בירר והודיע. "טרם אכלה" — לשון הווה, שהכתוב משתמש לפעמים בלשון עתיד לתאר הווה. אליעזר שינה את הסדר — אמר ששאל קודם ונתן אחר כך — שלא יתפסוהו: "איך נתת תכשיטים בלי לדעת מי היא?"

"אפנה על ימין או על שמאל" — ימין: בנות ישמעאל; שמאל: בנות לוט. לבן ענה לפני אביו — "רשע היה וקפץ". הם מודים: "מה' יצא הדבר, לא נוכל דבר אליך רע או טוב". אליעזר משתחווה — מכאן שמודים על בשורה טובה. "מגדנות" — מיני פירות מארץ ישראל.

"וילינו" — לינת לילה אחד. בבוקר, בתואל נעדר — לפי המדרש, בא מלאך והמיתו כי רצה לעכב. "ימים" — שנה שלמה; "או עשור" — עשרה חודשים. "נקרא לנערה ונשאלה את פיה" — מכאן שאין משיאין אישה אלא מדעתה.`,

      english: `Lavan says "I have cleared the house" — the midrash says he claimed to have removed idols to impress the guest. "He opened the camels" — removed their muzzles, since now they could eat permitted food. "Until I have spoken" — "im" means "ki" (that).

Eliezer shows the family the deed of gift. He explains a Canaanite wife is permitted only if Avraham's family refuses. "Perhaps she won't go" — spelled deficiently, readable as "to me": Eliezer hoped Yitzchak would marry his daughter, but Avraham said a cursed Canaanite cannot join the blessed.

"I came today" — I left today and arrived today; the earth leaped for me. "Hochiach" — clarified and made known. "Before I finished" — present tense, as Scripture sometimes uses future form for ongoing action. Eliezer changed the order — said he asked first, then gave gifts — so they wouldn't catch him: "How did you give jewelry without knowing who she was?"

"I will turn right or left" — right: Yishmael's daughters; left: Lot's daughters. Lavan answered before his father — "he was wicked and jumped in." They admit: "This is from Hashem; we cannot speak bad or good." Eliezer bows — teaching us to give thanks for good news. "Migdanot" — fruits from the Land of Israel.

"They lodged" — one night only. In the morning, Betuel is absent — the midrash says an angel killed him for trying to obstruct. "Yamim" — a full year; "or asor" — ten months. "Let us call the girl and ask her" — from here we learn that a woman may not be married without her consent.`
    },
    {
      partId: 5,
      hebrew: `רבקה עונה "אלך" — מעצמי, אף אם אינכם רוצים. הם מברכים אותה: "אחותנו את היי לאלפי רבבה" — שהזרע שהובטח לאברהם ייצא ממנה ולא מאישה אחרת.

יצחק בא "מבוא באר לחי רואי" — הלך להביא את הגר לאברהם כדי שישאנה שוב. "והוא יושב בארץ הנגב" — ליד הבאר. "לשוח בשדה" — לשון תפילה, ומכאן תיקן יצחק את תפילת המנחה. רבקה רואה את יצחק — מראה הדור וקדוש — ו"תוהא" מפניו. "ותיפול מעל הגמל" — השמיטה עצמה מכבוד, לא נפלה ממש. "ותתכס" — כיסתה את עצמה בצניעות.

אליעזר מספר ליצחק "את כל הדברים" — את הניסים שקפצה לו הארץ ושנזדמנה רבקה. יצחק מכניס את רבקה ל"אוהלה שרה אמו" — והניסים חוזרים: נר דלוק משבת לשבת, ברכה בעיסה, וענן קשור על האוהל. "ויינחם יצחק אחרי אמו" — כל זמן שאמו קיימת כרוך אצלה, ומשמתה מתנחם באשתו.

"קטורה" — היא הגר, שנקראה כך כי מעשיה נאים כקטורת ו"קשרה פתחה" — לא נזדווגה לאחר. "אשורים ולטושים" — נוודים המתפזרים ונוסעים במחנות. "ויתן אברהם את כל אשר לו ליצחק" — מסר לו "ברכה דיאתיקי", את הכוח לברך. "הפילגשם" חסר — כי פילגש אחת בלבד, הגר היא קטורה. "מתנות" — לפי המדרש, שם טומאה שהרחיקם מיצחק.

"ויקברו אותו יצחק וישמעאל" — ישמעאל עשה תשובה ונתן ליצחק ללכת לפניו. אברהם לא ברך את יצחק — פחד שיברך בעקיפין גם את עשו, והשאיר זאת לקב"ה. שנות ישמעאל נמנו — כדי לחשב שיעקב נטמן בבית עבר 14 שנה.`,

      english: `Rivkah answers "I will go" — on my own, even if you object. They bless her: "Our sister, may you become thousands of myriads" — hoping the seed promised to Avraham would come through her, not another wife.

Yitzchak comes "from Be'er Lachai Ro'i" — he went to bring Hagar back to Avraham to remarry. "He dwelt in the Negev" — near that well. "To speak in the field" — meaning prayer; from here Yitzchak established the afternoon Mincha prayer. Rivkah sees Yitzchak — majestic and holy — and is overcome with awe. "She fell from the camel" — she inclined herself respectfully, not an actual fall. "She covered herself" — with modesty.

Eliezer tells Yitzchak "all that happened" — the miracles of the earth leaping and Rivkah appearing. Yitzchak brings Rivkah into "Sarah his mother's tent" — and the miracles return: a lamp burning from Shabbat to Shabbat, blessing in the dough, and a cloud attached to the tent. "Yitzchak was comforted after his mother" — while a mother lives, one cleaves to her; after she dies, one finds comfort in a wife.

"Keturah" — is Hagar, so named because her deeds were pleasant as incense (ketoret) and she "tied her opening" — she was faithful to no other man. "Ashurim and Letushim" — nomads who spread out and travel in camps. "Avraham gave all he had to Yitzchak" — he passed him the "diyatiki blessing," the power to bless others. "Pilagshim" is spelled deficiently — because there was only one concubine: Hagar is Keturah. "Gifts" — according to the midrash, impure names (sorcery) that distanced them from Yitzchak.

"Yitzchak and Yishmael buried him" — Yishmael repented and let Yitzchak go first. Avraham didn't bless Yitzchak — he feared blessing Esav indirectly, so he left it to Hashem. Yishmael's years are counted — to calculate that Yaakov hid in the academy of Ever for 14 years.`
    }
  ],

  toldot: [
    {
      partId: 1,
      hebrew: `"יצחק בן אברהם, אברהם הוליד את יצחק" — מדוע הכפילות? כי ליצני הדור אמרו ששרה נתעברה מאבימלך, ולכן הקב"ה צר את קלסתר פני יצחק שיהיו דומים לאברהם. יצחק נשא את רבקה בגיל ארבעים — היה בן 37 בעקידה כששרה מתה ורבקה נולדה, והמתין לה שלוש שנים.

רבקה מתוארת שוב "בת בתואל אחות לבן" — להגיד שבחה: בת רשע, אחות רשע ומקומה אנשי רשע, ולא למדה ממעשיהם. "פדן ארם" — לשון צמד בקר, או שדה בלשון ישמעאל. "ויעתר" — שהרבה והפציר בתפילה. "ויעתר לו" ולא לה — שאין דומה תפילת צדיק בן צדיק לתפילת צדיק בן רשע. "לנכח אשתו" — זה בזווית זו וזו בזווית זו, שניהם מתפללים.

"ויתרוצצו הבנים" — מלשון ריצה: כשעוברת על בתי מדרשות יעקב מפרכס לצאת, וכשעוברת על פתח עבודה זרה עשו מפרכס. רבקה אומרת "אם כן למה זה אנכי" — למה התפללתי? היא הולכת לדרוש את ה' בבית מדרשו של שם. "שני גוים" — גדולי גויים כמו אנטונינוס ורבי. "ממעיך יפרדו" — מהמעיים נפרדים לרשע ולתום. "מלאם יאמץ" — כשזה קם זה נופל.

"תומם" חסר — כי אצל רבקה אחד צדיק ואחד רשע, בעוד אצל תמר שניהם צדיקים ונכתב "תאומים" מלא. עשו "אדמוני" — סימן ששופך דמים. "כאדרת שער" — מלא שיער כטלית. נקרא "עשו" — כי היה נעשה ונגמר בשיערו. יעקב אוחז בעקב עשו — כי נוצר ראשון ורצה ליטול בכורה מהדין. "ויקרא שמו יעקב" — הקב"ה קראו.`,

      english: `"Yitzchak son of Avraham; Avraham begot Yitzchak" — why the repetition? Because the scoffers claimed Sarah conceived from Avimelech, so Hashem shaped Yitzchak's face to look exactly like Avraham. Yitzchak married Rivkah at forty — he was 37 at the Akeidah when Sarah died and Rivkah was born, and he waited three years for her.

Rivkah is again called "daughter of Betuel, sister of Lavan" — to praise her: daughter of a wicked man, sister of a wicked man, in a place of wicked people, yet she didn't learn from their deeds. "Padan Aram" — from the word for yoke of oxen, or "field" in Yishmaelite language. "Vaye'etar" — he prayed abundantly and insistently. "He was entreated by him" — not by her — because the prayer of a righteous son of a righteous father surpasses that of a righteous child of a wicked one. "Opposite his wife" — he in one corner, she in another, both praying.

"The children struggled" — from the word for running: when passing Torah academies, Yaakov kicked to get out; when passing idol worship, Esav kicked. Rivkah says "if so, why am I?" — why did I pray for this? She goes to inquire at the academy of Shem. "Two nations" — great ones like Antoninus and Rabbi. "From your womb they shall separate" — from the womb itself, one to wickedness, one to integrity. "One shall overpower the other" — when one rises, the other falls.

"Tomim" is spelled deficiently — because one was righteous and one wicked, unlike Tamar's twins who were both righteous. Esav was "ruddy" — a sign he would shed blood. "Like a hairy garment" — covered in hair like a woolen cloak. Called "Esav" — because he was fully formed with hair at birth. Yaakov grasps Esav's heel — formed first, he sought the birthright by right. "He called his name Yaakov" — Hashem named him.`
    },
    {
      partId: 2,
      hebrew: `יצחק לא לקח שפחה למרות עקרות רבקה — כי נתקדש בעקידה כעולה תמימה ואינו רשאי. בני שלוש עשרה נעשו הבדלים: יעקב הלך לבתי מדרשות, עשו לבתי עבודה זרה.

עשו "יודע ציד" — צד ומרמה את אביו בדבריו, שואל "איך מעשרים את המלח והתבן?" כדי שיצחק יחשוב שהוא מדקדק במצוות. "איש שדה" — אדם בטל שצודה בקשתו. יעקב "תם" — שאינו בקי ברמאות, כלבו כן פיו. "יושב אוהלים" — אוהלו של שם ואוהלו של עבר. "כי ציד בפיו" — בפה יצחק שאכל מצידו, או בפיו של עשו שמרמה בדבריו.

"ויזד יעקב" — לשון בישול. עשו "עיף" — ברציחה. "הלעיטני" — אפתח פי ושפוך הרבה לתוכה, כהאכלת גמל. דווקא עדשים — כי אותו היום מת אברהם, ועדשים עגולות כגלגל שהאבלות מתגלגלת, ואין להן פה כאבל. "מכרה כיום" — כיום שהוא ברור, מכירה מוחלטת. יעקב רצה בכורה — כי העבודה בבכורות ורשע כעשו אינו כדאי להקריב. עשו "הולך למות" — כי עבודת הבכורות כרוכה באזהרות ומיתות. "ויבז עשו" — העיד הכתוב על רשעו שביזה עבודת ה'.

ה' אומר ליצחק "אל תרד מצרימה" — כי הוא עולה תמימה ואין חוצה לארץ כדאי לו. "והתברכו בזרעך" — שאדם יאמר לבנו "יהא זרעך כזרעו של יצחק". "משמרתי" — גזירות להרחקה. "מצוותי" — דברים שהשכל מחייב. "חוקותי" — גזירות שיצר הרע ואומות משיבים עליהם.`,

      english: `Yitzchak didn't take a maidservant despite Rivkah's barrenness — he was sanctified at the Akeidah as an unblemished offering and wasn't permitted. At thirteen the differences emerged: Yaakov went to Torah academies, Esav to idol worship.

Esav was "a skilled hunter" — hunting and deceiving his father with words, asking "How does one tithe salt and straw?" so Yitzchak would think he was meticulous in mitzvot. "A man of the field" — an idle person hunting with his bow. Yaakov was "tam" (wholesome) — not skilled in deception, his mouth matching his heart. "Dwelling in tents" — the tents of Shem and Ever. "For game was in his mouth" — either in Yitzchak's mouth (he ate the game), or in Esav's mouth (deceiving with words).

"Yaakov cooked" — the word means cooking. Esav was "tired" — from murder. "Pour into me" — open my mouth and pour much in, like feeding a camel. Specifically lentils — because Avraham died that day, and lentils are round like the wheel of mourning that turns in the world, and have no mouth like a mourner. "Sell me today" — clear as day, an absolute sale. Yaakov wanted the birthright because the Temple service was performed by firstborns, and a wicked person like Esav shouldn't serve Hashem. Esav says "I am going to die" — because the firstborn's service carries death penalties. "Esav scorned" — Scripture testifies to his wickedness in scorning divine service.

Hashem tells Yitzchak "Don't go to Egypt" — he is an unblemished offering, and the land outside Israel isn't befitting. "They shall bless themselves by your seed" — people will say to their children "may your seed be like Yitzchak's." "My safeguards" — protective decrees. "My commandments" — things reason demands. "My statutes" — decrees that the evil inclination and nations question.`
    },
    {
      partId: 3,
      hebrew: `"תורתי" — תורה שבעל פה ותורה שבכתב. "כי ארכו לו שם הימים" — אורך הימים גרם לו שלא נזהר עוד, כי חשב שאין סכנה. "וישקף אבימלך" — ראה את יצחק ורבקה מתנהגים כבעל ואישה. "אחד העם" — המיוחד בעם, הוא המלך.

יצחק זורע ומוצא "מאה שערים" — ולמה אמדוה? למעשרות. "ויגדל האיש" — הבריות אומרות: זבל פרדותיו ולא כסף וזהב אבימלך. "ועבדה רבה" — עבודה רבה. הפלשתים סתמו את הבארות — טענו שנזק ייגרם להם משודדים שיבואו בשבילן. על הבאר הראשונה רבו: "עשק" — התעשקו עמו. "רחובות" — ה' הרחיב לנו ופרינו בארץ.

"אחוזת מרעהו" — פירושו: חבורת מרעיו. "ראו ראינו כי היה ה' עמך" — שתי ראיות, שהיה ה' עם אביו ועמו. "אלה" — השבועה שהייתה בינינו מימי אביך. "לא נגענוך" — הפלשתים ניסו להתנקות, אך לפי רש"י דרכם לא הייתה נקייה. באר שבע — על שם השבועה.

עשו נושא נשים בגיל ארבעים — נמשל לחזיר הפושט טלפיו להראות שהוא טהור; כך עשו הציג עצמו כישר כדי להידמות לאביו. נשותיו היו "מורת רוח" — מקטרות לעבודה זרה. עיני יצחק כהות — מעשן הקטורת של נשות עשו, או מדמעות מלאכי השרת שנפלו על עיניו בעקידה, או כדי שיעקב יקבל את הברכות. יצחק אומר "לא ידעתי יום מותי" — כשאדם מגיע לגיל של חמש שנים לפני גיל פטירת הוריו, ידאג.`,

      english: `"My Torah" — the Oral Torah and the Written Torah. "When his days there were long" — the long stay made him careless, thinking there was no danger. "Avimelech looked" — he saw Yitzchak and Rivkah behaving as husband and wife. "One of the people" — the distinguished one, meaning the king himself.

Yitzchak sows and reaps "a hundredfold" — why did they assess it? For tithes. "The man grew great" — people said: the dung of his mules is worth more than Avimelech's silver and gold. "Much work" — a large workforce. The Philistines sealed the wells — claiming bandits would come because of them. They quarreled over the first well: "Esek" (contention). "Rechovot" — Hashem has made room for us and we shall be fruitful.

"Achuzat his companion" — meaning a group of his friends. "We have clearly seen that Hashem is with you" — two seeings: He was with your father and with you. "The oath" — the one between us from your father's days. "We have not touched you" — the Philistines tried to appear innocent, though Rashi notes their conduct wasn't clean. Be'er Sheva — named for the oath.

Esav marries at forty — compared to a pig that extends its hooves to appear kosher; so Esav presented himself as upright to resemble his father. His wives were "a bitterness of spirit" — burning incense to idols. Yitzchak's eyes grew dim — from the smoke of his daughters-in-law's incense, or from the tears of angels that fell on his eyes at the Akeidah, or so that Yaakov would receive the blessings. Yitzchak says "I don't know the day of my death" — when a person reaches five years before their parents' age of death, they should worry.`
    },
    {
      partId: 4,
      hebrew: `יצחק אומר "שא נא כליך" — "נא" לשון בקשה, שחטו כהלכה ולא תאכילני נבילה. "צודה לי ציד" — מן ההפקר ולא מן הגזל. רבקה אומרת "שני גדיי עזים" — אחד לקורבן פסח ואחד למטעמים. "שני" — שלא יאמרו שהן של יצחק. בשר גדי טעמו כצבי. עשו "איש שעיר" — בעל שיער. בגדי עשו "החמודות" — שחמד אותם מנמרוד. הבגדים אצל רבקה "בבית" — כי עשו לא סמך על נשותיו.

יעקב אומר "אנכי עשו בכורך" — "אנכי" הוא שמגיש לפניך, ו"עשו" הוא בכורך. "קום נא שבה" — לשון תחנונים, בעוד עשו מדבר בקנטוריא. יצחק חשד — "גשה נא ואמשך" — כי הקול היה קול יעקב. "הקול קול יעקב" — שמדבר בלשון תחנונים. "אתה זה בני עשו" — ענה "אני", לא שיקר ממש.

ריח גן עדן נכנס עם יעקב — "כריח שדה אשר ברכו ה'", לא ריח העיזים. "ויתן לך האלוהים" — בדין: אם ראוי ייתן, אם לאו לא. אך לעשו — בין צדיק בין רשע ייתן, שלא יקרא תגר. "ישתחוו לך בני אמך" — ולא "בני אביך" כי אחיו של יעקב מאמו, אבל ישמעאל ובני קטורה לא מחויבים. "אורריך ארור ומברכיך ברוך" — הקללה לפני הברכה, כי ברשעים הקללה קודמת.

"ויהי אך יצא יצא" — אך יצא זה נכנס זה. "ויחרד יצחק חרדה גדולה" — ראה גיהנם פתוחה תחת עשו.`,

      english: `Yitzchak says "take your weapons" — "na" is a request: slaughter properly so you don't feed me carrion. "Hunt me game" — from ownerless animals, not stolen ones. Rivkah says "two kids" — one for the Pesach offering, one for delicacies. "Two" — so no one says they're from Yitzchak's flock. Goat meat tastes like venison. Esav is "a hairy man." Esav's "precious garments" — taken from Nimrod. The garments were with Rivkah "at home" — because Esav didn't trust his wives with them.

Yaakov says "I am Esav your firstborn" — "I am" the one serving you, and "Esav is your firstborn." "Please rise and sit" — language of supplication, while Esav speaks commandingly. Yitzchak grew suspicious — "come near so I may feel you" — because the voice was Yaakov's. "The voice is Yaakov's voice" — speaking with supplication. "Are you my son Esav?" — he answered "I am," not quite lying.

The scent of Gan Eden entered with Yaakov — "like the scent of a field blessed by Hashem," not the smell of goat skins. "May God give you" — with judgment: if worthy, He gives; if not, He won't. But to Esav — righteous or wicked, He gives, so he won't complain. "Your mother's sons shall bow to you" — not "your father's sons," because Yishmael and Keturah's children aren't obligated. "Those who curse you are cursed, those who bless you are blessed" — the curse precedes the blessing because with the wicked, the curse comes first.

"He had just left when" — as one exited, the other entered. "Yitzchak trembled greatly" — he saw Gehinnom open beneath Esav.`
    },
    {
      partId: 5,
      hebrew: `יצחק אומר "גם ברוך יהיה" — שלא תאמר שאילו ידע לא היה מברכו, לכן הוסיף ואישר את הברכה. "בא אחיך במרמה" — בחכמה, לפי אונקלוס. עשו צועק "הכי קרא שמו יעקב" — מלשון עקבה, שרימה אותו פעמיים. יצחק אומר "הן גביר שמתיו לך" — כלומר: מה אעשה? הרי הכל ניתן לו.

"משמני הארץ יהיה מושבך" — לפי המדרש, רומז לאיטליה של יוון. "כאשר תריד" — כשיעברו ישראל על התורה ויהיה לעשו צער, אז יפרוק עולו. עשו אומר "יקרבו ימי אבל אבי" — לא רצה לצער את אביו. "ויוגד לרבקה" — הוגדו לה ברוח הקודש. "מתנחם לך להרגך" — הוא שותה כוס תנחומים, כאילו כבר אתה מת. רבקה אומרת "למה אשכל גם שניכם" — אם יהרגך, יהרגנו בניו של יצחק את עשו ואשכל שני בניי.

רבקה אומרת ליצחק "קצתי בחיי" — מפני בנות חת, כדי שישלח את יעקב לפדן ארם. "אל שדי" — מי שיש די באלוקותו, ש"די" הוא שאמר לעולם "די". "ברכת אברהם" — ברכת הארץ ואת הזרע. עשו הלך לבנות ישמעאל — ראה שרעות בנות כנען בעיני אביו, אך לא גירש את הראשונות.

"מחלת" נקראה גם "אחות נביות" — ללמד שבתואל מת ונביות השיאה, ונקראת "מחלת" כי נמחלו עוונות החתן. יעקב לא נענש על 14 שנות בית עבר — בזכות התורה. אך על 22 שנה שנעדר מביתו, נענש 22 שנה שיוסף נעדר ממנו. נישואי עשו "על נשיו" — הוסיף רעה על רעותיו, שלא גירש את הראשונות.`,

      english: `Yitzchak says "he too shall be blessed" — lest you say he wouldn't have blessed him if he'd known; he confirms the blessing stands. "Your brother came with cleverness" — with wisdom, per Onkelos. Esav cries "Is he not rightly named Yaakov?" — from the word for heel/deceit, that he tricked him twice. Yitzchak says "I have made him your master" — meaning: what can I do? Everything was given to him.

"Your dwelling shall be of the fat of the earth" — the midrash says this refers to Italian Greece. "When you are aggrieved" — when Israel transgresses the Torah and Esav has legitimate grievance, he shall cast off the yoke. Esav says "let the days of mourning for my father approach" — he didn't want to distress his father. "It was told to Rivkah" — she was told through divine inspiration. "He consoles himself to kill you" — he drinks a cup of consolation as if you're already dead. Rivkah says "why should I lose both of you" — if he kills you, Yitzchak's sons will kill Esav, and I'll lose both.

Rivkah tells Yitzchak "I am disgusted with my life" — because of the Hittite women, so he'd send Yaakov to Padan Aram. "El Shaddai" — the One whose divinity is sufficient, who said "enough" to the world. "The blessing of Avraham" — the blessing of the land and the seed. Esav went to Yishmael's daughters — seeing that Canaanite women displeased his father, but he didn't divorce the first wives.

"Machalat" is also called "sister of Nevayot" — teaching that Betuel had died and Nevayot gave her away, and she's called "Machalat" because a groom's sins are forgiven. Yaakov wasn't punished for 14 years at Ever's academy — in the merit of Torah. But for 22 years away from home, he was punished 22 years that Yosef was absent from him. Esav's marriages "in addition to his wives" — he added evil upon evil by not divorcing the first ones.`
    }
  ]
};
