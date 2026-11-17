/**
 * worksData — src/Components/worksData.js
 * One entry per project. Works.jsx draws a card for each; WorkCase.jsx looks
 * an entry up by `slug` and draws its page.
 *
 *   slug        URL segment: /work/<slug>
 *   code        short display mark on the card (keep it to ~4 characters)
 *   title       full name; shown as "[ TITLE ]" on the card
 *   titleLines  optional — how the big heading breaks on the case page
 *   year, client, type, role   card meta (leave any of them out to hide it)
 *   category    list shown on the case page
 *   status      optional — shown under "When" on the case page only,
 *               never on the card
 *   url         optional — adds a "Visit website" link on the case page
 *   awards      optional list; the column disappears when it is empty
 *   video       background loop (mp4/webm), path from the public folder
 *   poster      optional still shown before the video loads / with reduced
 *               motion
 *   badge       optional { src, alt } image pinned top-right on the card
 *   href        optional external URL — the card opens it in a new tab
 *               instead of going to the case page
 *   cta         optional label, defaults to "Show case"
 *
 * Case page content (all optional):
 *   sections    list of blocks under the video. Each one:
 *                 label    small label in the left rail ("Intro")
 *                 heading  string, or a list of lines to control the breaks
 *                 body     string, or a list of paragraphs
 *                 lead     true → slightly larger text (use on the first)
 *                 stats    [{ label, value }] — up to three big numbers
 *                 media    { layout, items } shown under the text
 *                            layout "full"   1 item,  wide
 *                                   "split"  2 items, wide + square
 *                                   "stack"  3 items, two stacked + one tall
 *                            item   { src, alt, poster, color, fit, ratio }
 *                                   fit "natural"  full width, tile takes the
 *                                                  picture's own shape: no
 *                                                  crop, no zoom (use with
 *                                                  the "full" layout)
 *                                       "cover"    default: fills the tile
 *                                                  and crops the overflow
 *                                       "contain"  whole picture inside the
 *                                                  fixed tile
 *                                   ratio forces a tile shape, e.g. "3 / 2"
 *                                   src can be an image or a video, as a path
 *                                   from the public folder ("/cherry.jpg").
 *                                   Until the file exists the tile is a plain
 *                                   block (grey, or `color` if you set one)
 *   credits     { items: [{ label, lines }], team: ["Name (role)", …] }
 */
