/**
 * Seed sample CMS content for The Church of Christ, Evueta.
 *
 * Run from studio/:
 *   npx sanity exec scripts/seed.ts --with-user-token
 *
 * Idempotent: every document uses a stable `seed-<type>-<slug>` id and is written
 * with createOrReplace, so re-running overwrites in place with no duplicates.
 * All documents are created `status: "published"` with real (non-draft) ids so
 * they surface through the public read layer.
 *
 * The ids are hyphenated, not dotted: a dot in a Sanity `_id` starts a new path
 * segment, and a public dataset's ACL only grants anonymous read to
 * single-segment ids (`_id in path("*")`). `seed.sermon.x` would be a 3-segment
 * id and invisible to logged-out visitors; `seed-sermon-x` is one segment.
 *
 * Remove everything again with:  npm run unseed
 *
 * Dates use West Africa Time (WAT, +01:00, no DST) — a seed assumption, see
 * prompts/seed-sample-content.md D7.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-08-29'})

// ---------------------------------------------------------------------------
// Minimal valid single-page PDF generator (correct xref table).
// ---------------------------------------------------------------------------

function makePdf(title: string, lines: string[]): Buffer {
  const esc = (s: string) =>
    s
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/([\\()])/g, '\\$1')

  const content =
    `BT\n/F1 18 Tf\n72 730 Td\n(${esc(title)}) Tj\n/F1 11 Tf\n` +
    lines.map((l) => `0 -20 Td\n(${esc(l)}) Tj\n`).join('') +
    `ET`

  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  ]

  let pdf = `%PDF-1.4\n`
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'))
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefStart = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += `0000000000 65535 f \n`
  offsets.forEach((off) => {
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return Buffer.from(pdf, 'latin1')
}

// ---------------------------------------------------------------------------
// Portable Text helpers
// ---------------------------------------------------------------------------

let keySeq = 0
const key = () => `k${(keySeq++).toString(36)}`

type Blk = [style: string, text: string]

function toPortableText(blocks: Blk[]) {
  return blocks.map(([style, text]) => ({
    _key: key(),
    _type: 'block',
    style,
    markDefs: [],
    children: [{_key: key(), _type: 'span', text, marks: []}],
  }))
}

// ---------------------------------------------------------------------------
// Content — sermons
// ---------------------------------------------------------------------------

type SermonSeed = {
  slug: string
  title: string
  speaker: string
  date: string
  series?: string
  ministry?: string
  mediaUrl?: string
  body: Blk[]
}

const SERMONS: SermonSeed[] = [
  {
    slug: 'the-pattern-of-new-testament-worship',
    title: 'The Pattern of New Testament Worship',
    speaker: 'Michael Alexander',
    date: '2026-08-23T10:30:00+01:00',
    mediaUrl: 'https://www.youtube.com/watch?v=8f3b2a1c9d0',
    series: 'The New Testament Church',
    ministry: 'Worship',
    body: [
      ['normal', 'When the first-century church assembled on the first day of the week, its worship was neither improvised nor borrowed from the surrounding culture. It followed a pattern we can still read in the pages of the New Testament.'],
      ['h2', 'Five Acts, One Purpose'],
      ['normal', 'Teaching and preaching from the Scriptures (Acts 20:7), singing that teaches and admonishes (Ephesians 5:19; Colossians 3:16), praying together (Acts 2:42), giving as we have been prospered on the first day of the week (1 Corinthians 16:1-2), and eating the Lord’s Supper in memory of His death (1 Corinthians 11:23-26).'],
      ['blockquote', '"And they continued stedfastly in the apostles’ doctrine and fellowship, and in breaking of bread, and in prayers." (Acts 2:42)'],
      ['normal', 'Where the New Testament gives a pattern, we have no authority to add to it or take from it. Our aim every Lord’s Day is simply to do what the church did then, for the reasons they did it.'],
    ],
  },
  {
    slug: 'why-we-sing-without-instruments',
    title: 'Why We Sing Without Instruments',
    speaker: 'David Coleman',
    date: '2026-08-16T10:30:00+01:00',
    series: 'The New Testament Church',
    ministry: 'Worship',
    body: [
      ['normal', 'Visitors often ask why our singing is unaccompanied. The answer is not that instruments are wicked in themselves, but that in worship we are bound by what God has authorized.'],
      ['h2', 'The New Testament Speaks'],
      ['normal', 'Every passage that addresses music in Christian worship specifies singing: Matthew 26:30, Acts 16:25, Romans 15:9, 1 Corinthians 14:15, Ephesians 5:19, Colossians 3:16, Hebrews 2:12, and James 5:13. The instrument named is the heart.'],
      ['blockquote', '"...singing and making melody in your heart to the Lord." (Ephesians 5:19)'],
      ['normal', 'For the first several centuries the church sang a cappella. We continue that practice not out of tradition but out of respect for the silence of the Scriptures.'],
    ],
  },
  {
    slug: 'the-lords-supper-every-first-day-of-the-week',
    title: 'The Lord’s Supper Every First Day of the Week',
    speaker: 'Michael Alexander',
    date: '2026-08-09T10:30:00+01:00',
    mediaUrl: 'https://www.youtube.com/watch?v=1a2b3c4d5e6',
    series: 'The New Testament Church',
    ministry: 'Worship',
    body: [
      ['normal', 'The Lord’s Supper is the center of our assembly, not an occasional add-on. It was instituted by Christ, explained by Paul, and practiced weekly by the early church.'],
      ['h2', 'When Did They Eat It?'],
      ['normal', 'Acts 20:7 tells us the disciples at Troas came together on the first day of the week to break bread. Every first day is the first day of the week; so the church observed it every week.'],
      ['blockquote', '"For as often as ye eat this bread, and drink this cup, ye do shew the Lord’s death till he come." (1 Corinthians 11:26)'],
      ['normal', 'We come to the table to remember Him, to examine ourselves, and to proclaim His death until He returns.'],
    ],
  },
  {
    slug: 'baptism-for-the-remission-of-sins',
    title: 'Baptism for the Remission of Sins (Acts 2:38)',
    speaker: 'Michael Alexander',
    date: '2026-08-02T10:30:00+01:00',
    series: 'Back to the Bible',
    ministry: 'Evangelism',
    body: [
      ['normal', 'On the day the church began, Peter told convicted believers exactly what to do. His answer has never changed.'],
      ['blockquote', '"Repent, and be baptized every one of you in the name of Jesus Christ for the remission of sins, and ye shall receive the gift of the Holy Ghost." (Acts 2:38)'],
      ['h2', 'A Burial, Then a New Life'],
      ['normal', 'Baptism is a burial in water (Romans 6:3-4), for a penitent believer (Mark 16:16), that puts one into Christ (Galatians 3:27) and washes away sins (Acts 22:16). It is not a work of merit but an act of faith in the working of God (Colossians 2:12).'],
      ['normal', 'If you have never obeyed the gospel in this way, there is nothing to wait for.'],
    ],
  },
  {
    slug: 'the-church-you-read-about-in-the-bible',
    title: 'The Church You Read About in the Bible (Matthew 16:18)',
    speaker: 'James Whitfield',
    date: '2026-07-26T10:30:00+01:00',
    mediaUrl: 'https://youtu.be/9z8y7x6w5v4',
    series: 'The New Testament Church',
    body: [
      ['normal', 'Jesus promised to build His church, and He did. It began in Jerusalem in about A.D. 33, wears His name, and is described in enough detail that it can be identified and restored in any generation.'],
      ['h2', 'Marks of the Lord’s Church'],
      ['normal', 'One body (Ephesians 4:4), founded on Christ (1 Corinthians 3:11), governed congregationally by elders and deacons (Philippians 1:1), entered by baptism (Acts 2:47), and faithful to the apostles’ doctrine.'],
      ['blockquote', '"...upon this rock I will build my church; and the gates of hell shall not prevail against it." (Matthew 16:18)'],
      ['normal', 'We are not trying to start a new church or reform an old one. We are simply being the church described on the pages of the New Testament.'],
    ],
  },
  {
    slug: 'speak-where-the-bible-speaks',
    title: 'Speak Where the Bible Speaks, Be Silent Where It Is Silent',
    speaker: 'Michael Alexander',
    date: '2026-07-19T10:30:00+01:00',
    series: 'Back to the Bible',
    body: [
      ['normal', 'This old plea captures a simple conviction: the Bible is a sufficient and safe guide, and we have no right to bind where it has not bound or to loose where it has not loosed.'],
      ['h2', 'A Safe Rule'],
      ['normal', 'When we say only what the Bible says and do only what it authorizes, believers of every background can stand together on the same ground. Human creeds divide; the Scriptures unite.'],
      ['blockquote', '"If any man speak, let him speak as the oracles of God." (1 Peter 4:11)'],
      ['normal', 'The New Testament is our only creed, and it is enough.'],
    ],
  },
  {
    slug: 'giving-as-we-have-been-prospered',
    title: 'Giving as We Have Been Prospered (1 Corinthians 16:2)',
    speaker: 'David Coleman',
    date: '2026-07-12T10:30:00+01:00',
    ministry: 'Worship',
    body: [
      ['normal', 'The collection is an act of worship, planned and purposeful, offered every first day of the week.'],
      ['blockquote', '"Upon the first day of the week let every one of you lay by him in store, as God hath prospered him..." (1 Corinthians 16:2)'],
      ['h2', 'Purposed, Not Pressured'],
      ['normal', 'Each Christian decides in his own heart what to give, gives cheerfully and not grudgingly, and gives in proportion to how God has blessed him (2 Corinthians 9:6-7).'],
      ['normal', 'This is how the local church supports preaching, benevolence, and its own work, without appeals, sales, or fundraisers.'],
    ],
  },
  {
    slug: 'the-all-sufficiency-of-scripture',
    title: 'The All-Sufficiency of Scripture (2 Timothy 3:16-17)',
    speaker: 'Michael Alexander',
    date: '2026-07-05T10:30:00+01:00',
    series: 'Back to the Bible',
    body: [
      ['normal', 'If the Scriptures can furnish a person completely for every good work, then nothing more is needed to please God.'],
      ['blockquote', '"All scripture is given by inspiration of God, and is profitable for doctrine... that the man of God may be perfect, throughly furnished unto all good works." (2 Timothy 3:16-17)'],
      ['h2', 'Everything Pertaining to Life and Godliness'],
      ['normal', 'Peter says God has already given us all things that pertain to life and godliness (2 Peter 1:3), and Jude speaks of a faith once for all delivered (Jude 3). Later revelations, ongoing councils, and evolving creeds are not needed.'],
      ['normal', 'We open the Book expecting to find, in it alone, all that God requires of us.'],
    ],
  },
  {
    slug: 'elders-deacons-and-the-work-of-the-local-church',
    title: 'Elders, Deacons, and the Work of the Local Church (1 Timothy 3)',
    speaker: 'James Whitfield',
    date: '2026-06-28T10:30:00+01:00',
    ministry: 'Leadership',
    body: [
      ['normal', 'Christ gave the local congregation a simple, workable organization: a plurality of elders who shepherd, deacons who serve, and members who do the work of ministry.'],
      ['h2', 'Qualified Men, Local Oversight'],
      ['normal', 'The qualifications of 1 Timothy 3 and Titus 1 are not suggestions. Elders oversee only the flock among them (1 Peter 5:2); there is no organization larger or smaller than the local church in the New Testament.'],
      ['blockquote', '"Take heed... to all the flock, over the which the Holy Ghost hath made you overseers, to feed the church of God." (Acts 20:28)'],
      ['normal', 'Each congregation is self-governing, self-supporting, and directly accountable to Christ.'],
    ],
  },
  {
    slug: 'saved-by-grace-through-an-obedient-faith',
    title: 'Saved by Grace Through an Obedient Faith (Ephesians 2:8-10)',
    speaker: 'Michael Alexander',
    date: '2026-06-21T10:30:00+01:00',
    series: 'Back to the Bible',
    body: [
      ['normal', 'Salvation is entirely a gift. We could never earn it. And yet the same Bible that says we are saved by grace also says we must obey.'],
      ['blockquote', '"For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: not of works, lest any man should boast." (Ephesians 2:8-9)'],
      ['h2', 'Faith That Works'],
      ['normal', 'The faith that saves is the faith that obeys (James 2:24; Hebrews 5:9; Romans 6:17-18). Grace is not opposed to obedience; it is opposed to earning. We do what God says because we trust Him, not to place Him in our debt.'],
      ['normal', 'Grace teaches us to deny ungodliness and to live soberly, righteously, and godly (Titus 2:11-12).'],
    ],
  },
  {
    slug: 'neither-catholic-nor-protestant',
    title: 'Neither Catholic nor Protestant: The Undenominational Church',
    speaker: 'David Coleman',
    date: '2026-06-14T10:30:00+01:00',
    series: 'The New Testament Church',
    body: [
      ['normal', 'We are not a denomination, not a branch of one, and not trying to be one. We are simply Christians, members of the church that belongs to Christ.'],
      ['h2', 'Christians Only'],
      ['normal', 'The disciples were called Christians first at Antioch (Acts 11:26). That name, and the New Testament’s descriptions of the church, are all the identity a congregation needs. No headquarters, no denominational name, no human founder.'],
      ['blockquote', '"Now I beseech you, brethren, by the name of our Lord Jesus Christ, that ye all speak the same thing, and that there be no divisions among you." (1 Corinthians 1:10)'],
      ['normal', 'Anyone willing to take the Bible as their only guide can be a Christian, and nothing more, right where they are.'],
    ],
  },
  {
    slug: 'restoring-first-century-christianity',
    title: 'Restoring First-Century Christianity',
    speaker: 'Michael Alexander',
    date: '2026-06-07T10:30:00+01:00',
    series: 'Back to the Bible',
    body: [
      ['normal', 'Restoration is not nostalgia. It is the conviction that the church of the New Testament can exist today wherever people are willing to follow the New Testament.'],
      ['h2', 'A Pattern, Not a Time Machine'],
      ['normal', 'We cannot go back to the first century, but we can bring the first century forward: the same gospel, the same terms of pardon, the same worship, the same organization, the same name.'],
      ['blockquote', '"Thus saith the Lord, Stand ye in the ways, and see, and ask for the old paths, where is the good way, and walk therein." (Jeremiah 6:16)'],
      ['normal', 'Every generation must do this work again for itself.'],
    ],
  },
  {
    slug: 'let-us-draw-near-a-study-of-hebrews-10',
    title: 'Let Us Draw Near: A Study of Hebrews 10',
    speaker: 'Robert Nguyen',
    date: '2026-09-23T19:00:00+01:00',
    mediaUrl: 'https://www.youtube.com/watch?v=2h3e4b5r6w7',
    series: 'Gospel Meeting 2026',
    ministry: 'Evangelism',
    body: [
      ['normal', 'Because Jesus has offered one sacrifice for sins forever, the Hebrew writer presses three appeals on us: draw near, hold fast, and consider one another.'],
      ['blockquote', '"Let us draw near with a true heart in full assurance of faith... Let us hold fast the profession of our faith without wavering... And let us consider one another to provoke unto love and to good works." (Hebrews 10:22-24)'],
      ['h2', 'Not Forsaking the Assembling'],
      ['normal', 'The same passage warns against forsaking the assembling of ourselves together (Hebrews 10:25). Faithful attendance is not legalism; it is how we hold one another up as we see the Day approaching.'],
      ['normal', 'Come each night of the meeting ready to be stirred toward love and good works.'],
    ],
  },
]

// ---------------------------------------------------------------------------
// Content — library items
// ---------------------------------------------------------------------------

type FileSeed = {label: string; filename: string; lines: string[]}
type LibrarySeed = {
  slug: string
  title: string
  description: string
  category: string
  files: FileSeed[]
}

const LIBRARY: LibrarySeed[] = [
  {
    slug: 'new-members-class-study-booklet',
    title: 'New Members Class — Study Booklet',
    description:
      'A four-lesson study for those recently baptized or placing membership: the New Testament church, our work and worship, congregational autonomy, and how to grow. Suitable for a home study or an auditorium class.',
    category: 'Bible Class',
    files: [
      {
        label: 'Study booklet',
        filename: 'new-members-class-booklet.pdf',
        lines: [
          'New Members Class - Study Booklet',
          'The Church of Christ, Evueta',
          '',
          'Lesson 1 - The Church of the New Testament',
          'Lesson 2 - Our Worship: Five Acts, One Purpose',
          'Lesson 3 - Congregational Autonomy: Elders and Deacons',
          'Lesson 4 - Growing: Bible Study, Prayer, Assembling, Service',
          '',
          'Each lesson: key texts, discussion questions, memory verse.',
        ],
      },
    ],
  },
  {
    slug: 'personal-evangelism-open-bible-study',
    title: 'Personal Evangelism: Conducting an Open-Bible Study',
    description:
      'A practical guide to sitting down with a friend and studying the plan of salvation directly from the text. Includes a leader outline and a printable slide set.',
    category: 'Evangelism',
    files: [
      {
        label: 'Leader notes',
        filename: 'open-bible-study-notes.pdf',
        lines: [
          'Personal Evangelism: The Open-Bible Study',
          '',
          '1. Establishing the authority of the Scriptures',
          '2. The problem of sin (Romans 3:23; 6:23)',
          '3. God\'s love and the cross (Romans 5:8)',
          '4. Hearing, believing, repenting, confessing',
          '5. Baptism into Christ (Acts 2:38; Romans 6:3-4)',
          '6. Faithful Christian living (Revelation 2:10)',
          '',
          'Tips: let them read the text aloud; ask, do not argue.',
        ],
      },
      {
        label: 'Slides (PDF)',
        filename: 'open-bible-study-slides.pdf',
        lines: [
          'The Open-Bible Study - Slides',
          '',
          'Slide 1: What must I do to be saved?',
          'Slide 2: All have sinned',
          'Slide 3: The wages of sin is death',
          'Slide 4: But God commendeth His love',
          'Slide 5: Hear - Believe - Repent - Confess - Be baptized',
          'Slide 6: Added by the Lord to His church (Acts 2:47)',
        ],
      },
    ],
  },
  {
    slug: 'song-leading-basics-a-cappella',
    title: 'Song Leading Basics for A Cappella Worship',
    description:
      'For new and developing song leaders: pitching a song, keeping time, selecting hymns that teach, and leading the congregation rather than performing for it.',
    category: 'Worship',
    files: [
      {
        label: 'Handbook',
        filename: 'song-leading-basics.pdf',
        lines: [
          'Song Leading Basics for A Cappella Worship',
          '',
          '1. Why we sing (Ephesians 5:19; Colossians 3:16)',
          '2. Starting the pitch with a pitch pipe or app',
          '3. Beat patterns: 3/4, 4/4, 6/8',
          '4. Choosing songs that fit the sermon and the assembly',
          '5. Leading invitation songs',
          '6. Preparing a full order of songs for Sunday',
        ],
      },
      {
        label: 'Practice slides (PDF)',
        filename: 'song-leading-practice-slides.pdf',
        lines: [
          'Song Leading - Practice Set',
          '',
          'Exercise 1: pitch three familiar hymns from memory',
          'Exercise 2: conduct 4/4 while singing',
          'Exercise 3: transition from sermon theme to invitation',
        ],
      },
    ],
  },
  {
    slug: 'adult-auditorium-curriculum-fall-quarter',
    title: 'Adult Auditorium Bible Class Curriculum — Fall Quarter',
    description:
      'The thirteen-week teaching schedule for the adult auditorium class this quarter, with weekly texts, aims, and the assigned teacher for each Sunday and Wednesday.',
    category: 'Bible Class',
    files: [
      {
        label: 'Quarter schedule',
        filename: 'adult-auditorium-fall-quarter.pdf',
        lines: [
          'Adult Auditorium Bible Class - Fall Quarter',
          'Theme: The Gospel of John',
          '',
          'Week 1  John 1        The Word became flesh',
          'Week 2  John 3        Ye must be born again',
          'Week 3  John 4        Worship in spirit and truth',
          'Week 4  John 6        The bread of life',
          'Week 5  John 8        The truth shall make you free',
          'Week 6  John 10       The good shepherd',
          'Week 7  John 11       The resurrection and the life',
          '... continues through Week 13',
        ],
      },
    ],
  },
  {
    slug: 'scheme-of-redemption-chart-study',
    title: 'The Scheme of Redemption — Chart Study',
    description:
      'A one-page overview tracing God’s plan to save man from Genesis to the establishment of the church in Acts 2, with supporting references for each stage.',
    category: 'Bible Class',
    files: [
      {
        label: 'Chart and notes',
        filename: 'scheme-of-redemption-chart.pdf',
        lines: [
          'The Scheme of Redemption',
          '',
          'Eternal purpose (Ephesians 3:10-11)',
          'The fall and the first promise (Genesis 3:15)',
          'The family: Abraham and the seed promise (Genesis 12, 22)',
          'The nation: the Law as a schoolmaster (Galatians 3:24)',
          'The prophets: a coming kingdom (Daniel 2:44)',
          'The fullness of time: Christ (Galatians 4:4)',
          'The church established (Acts 2)',
        ],
      },
    ],
  },
  {
    slug: 'marriage-and-the-christian-home-workbook',
    title: 'Marriage and the Christian Home — Workbook',
    description:
      'An eight-session workbook for couples and for a young-families class: God’s design for marriage, roles in the home, communication, finances, and raising children in the Lord.',
    category: 'Family',
    files: [
      {
        label: 'Workbook',
        filename: 'marriage-and-the-home-workbook.pdf',
        lines: [
          'Marriage and the Christian Home - Workbook',
          '',
          'Session 1 - God\'s design: one man, one woman, for life',
          'Session 2 - Love and respect (Ephesians 5:22-33)',
          'Session 3 - Communication and conflict',
          'Session 4 - Money and contentment',
          'Session 5 - Bringing up children in the Lord',
          'Session 6 - The home and the local church',
          'Session 7 - Hospitality',
          'Session 8 - Finishing well',
        ],
      },
    ],
  },
  {
    slug: 'examining-denominational-doctrines-handouts',
    title: 'Examining Denominational Doctrines — Handout Set',
    description:
      'A respectful, text-based set of handouts comparing common teachings — faith only, the impossibility of apostasy, premillennialism, infant baptism — with what the New Testament actually says.',
    category: 'Evangelism',
    files: [
      {
        label: 'Handout set',
        filename: 'denominational-doctrines-handouts.pdf',
        lines: [
          'Examining Denominational Doctrines',
          '',
          'Handout 1 - "Faith only" and James 2:24',
          'Handout 2 - "Once saved, always saved" and Galatians 5:4',
          'Handout 3 - The kingdom: future or present? (Colossians 1:13)',
          'Handout 4 - Household baptisms and believers\' baptism',
          'Handout 5 - The name we wear (Acts 11:26; 1 Peter 4:16)',
          '',
          'Format: claim, key passages, questions for study.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-study-the-bible-primer',
    title: 'How to Study the Bible — A Primer on Interpretation',
    description:
      'An introduction to reading the Bible carefully: context, audience, command-example-inference, the difference between the Old and New covenants, and common mistakes to avoid.',
    category: 'Bible Class',
    files: [
      {
        label: 'Primer',
        filename: 'how-to-study-the-bible.pdf',
        lines: [
          'How to Study the Bible - A Primer',
          '',
          '1. Read it in context (who, to whom, why)',
          '2. Rightly divide the covenants (2 Timothy 2:15)',
          '3. How we learn: command, example, necessary inference',
          '4. The silence of the Scriptures',
          '5. Figurative vs. literal language',
          '6. Common errors: proof-texting, private interpretation',
        ],
      },
    ],
  },
  {
    slug: 'lads-to-leaders-preparation-guide',
    title: 'Lads to Leaders / Leaderettes — Preparation Guide',
    description:
      'Event descriptions, deadlines, and coaching notes for young people preparing in song leading, speech, Bible reading, Bible bowl, and good Samaritan service this year.',
    category: 'Youth',
    files: [
      {
        label: 'Preparation guide',
        filename: 'lads-to-leaders-guide.pdf',
        lines: [
          'Lads to Leaders / Leaderettes - Preparation Guide',
          '',
          'Song Leading - selection and practice schedule',
          'Speech - topic approval and timing',
          'Oral Bible Reading - passage list',
          'Bible Bowl - this year\'s book and study plan',
          'Good Samaritan - service project ideas',
          '',
          'Registration deadline and coach contacts inside.',
        ],
      },
    ],
  },
  {
    slug: 'benevolence-and-the-deacons-work-guidelines',
    title: 'Benevolence and the Deacons’ Work — Guidelines',
    description:
      'How the congregation handles requests for assistance: scriptural basis, the role of the deacons, what the benevolence fund covers, and the request and follow-up process.',
    category: 'Leadership',
    files: [
      {
        label: 'Guidelines',
        filename: 'benevolence-guidelines.pdf',
        lines: [
          'Benevolence and the Deacons\' Work',
          '',
          'Scriptural basis: Acts 6:1-6; Galatians 6:10; James 1:27',
          'Priority to the household of faith',
          'What the fund covers: food, utilities, short-term need',
          'Request process and deacon review',
          'Confidentiality and follow-up',
          'Referrals to other resources',
        ],
      },
    ],
  },
  {
    slug: 'gospel-meeting-2026-sermon-outlines',
    title: 'Gospel Meeting 2026 — Sermon Outlines',
    description:
      'Printable outlines for all four nights of the fall gospel meeting with Robert Nguyen, so members can follow along, take notes, and share them with visitors.',
    category: 'Evangelism',
    files: [
      {
        label: 'Outlines (all nights)',
        filename: 'gospel-meeting-2026-outlines.pdf',
        lines: [
          'Gospel Meeting 2026 - Sermon Outlines',
          'Speaker: Robert Nguyen',
          '',
          'Night 1 (Mon) - Why the Cross?',
          'Night 2 (Tue) - The Church Jesus Built',
          'Night 3 (Wed) - Let Us Draw Near (Hebrews 10)',
          'Night 4 (Thu) - Almost Persuaded (Acts 26)',
          '',
          'Each outline: main points, texts, application.',
        ],
      },
    ],
  },
  {
    slug: 'vbs-2026-teacher-lesson-plans',
    title: 'Vacation Bible School 2026 — Teacher Lesson Plans',
    description:
      'Complete lesson plans for all age groups for this year’s VBS, "Heroes of Faith" (Hebrews 11), including crafts, memory verses, snacks, and a room-by-room schedule.',
    category: 'Youth',
    files: [
      {
        label: 'Lesson plans',
        filename: 'vbs-2026-lesson-plans.pdf',
        lines: [
          'VBS 2026 - Heroes of Faith (Hebrews 11)',
          '',
          'Night 1 - By faith Abel / Enoch / Noah',
          'Night 2 - By faith Abraham and Sarah',
          'Night 3 - By faith Moses',
          'Night 4 - By faith the walls of Jericho',
          '',
          'Each night: lesson, memory verse, craft, snack.',
        ],
      },
      {
        label: 'Room schedule and supply list',
        filename: 'vbs-2026-schedule-supplies.pdf',
        lines: [
          'VBS 2026 - Schedule and Supplies',
          '',
          '6:00 Opening assembly and singing',
          '6:20 Rotation 1 (lesson)',
          '6:50 Rotation 2 (craft)',
          '7:15 Rotation 3 (snack and recreation)',
          '7:40 Closing assembly',
          '',
          'Supply list by classroom attached.',
        ],
      },
    ],
  },
  {
    slug: 'wednesday-auditorium-class-acts-notes',
    title: 'Wednesday Auditorium Class — Notes on the Book of Acts',
    description:
      'Running notes from the Wednesday evening auditorium study through Acts: the establishment and spread of the church, conversion accounts, and the first missionary journeys.',
    category: 'Bible Class',
    files: [
      {
        label: 'Class notes',
        filename: 'wednesday-acts-notes.pdf',
        lines: [
          'Wednesday Auditorium Class - The Book of Acts',
          '',
          'Acts 1-2   The promise and the beginning of the church',
          'Acts 3-5   Bold preaching and opposition',
          'Acts 6-7   The seven; Stephen',
          'Acts 8     Samaria; the Ethiopian nobleman',
          'Acts 9     The conversion of Saul',
          'Acts 10-11 The household of Cornelius',
          'Acts 13-14 The first journey from Antioch',
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Content — announcements
// ---------------------------------------------------------------------------

type AnnouncementSeed = {slug: string; title: string; body: string; expiresAt?: string}

const ANNOUNCEMENTS: AnnouncementSeed[] = [
  {
    slug: 'gospel-meeting-september',
    title: 'Gospel Meeting with Robert Nguyen — September 21–24',
    body: 'Our fall gospel meeting runs Monday through Thursday, September 21–24, at 7:00 p.m. each evening, with brother Robert Nguyen preaching on the theme "The Faith Once Delivered." Invite your family, neighbors, and coworkers. Printed outlines and invitation cards are available in the foyer.',
    expiresAt: '2026-09-25T06:00:00+01:00',
  },
  {
    slug: 'fall-bible-class-quarter',
    title: 'Fall Bible Class Quarter Begins September 7',
    body: 'New quarterly classes for all ages begin Sunday, September 7. The adult auditorium class will study the Gospel of John. Class rolls and teacher assignments are posted on the board across from the library.',
    expiresAt: '2026-09-14T06:00:00+01:00',
  },
  {
    slug: 'ladies-bible-class-resumes',
    title: 'Ladies’ Bible Class Resumes Tuesday Mornings',
    body: 'The ladies’ Bible class resumes Tuesday, September 8, at 10:00 a.m. in the fellowship room, continuing its study of the book of Ruth. Childcare is provided. All ladies are welcome.',
    expiresAt: '2026-09-15T06:00:00+01:00',
  },
  {
    slug: 'fifth-sunday-singing-and-meal',
    title: 'Fifth Sunday Singing and Fellowship Meal',
    body: 'This month has a fifth Sunday. Following morning worship there will be a fellowship meal in the annex, and the evening service will be a full song service. Bring a main dish and a side; drinks and setup are provided.',
  },
  {
    slug: 'area-wide-youth-devotional',
    title: 'Area-Wide Youth Devotional This Friday',
    body: 'The monthly area-wide youth devotional meets this Friday at 7:00 p.m., hosted this month by the Evueta congregation. Singing, a short lesson, and food afterward. Drivers, please meet in the parking lot at 6:30.',
  },
  {
    slug: 'building-fund-update',
    title: 'Building Fund — Contribution Update',
    body: 'Thank you for your continued generosity toward the auditorium expansion. As of this month the building fund stands at 68 percent of the goal. A detailed statement is available from the deacons on request.',
  },
  {
    slug: 'directory-photos',
    title: 'Pictorial Directory Photos Being Updated',
    body: 'We are refreshing the pictorial directory. Photos will be taken in the library after both morning and evening services through the end of the month. If you would rather submit your own photo, please email it to the office.',
    expiresAt: '2026-10-01T06:00:00+01:00',
  },
  {
    slug: 'wednesday-acts-series',
    title: 'New Wednesday Evening Series: The Book of Acts',
    body: 'Beginning Wednesday, September 10, the auditorium class will start a verse-by-verse study through the book of Acts, tracing the establishment and growth of the Lord’s church. Notes will be posted to the library each week.',
  },
  {
    slug: 'benevolence-pantry-collection',
    title: 'Benevolence Pantry Collection This Month',
    body: 'The deacons are restocking the benevolence pantry. Non-perishable food, diapers, and basic toiletries may be left in the marked bins by the north entrance throughout the month.',
  },
  {
    slug: 'mens-business-meeting',
    title: 'Men’s Business Meeting — First Monday',
    body: 'All men of the congregation are encouraged to attend the monthly business meeting on the first Monday at 7:00 p.m. in the fellowship room. The elders will review the work, the budget, and upcoming events.',
  },
  {
    slug: 'nursing-home-singing-volunteers',
    title: 'Nursing Home Singing — Volunteers Needed',
    body: 'Our group visits Maple Grove Care Center on the second Sunday afternoon each month to sing with the residents and read Scripture. We need a few more singers and one additional driver. See James Whitfield to help.',
  },
  {
    slug: 'vbs-registration-open',
    title: 'Vacation Bible School Registration Now Open',
    body: 'VBS this year is "Heroes of Faith," a study of Hebrews 11, for ages 3 through high school. Register your children and grandchildren at the table in the foyer or through the office. Teachers and helpers are still needed.',
  },
  {
    slug: 'prayer-list-and-sympathy',
    title: 'Prayer List and Sympathy Update',
    body: 'Please remember in prayer those recovering from surgery and our members who are unable to assemble with us. The congregation extends its sympathy to the Coleman family in the passing of their aunt. Cards may be left in the office.',
  },
]

// ---------------------------------------------------------------------------
// Content — events
// ---------------------------------------------------------------------------

type EventSeed = {
  slug: string
  title: string
  description: string
  startsAt: string
  endsAt?: string
  location: string
  ministry?: string
}

const EVENTS: EventSeed[] = [
  {
    slug: 'summer-vbs-2026',
    title: 'Summer VBS 2026: Heroes of Faith',
    description:
      'Four evenings of Bible lessons, singing, crafts, and snacks for children ages 3 through high school, studying the great examples of faith in Hebrews 11.',
    startsAt: '2026-07-14T18:00:00+01:00',
    endsAt: '2026-07-16T20:00:00+01:00',
    location: 'Church of Christ, Evueta — education wing',
    ministry: 'Youth',
  },
  {
    slug: 'area-wide-youth-devotional-september',
    title: 'Area-Wide Youth Devotional',
    description:
      'Monthly gathering of teens from congregations across the area for singing, a short lesson, and fellowship. Hosted this month by the Evueta congregation, with a meal to follow.',
    startsAt: '2026-09-04T19:00:00+01:00',
    endsAt: '2026-09-04T21:00:00+01:00',
    location: 'Fellowship annex',
    ministry: 'Youth',
  },
  {
    slug: 'congregational-singing-night',
    title: 'Congregational Singing Night',
    description:
      'An evening given entirely to a cappella singing and short devotional thoughts between songs. Requests welcome. Light refreshments afterward in the annex.',
    startsAt: '2026-09-13T18:00:00+01:00',
    endsAt: '2026-09-13T19:30:00+01:00',
    location: 'Main auditorium',
    ministry: 'Worship',
  },
  {
    slug: 'senior-saints-luncheon',
    title: 'Senior Saints Fellowship Luncheon',
    description:
      'A catered luncheon for members 60 and over and their guests, with singing and a devotional. Please sign the list in the foyer so we can plan the count.',
    startsAt: '2026-09-18T12:00:00+01:00',
    endsAt: '2026-09-18T14:00:00+01:00',
    location: 'Fellowship annex',
  },
  {
    slug: 'gospel-meeting-night-1',
    title: 'Gospel Meeting — Night 1: Why the Cross?',
    description:
      'Opening night of the fall gospel meeting with Robert Nguyen. Singing at 6:45, preaching at 7:00. Invitation cards and outlines available in the foyer.',
    startsAt: '2026-09-21T19:00:00+01:00',
    endsAt: '2026-09-21T20:15:00+01:00',
    location: 'Main auditorium',
    ministry: 'Evangelism',
  },
  {
    slug: 'gospel-meeting-night-2',
    title: 'Gospel Meeting — Night 2: The Church Jesus Built',
    description:
      'Second night of the fall gospel meeting with Robert Nguyen. Singing at 6:45, preaching at 7:00. Bring a visitor.',
    startsAt: '2026-09-22T19:00:00+01:00',
    endsAt: '2026-09-22T20:15:00+01:00',
    location: 'Main auditorium',
    ministry: 'Evangelism',
  },
  {
    slug: 'gospel-meeting-night-3',
    title: 'Gospel Meeting — Night 3: Let Us Draw Near',
    description:
      'Third night of the fall gospel meeting with Robert Nguyen, a study of Hebrews 10. Singing at 6:45, preaching at 7:00.',
    startsAt: '2026-09-23T19:00:00+01:00',
    endsAt: '2026-09-23T20:15:00+01:00',
    location: 'Main auditorium',
    ministry: 'Evangelism',
  },
  {
    slug: 'gospel-meeting-night-4',
    title: 'Gospel Meeting — Night 4: Almost Persuaded',
    description:
      'Closing night of the fall gospel meeting with Robert Nguyen, from Acts 26. A dessert fellowship follows in the annex.',
    startsAt: '2026-09-24T19:00:00+01:00',
    endsAt: '2026-09-24T20:30:00+01:00',
    location: 'Main auditorium',
    ministry: 'Evangelism',
  },
  {
    slug: 'newcomers-dinner',
    title: 'Newcomers’ Dinner',
    description:
      'A relaxed dinner hosted by the elders for anyone who has begun worshiping with us in the last year. Come meet the elders, deacons, and ministry leaders. Childcare provided.',
    startsAt: '2026-09-27T17:30:00+01:00',
    endsAt: '2026-09-27T19:30:00+01:00',
    location: 'Fellowship annex',
  },
  {
    slug: 'mens-leadership-training-workshop',
    title: 'Men’s Leadership Training Workshop',
    description:
      'A Saturday workshop for men who serve or wish to serve in leading singing, teaching, waiting on the Lord’s table, and public reading, with practical sessions and feedback.',
    startsAt: '2026-10-03T09:00:00+01:00',
    endsAt: '2026-10-03T13:00:00+01:00',
    location: 'Fellowship room',
    ministry: 'Leadership',
  },
  {
    slug: 'friends-and-family-day',
    title: 'Friends and Family Day',
    description:
      'A special Sunday to invite those you have been praying for. One combined worship service at 10:30, followed by a full fellowship meal. Invitation cards available now.',
    startsAt: '2026-10-25T10:30:00+01:00',
    endsAt: '2026-10-25T13:00:00+01:00',
    location: 'Main auditorium and annex',
    ministry: 'Evangelism',
  },
  {
    slug: 'ladies-day-rooted-in-christ',
    title: 'Ladies’ Day: "Rooted in Christ"',
    description:
      'A morning of singing, two lessons, and a brunch for ladies of all ages, with a guest speaker from the Southside congregation. Registration requested by November 1.',
    startsAt: '2026-11-07T09:00:00+01:00',
    endsAt: '2026-11-07T12:30:00+01:00',
    location: 'Fellowship annex',
    ministry: 'Family',
  },
  {
    slug: 'thanksgiving-eve-devotional',
    title: 'Thanksgiving Eve Devotional and Pie Fellowship',
    description:
      'A short evening of songs of thanksgiving, Scripture reading, and prayer, followed by a pie-and-coffee fellowship. Bring a pie to share if you are able.',
    startsAt: '2026-11-25T18:30:00+01:00',
    endsAt: '2026-11-25T20:00:00+01:00',
    location: 'Fellowship annex',
  },
  {
    slug: 'winter-youth-retreat',
    title: 'Winter Youth Retreat',
    description:
      'A weekend retreat for grades 6–12 at Pine Ridge Christian Camp: daily Bible classes on "Standing Firm" (Ephesians 6), singing, and outdoor recreation. Cost and permission forms in the youth folder.',
    startsAt: '2027-01-16T17:00:00+01:00',
    endsAt: '2027-01-18T12:00:00+01:00',
    location: 'Pine Ridge Christian Camp',
    ministry: 'Youth',
  },
]

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function uploadPdf(file: FileSeed): Promise<string> {
  const asset = await client.assets.upload('file', makePdf(file.label, file.lines), {
    filename: file.filename,
    contentType: 'application/pdf',
  })
  return asset._id
}

async function main() {
  const created: Record<string, number> = {
    sermonPost: 0,
    libraryItem: 0,
    announcement: 0,
    event: 0,
  }

  // Sermons
  for (const s of SERMONS) {
    await client.createOrReplace({
      _id: `seed-sermon-${s.slug}`,
      _type: 'sermonPost',
      title: s.title,
      slug: {_type: 'slug', current: s.slug},
      date: s.date,
      speaker: s.speaker,
      ...(s.series ? {series: s.series} : {}),
      ...(s.ministry ? {ministry: s.ministry} : {}),
      ...(s.mediaUrl ? {mediaUrl: s.mediaUrl} : {}),
      body: toPortableText(s.body),
      status: 'published',
    })
    created.sermonPost++
    console.log(`  sermon      ${s.slug}`)
  }

  // Library items (upload files first, then reference them)
  for (const l of LIBRARY) {
    const files = []
    for (const f of l.files) {
      const assetId = await uploadPdf(f)
      files.push({
        _key: key(),
        _type: 'file',
        title: f.label,
        asset: {_type: 'reference', _ref: assetId},
      })
    }
    await client.createOrReplace({
      _id: `seed-library-${l.slug}`,
      _type: 'libraryItem',
      title: l.title,
      description: l.description,
      category: l.category,
      files,
      status: 'published',
    })
    created.libraryItem++
    console.log(`  library     ${l.slug} (${files.length} file${files.length === 1 ? '' : 's'})`)
  }

  // Announcements
  for (const a of ANNOUNCEMENTS) {
    await client.createOrReplace({
      _id: `seed-announcement-${a.slug}`,
      _type: 'announcement',
      title: a.title,
      body: a.body,
      ...(a.expiresAt ? {expiresAt: a.expiresAt} : {}),
      status: 'published',
    })
    created.announcement++
    console.log(`  announce    ${a.slug}`)
  }

  // Events
  for (const e of EVENTS) {
    await client.createOrReplace({
      _id: `seed-event-${e.slug}`,
      _type: 'event',
      title: e.title,
      description: e.description,
      startsAt: e.startsAt,
      ...(e.endsAt ? {endsAt: e.endsAt} : {}),
      location: e.location,
      ...(e.ministry ? {ministry: e.ministry} : {}),
      status: 'published',
    })
    created.event++
    console.log(`  event       ${e.slug}`)
  }

  console.log('\nWritten (createOrReplace):')
  console.log(
    `  sermonPost: ${created.sermonPost}, libraryItem: ${created.libraryItem}, ` +
      `announcement: ${created.announcement}, event: ${created.event}`,
  )

  // Post-write verification straight from the dataset
  const counts = await client.fetch(
    `{
      "sermonPost": count(*[_type == "sermonPost" && status == "published"]),
      "libraryItem": count(*[_type == "libraryItem" && status == "published"]),
      "announcement": count(*[_type == "announcement" && status == "published"]),
      "event": count(*[_type == "event" && status == "published"]),
      "seedTotal": count(*[string::startsWith(_id, "seed-")]),
      "libraryFilesResolved": count(*[_type == "libraryItem" && string::startsWith(_id, "seed-") && count(files[@.asset->extension == "pdf"]) >= 1])
    }`,
  )
  console.log('\nDataset now reports:')
  console.log(JSON.stringify(counts, null, 2))
}

main().then(
  () => {
    console.log('\nDone.')
    process.exit(0)
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
