# The Healing Institute — website redesign (demo)

A calmer, trauma-informed redesign of healinginstitutepllc.com. All 12 original pages are rebuilt with the practice's real content, plus a new Specialized Therapy overview page.

- `public/`: the finished website. Upload this folder to any static host.
- `build.py`: generates every page in `public/` from one shared template. Edit the content here, then run `python3 build.py`.

## Pages
Home · About · Our Provider · Specialized Therapy (overview) · Complex Trauma / C-PTSD · Dissociative Disorders · Borderline Personality Disorder · EMDR Therapy · Clinical Hypnosis · Blog · 2 blog posts · Contact · 404

## Free hosting for the demo (about 1 minute)
1. Go to https://app.netlify.com/drop
2. Drag the `public` folder (or unzip `healing-institute-demo.zip` and drag that folder) onto the page.
3. Netlify gives you a live link right away. Create a free account to keep it online and rename it (e.g. `healing-institute-demo.netlify.app`).

## To confirm with Brian before going live
- The contact form opens the visitor's email app. For a real inbox form, connect a HIPAA-appropriate form service.
- "Getting started" steps describe a general intake flow. Adjust to match how the practice actually schedules.
- Insurance, fees, telehealth and hours are not mentioned because the current site doesn't state them.
