# Where to put pictures

Put **all** website pictures inside this folder:

```
Frontend/public/images/
```

Anything in `public/` is served as-is. A file saved as
`Frontend/public/images/sardine-bread.jpg` is used in code as:

```tsx
<img src="/images/sardine-bread.jpg" alt="Sardine Bread" />
```

## Suggested layout

```
public/images/
  logo.png               # Univent logo (replaces the "U" badge if you want)
  hero-hotel.jpg         # homepage hero collage
  hero-bakery.jpg
  rooms/
    double-deluxe-1.jpg
    royal-standard-1.jpg
    ...
  bakery/
    sardine-bread.jpg
    white-bread.jpg
    meatpie.jpg
    ...
  facilities/
    pool.jpg  gym.jpg  restaurant.jpg  conference.jpg
  team/
    director.jpg  bakery-manager.jpg  ...
```

## Rules

1. **Web formats only:** `.jpg` for photos, `.png` for logos, `.webp` if you can (smallest).
2. **Resize before uploading:** rooms/bakery max **1200px wide**, thumbnails **600px**. Big files slow the site.
3. **Names:** lowercase, no spaces — `royal-suite-1.jpg`, not `Royal Suite (1).JPG`.
4. **Swap a picture:** replace the `src="https://images.unsplash.com/..."` links in
   `src/data/mockData.ts` with your local path, e.g. `images: ['/images/rooms/double-deluxe-1.jpg']`.
5. **Favicon/logo:** replace `public/favicon.svg` to change the browser tab icon.

> Tip: after adding pictures, restart `npm run dev` so Vite picks up the new files.