export const WORKS = [
  {
    slug: "qahua-cultr",
    code: "Q_C",
    title: "Qahua Cultr",
    titleLines: ["Qahua", "Cultr"],
    year: "2026",
    client: "Qahua Cultr",
    role: "Design, development",
    category: ["Web design", "Development"],
    status: "In progress",
    url: "https://qahua-private.vercel.app",
    video: "/home.mp4",

    // DRAFT COPY — written from the site's own description. Rewrite it in
    // your words. Media paths are files in the public folder; a tile whose
    // file isn't there yet shows as a plain grey block until you add it.
    sections: [
      {
        label: "Intro",
        heading: ["A front door for", "Indian green coffee"],
        body: "Qahua Cultr exports specialty green coffee from India, sourcing Arabica and Robusta from Chikmagalur, Coorg and Wayanad. The website is the company's introduction to buyers abroad: who they are, where the beans come from, and how to start a conversation.",
        media: { layout: "full", items: [{ src: "/coffee.mp4", fit: "natural" }] },
      },
      {
        label: "Challenge",
        heading: ["Earning trust before", "the first sample ships"],
        body: "Green coffee is bought on confidence — origin, grade and consistency matter long before anyone tastes a cup. A young export brand has to show that credibility on screen, to people who have never visited the farms.",
        media: {
          layout: "split",
          // Unsplash photos (free to use under the Unsplash License) —
          // stand-ins until you have your own: the farms the beans come from.
          items: [
            {
              // Misty coffee plantation in the hills, India — Tejj
              src: "https://images.unsplash.com/photo-1571244007059-888ae90b5d85?w=2000&h=1000&q=80&auto=format&fit=crop",
              alt: "A coffee plantation in morning fog",
            },
            {
              // Ripening coffee cherries on the tree — Projeto Café Gato-Mourisco
              src: "https://images.unsplash.com/photo-1654815439629-5e93cb7f74a1?w=1200&h=1200&q=80&auto=format&fit=crop",
              alt: "Red coffee cherries ripening on a branch",
            },
          ],
        },
      },
      {
        label: "Process",
        heading: ["Designed and built", "in one pair of hands"],
        body: "I'm handling the project end to end, from structure and visual design through to the front-end build, so decisions made in the layout carry straight into the code. The site is still in progress, and this page will grow as it ships.",
        media: {
          layout: "full",
          items: [
            {
              // A handful of freshly picked coffee cherries — George Dagerotip (Unsplash)
              src: "https://images.unsplash.com/photo-1670758611084-e216510c5433?w=2400&h=1420&q=80&auto=format&fit=crop",
              alt: "A hand holding freshly picked coffee cherries",
            },
          ],
        },
      },
      // When the site is live and you have numbers, add a results block:
      // {
      //   label: "Results",
      //   heading: "…",
      //   body: "…",
      //   stats: [
      //     { label: "Enquiries [per month]", value: "00" },
      //     { label: "Countries reached", value: "00" },
      //     { label: "Load time [seconds]", value: "0,0" },
      //   ],
      //   media: { layout: "stack", items: [{}, {}, {}] },
      // },
    ],

    credits: {
      items: [
        { label: "Client", lines: ["Qahua Cultr"] },
        { label: "My role", lines: ["Designer &", "developer"] },
      ],
      team: ["Hussaib Nizaan (Design, Development)"],
    },
  },
  {
    slug: "luke-shipping",
    code: "L_SC",
    title: "Luke Shipping",
    titleLines: ["Luke", "Shipping"],
    // year: "2025",   // add the year you built it
    client: "Luke Shipping Company",
    role: "Design, development",
    category: ["Web design", "Development"],
    url: "https://lukeshipping.com",
    video: "/luke.mp4",

    // Copy written from lukeshipping.com's own description of its services.
    // Photos are free Unsplash stand-ins until you have your own.
    sections: [
      {
        label: "Intro",
        heading: ["Freight forwarding", "for the Gulf"],
        body: "Luke Shipping moves cargo across Saudi Arabia and the wider GCC by road, air and sea. Alongside transport they handle customs clearance, warehousing and project cargo, so a business can hand over a shipment and stop worrying about it. I designed and built their website to show all of that clearly.",
        media: {
          layout: "full",
          items: [
            {
              // Stacked shipping containers at a terminal — Wolfgang Weiser
              src: "https://images.unsplash.com/photo-1706438803687-0b592612f846?w=2400&h=1420&q=80&auto=format&fit=crop",
              alt: "Shipping containers stacked at a port terminal",
            },
          ],
        },
      },
      {
        label: "Challenge",
        heading: ["Six services,", "one clear first impression"],
        body: "Freight forwarding, sea and air freight, road transport, customs clearance, warehousing and project cargo are very different jobs, and most visitors arrive needing just one of them. The site had to show the full range without overwhelming anyone, and make the way to a quote obvious from every page.",
        media: {
          layout: "split",
          items: [
            {
              // A truck on a desert road — Qingqing Cai
              src: "https://images.unsplash.com/photo-1728995848808-2cbb5a891837?w=2000&h=1000&q=80&auto=format&fit=crop",
              alt: "A truck driving along a desert road",
            },
            {
              // Containers stacked high at a busy port — 雙 film
              src: "https://images.unsplash.com/photo-1773126378915-793b5c48fb38?w=1200&h=1200&q=80&auto=format&fit=crop",
              alt: "Shipping containers stacked high at a busy port",
            },
          ],
        },
      },
      {
        label: "Process",
        heading: ["Built around", "the enquiry"],
        body: "I organised the site around the questions a shipper actually asks: can you move this, where to, and how do I get a quote. Each service gets its own plain explanation, the look stays dark and confident to match the brand, and getting in touch is never more than one step away. I handled it end to end, from structure and design to the front end build.",
      },
    ],

    credits: {
      items: [
        { label: "Client", lines: ["Luke Shipping", "Company"] },
        { label: "My role", lines: ["Designer &", "developer"] },
      ],
      team: ["Hussain Nizaan (Design, Development)"],
    },
  },
];

export default WORKS;