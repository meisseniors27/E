/* =====================================================================
   MEIS SENIORS '27  -  THE ONLY FILE YOU NEED TO EDIT
   Change the text between the quote marks "like this". Keep the commas.
   Save the file, upload it again, done. (See README.md)
   ===================================================================== */

window.SITE = {

  /* ---------- DATES (year-month-dayThour:minute:second, 24-hour clock) ---------- */
  startDate: "2026-09-12T08:00:00",          // start of the school year (the little road starts here)

  countdowns: [
    {
      id: "exam",
      label: "Final Exam",
      date: "2027-07-21T09:00:00",           // <<< CHANGE ME: your real final exam date
      sub: "until the final exam (we believe in you. a little.)",
      joke: "Every second brings us closer. Also closer to exams. Sorry.",
      done: "The exams are over. Breathe. Hydrate. Never speak of it."
    }
  ],

  /* ---------- FRONT DOOR ---------- */
  countdownTitle: "The Final Countdown",       // first button, big text
  countdownSub: "Every second brings us closer.",  // first button, small text
  enterTitle: "Enter our home",             // second button, big text
  enterSub: "Explore our life.",           // second button, small text
  welcome: "Welcome in the home of our memories",  // the typed line

  /* ---------- HOME PAGE ---------- */
  warning: "warning: contains pure legends",
  bubble: "Yes, we really are graduating.",
  groupPhoto: "photos/group.jpg",            // put your group photo in the photos folder with this name
  groupCaption: "the whole crew (on a good day)",
  band: ["SCAN. SMILE. REMEMBER.", "STILL HERE, STILL ICONIC", "NO TEACHERS WERE HARMED"],
  rules: ["Smile.", "Do not judge the baby photos.", "Be nice in the secret mail."],
  excuses: [
    "My alarm went off. I went off too.",
    "I was fighting a very rude pigeon.",
    "My bed filed a restraining order against me.",
    "The bus was late. I was also late. Teamwork.",
    "I got lost in my own house.",
    "Traffic. (I was in the traffic. I was the traffic.)",
    "I was emotionally preparing for the day. It took 40 minutes.",
    "Mercury is in retrograde. Allegedly."
  ],

/* ---------- RANDOMS (Weekly Drops / Ta3feelat) ---------- */
  randoms: [
     ["photos/random1.jpg", "Pure chaos"],
  ],

  /* ---------- THE PEOPLE ----------
     Photo files go in the "people" folder, named after the person in small letters with dashes:
        Eyad Taha  ->  people/eyad-taha.jpg       (their photo)
                       people/eyad-taha-baby.jpg  (their baby photo)
     No photo yet? The card shows a funny placeholder. Nothing breaks.  */
  people: [
    "Eyad Taha", "Sodfa", "Jamila Amr", "Mohamed Alaa", "Khalid", "Ahmed Mahmoud",
    "Eyad Ashraf", "Mohamed Essam", "Nabil", "Fares", "Bedo", "Abdullah Mansour",
    "Youssef Zaky", "Lojy", "Rodine", "Yahya Wael", "Youssef Wael", "Youssef Sayed",
    "Ahmed Younis", "Menna", "Zeina Ahmed", "Sandy", "Youssef Tarek", "Ayten",
    "Jumana", "Retaj", "Fajr", "Abdullah Hesham", "Mohamed Elsayed", "Maisan",
    "Karim", "Yassin Nader"
  ],

  /* ---------- TRIPS ----------
     "folder" = a folder name inside "trips". Put the trip photos in it, named 1.jpg, 2.jpg ...
     (Example: trips/first-trip/1.jpg)  */
  trips: [
  { name: "Our First Trip (rename me)", date: "Month 2026", note: "Where we went, and how we got lost.", folder: "first-trip" },
    { name: "The Big Trip (rename me)",   date: "Month 2027", note: "Nobody remembers the plan. Everybody remembers the snacks.", folder: "big-trip" }
  ],
  /* ---------- SECRET MAIL ----------
     Paste the long link you get from Google Apps Script here (README step 9). */
  mailApi: "https://script.google.com/macros/s/AKfycbxOLCa7wjYURtW-9iH2skoVqE69WbbDOX0Fxt8ByRwqITdG5PmwxYgTBpAqCgwo7-kC/exec"
};
