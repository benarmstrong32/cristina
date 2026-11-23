// Editable copy for the client's "Next steps" tab. Update `asOf` whenever this changes.
export const NEXT_STEPS = {
  asOf: "2026-11-23",

  recentChanges: [
    {
      title: "Application funnel updated to match the new offer",
      detail:
        "The application pages now lead with the same promise as the new ads: you don’t pay a penny until your team decides it’s worth it. The ad and the page now say the same thing, which should lift how many people finish applying.",
    },
    {
      title: "Automatic alerts for partial applications",
      detail:
        "When someone starts the application but doesn’t finish, Chris now gets an email and a text with everything they entered, so he can follow up personally. They also get a short reminder sequence encouraging them to finish.",
    },
  ],

  learningPhase: {
    title: "Why we give new ads time before judging them",
    body: [
      "Meta’s delivery system spends each new ad set’s first stretch in a “learning phase,” testing who to show the ads to. It needs roughly 50 results in a week to settle. At $10–$20 a day, the new ad sets will produce a handful of applications a week, not 50, so day-to-day numbers swing a lot and early results can look better or worse than they really are.",
      "That’s why we set the yardstick before we look (cost per qualified applicant) and give each new ad set about two weeks before deciding. It’s also why we don’t edit an ad set while it’s running: any change to its budget, audience or creative restarts learning and throws away what Meta has learned. When we want to change something, we copy the ad set and run the new version alongside it.",
    ],
  },

  nextSteps: [
    {
      title: "Back the “Pay only if it works” static",
      detail:
        "The Offer Static has brought in 2 applicants, both qualified, and 1 booked call on about $41 of spend, the best early result in the account. We’ll copy it into its own ad set with more budget (rather than editing the live one) and add 2–3 new versions of the same offer with different headlines.",
    },
    {
      title: "Rework the UGC videos",
      detail:
        "The two UGC videos have had about 900 impressions but only 2 link clicks, and their click-through rate is well below similar advertisers. The first three seconds aren’t stopping the scroll. We’ll test new opening hooks, and if they haven’t improved by about two weeks in (around Dec 1), we’ll pause them and move that budget to the statics.",
    },
    {
      title: "Refresh the Brand Video",
      detail:
        "The Brand Video still drives most of the volume, but its click-through and conversion rates have dropped compared with its first weeks, a sign people have seen it enough. We’ll keep it running while we test shorter cut-downs and new opening lines of Chris’s story.",
    },
    {
      title: "Follow up with everyone who raised a hand",
      detail:
        "Two qualified applicants (Jeong and Tricia) haven’t booked a call yet and are worth a personal reach-out. Marking each call as showed or no-show in GoHighLevel after it happens lets this scorecard show attended calls and, later, closed deals.",
    },
  ],
};
