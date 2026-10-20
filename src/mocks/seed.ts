import { chicagoDateTime } from "@/lib/utils/dates";
import type {
  AuditEvent,
  Document,
  Estimate,
  GeneralContractor,
  InboxItem,
  Notification,
  Project,
  Proposal,
  Quote,
  Rfi,
  ScopeItem,
  Submission,
  Subcontractor,
  TakeoffItem,
  Task,
  User,
  Workspace,
} from "@/types/domain";

export type Database = {
  workspace: Workspace;
  users: User[];
  generalContractors: GeneralContractor[];
  subcontractors: Subcontractor[];
  projects: Project[];
  documents: Document[];
  scopeItems: ScopeItem[];
  takeoffItems: TakeoffItem[];
  rfis: Rfi[];
  quotes: Quote[];
  estimates: Estimate[];
  proposals: Proposal[];
  submissions: Submission[];
  tasks: Task[];
  notifications: Notification[];
  inbox: InboxItem[];
  audit: AuditEvent[];
};

const emptySlot = { status: "pending" as const, by: null, at: null };
const approved = (by: string, at: string) => ({ status: "approved" as const, by, at });

function source(
  documentId: string,
  filename: string,
  page: number | null,
  sheet: string | null,
  revision: string | null,
) {
  return { documentId, filename, page, sheet, revision };
}

export function createSeed(now: Date): Database {
  const at = (day: number, hour = 15, minute = 0) =>
    chicagoDateTime(now, day, hour, minute);

  const workspace: Workspace = {
    id: "ws_summit",
    name: "Summit Coatings",
    legalName: "Summit Coatings Co.",
    city: "Nashville",
    state: "TN",
    homeBase: "412 4th Avenue South, Nashville, TN",
    travelRadiusMiles: 60,
    trades: ["painting", "drywall"],
    phone: "(615) 555-0148",
    email: "estimating@summitcoatings.example",
    proposalTemplate: {
      inclusions:
        "Interior painting of gypsum board, exposed structure called out in the finish schedule, and hollow-metal frames listed in the takeoff.",
      exclusions:
        "Flooring, casework finishing, exterior elastomeric coatings, and abatement of existing hazardous materials.",
      clarifications:
        "Colors are based on the finish schedule in the current drawing set. Field verification follows an approved takeoff.",
    },
    goNoGoCriteria: [
      { id: "radius", label: "Inside travel radius", weight: 20, enabled: true },
      {
        id: "documents",
        label: "Drawings and specs are complete enough to price",
        weight: 25,
        enabled: true,
      },
      {
        id: "capacity",
        label: "Crew capacity in the bid window",
        weight: 20,
        enabled: true,
      },
      {
        id: "relationship",
        label: "GC payment and relationship history",
        weight: 15,
        enabled: true,
      },
      {
        id: "margin",
        label: "Likely margin after scope leveling",
        weight: 20,
        enabled: true,
      },
    ],
    notifications: {
      invitations: true,
      addenda: true,
      quotes: true,
      rfis: true,
      deadlines: true,
    },
  };

  const users: User[] = [
    {
      id: "usr_avery",
      name: "Avery Lang",
      email: "avery.lang@summitcoatings.example",
      role: "precon_lead",
      title: "Precon / Design Lead",
    },
    {
      id: "usr_marcus",
      name: "Marcus Hale",
      email: "marcus.hale@summitcoatings.example",
      role: "construction_lead",
      title: "Construction Lead",
    },
    {
      id: "usr_ai",
      name: "Northline Assistant",
      email: "assistant@northline.example",
      role: "ai_assistant",
      title: "AI Assistant",
    },
  ];

  const generalContractors: GeneralContractor[] = [
    {
      id: "gc_ridgeline",
      name: "Ridgeline Builders",
      category: "Commercial GC",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0172",
      email: "precon@ridgeline.example",
      website: "https://ridgeline.example",
      primaryContact: "Elena Voss",
      notes: "Fast addenda. Pays on agreed schedule.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(240, 12),
      projectsBid: 4,
      winRate: 0.5,
      paymentHistory: "current",
    },
    {
      id: "gc_cumberland",
      name: "Cumberland General",
      category: "Healthcare GC",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0194",
      email: "bids@cumberlandgc.example",
      website: "https://cumberlandgc.example",
      primaryContact: "Noah Pitt",
      notes: "Healthcare work with strict infection-control specs.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(90, 12),
      projectsBid: 2,
      winRate: 0,
      paymentHistory: "current",
    },
    {
      id: "gc_harpeth",
      name: "Harpeth Construction",
      category: "Civic and mixed-use",
      city: "Franklin",
      state: "TN",
      phone: "(615) 555-0118",
      email: "estimating@harpeth.example",
      website: "https://harpeth.example",
      primaryContact: "Priya Shah",
      notes: "Large civic packages. Watch travel time to Franklin.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(40, 12),
      projectsBid: 2,
      winRate: null,
      paymentHistory: "slow",
    },
    {
      id: "gc_belle",
      name: "Belle Meade Contractors",
      category: "Hospitality",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0160",
      email: "bids@bellemeade.example",
      website: "https://bellemeade.example",
      primaryContact: "Chris Dalton",
      notes: "Hospitality renovations with occupied-site constraints.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(180, 12),
      projectsBid: 2,
      winRate: null,
      paymentHistory: "current",
    },
    {
      id: "gc_atlas",
      name: "Atlas Commercial",
      category: "Multifamily",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0133",
      email: "invites@atlascommercial.example",
      website: "https://atlascommercial.example",
      primaryContact: "Jordan Ellis",
      notes: "New relationship. Invitation package was incomplete.",
      insuranceOnFile: false,
      insuranceExpiresOn: null,
      projectsBid: 2,
      winRate: null,
      paymentHistory: "unknown",
    },
    {
      id: "gc_stonebridge",
      name: "Stonebridge GC",
      category: "Industrial",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0186",
      email: "precon@stonebridge.example",
      website: "https://stonebridge.example",
      primaryContact: "Sam Ortiz",
      notes: "Awarded the Berry Hill warehouse conversion.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(300, 12),
      projectsBid: 1,
      winRate: 1,
      paymentHistory: "current",
    },
  ];

  const subcontractors: Subcontractor[] = [
    {
      id: "sub_riverbend",
      name: "Riverbend Coatings",
      trade: "painting",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0104",
      email: "quotes@riverbend.example",
      primaryContact: "Leah Kim",
      notes: "Strong on occupied medical and hotel work.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(120, 12),
      quoteCount: 3,
      winRate: 0.33,
      paymentHistory: "current",
    },
    {
      id: "sub_midstate",
      name: "Midstate Painters",
      trade: "painting",
      city: "Murfreesboro",
      state: "TN",
      phone: "(615) 555-0127",
      email: "bids@midstate.example",
      primaryContact: "Owen Brooks",
      notes: "Often low, frequently excludes high work and night shifts.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(20, 12),
      quoteCount: 3,
      winRate: 0,
      paymentHistory: "slow",
    },
    {
      id: "sub_volunteer",
      name: "Volunteer Finishes",
      trade: "painting",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0155",
      email: "estimating@volunteer.example",
      primaryContact: "Maya Chen",
      notes: "Includes frames and exposed structure when the spec calls for it.",
      insuranceOnFile: true,
      insuranceExpiresOn: at(200, 12),
      quoteCount: 2,
      winRate: 0.5,
      paymentHistory: "current",
    },
    {
      id: "sub_eastbank",
      name: "East Bank Specialty",
      trade: "drywall",
      city: "Nashville",
      state: "TN",
      phone: "(615) 555-0199",
      email: "quotes@eastbankspecialty.example",
      primaryContact: "Drew Patel",
      notes: "Drywall and level-5 finish partner.",
      insuranceOnFile: false,
      insuranceExpiresOn: null,
      quoteCount: 1,
      winRate: null,
      paymentHistory: "unknown",
    },
  ];

  const projects: Project[] = [
    project(now, {
      id: "prj_gulch",
      name: "The Gulch Office Tower",
      number: "SC-24081",
      location: "1200 Division Street",
      city: "Nashville",
      trade: "painting",
      status: "pricing",
      gcId: "gc_ridgeline",
      ownerId: "usr_avery",
      estimatedValue: 486000,
      due: 2,
      site: 1,
      rfi: 0,
      aiRecommendation: "go",
      aiScore: 82,
      aiRationale:
        "Inside the travel radius, drawings are mostly complete, and Ridgeline pays currently. High work and an open addendum still need a human review.",
      humanDecision: null,
      humanDecisionNote: null,
      nextAction: "Level subcontractor quotes and set the bid price",
      next: 1,
      documentCompleteness: 86,
      samplePreconHours: 18,
      contact: ["Elena Voss", "elena.voss@ridgeline.example", "(615) 555-0172"],
    }),
    project(now, {
      id: "prj_greenhills",
      name: "Green Hills Clinic Fit-Out",
      number: "SC-24074",
      location: "3810 Hillsboro Pike",
      city: "Nashville",
      trade: "painting",
      status: "pricing",
      gcId: "gc_belle",
      ownerId: "usr_marcus",
      estimatedValue: 214500,
      due: 0,
      dueHour: 16,
      site: null,
      rfi: 1,
      aiRecommendation: "review",
      aiScore: 61,
      aiRationale:
        "The clinic is close, but the finish schedule conflicts with Addendum 1 and the takeoff is still unapproved.",
      humanDecision: "go",
      humanDecisionNote:
        "Pursue if the takeoff is approved before the 4:00 p.m. deadline.",
      nextAction: "Approve the takeoff before the bid deadline",
      next: 0,
      documentCompleteness: 74,
      samplePreconHours: 11,
      contact: ["Chris Dalton", "chris.dalton@bellemeade.example", "(615) 555-0160"],
    }),
    project(now, {
      id: "prj_music",
      name: "Music Row Medical Pavilion",
      number: "SC-24066",
      location: "1800 Division Street",
      city: "Nashville",
      trade: "painting",
      status: "reviewing",
      gcId: "gc_cumberland",
      ownerId: "usr_avery",
      estimatedValue: 640000,
      due: 5,
      site: 3,
      rfi: 2,
      aiRecommendation: "go",
      aiScore: 76,
      aiRationale:
        "Healthcare scope fits the crew, documents are usable, and the deadline is inside the week.",
      humanDecision: "go",
      humanDecisionNote:
        "Proceed to scope review. Do not price until infection-control notes are confirmed.",
      nextAction: "Finish scope review against the paint spec",
      next: 2,
      documentCompleteness: 68,
      samplePreconHours: 14,
      contact: ["Noah Pitt", "noah.pitt@cumberlandgc.example", "(615) 555-0194"],
    }),
    project(now, {
      id: "prj_eastbank",
      name: "East Bank Mixed-Use",
      number: "SC-24090",
      location: "400 Russell Street",
      city: "Nashville",
      trade: "painting",
      status: "screening",
      gcId: "gc_harpeth",
      ownerId: "usr_avery",
      estimatedValue: 910000,
      due: 8,
      site: 4,
      rfi: -2,
      aiRecommendation: "review",
      aiScore: 58,
      aiRationale:
        "Value is attractive, but an RFI is overdue and the drawing set is missing the level 4 finish plan.",
      humanDecision: null,
      humanDecisionNote: null,
      nextAction: "Resolve the overdue RFI before a go decision",
      next: -2,
      documentCompleteness: 42,
      samplePreconHours: 6,
      contact: ["Priya Shah", "priya.shah@harpeth.example", "(615) 555-0118"],
    }),
    project(now, {
      id: "prj_germantown",
      name: "Germantown Hotel Renovation",
      number: "SC-24058",
      location: "1200 2nd Avenue North",
      city: "Nashville",
      trade: "painting",
      status: "go",
      gcId: "gc_belle",
      ownerId: "usr_marcus",
      estimatedValue: 355000,
      due: 9,
      site: 1,
      siteHour: 9,
      rfi: 6,
      aiRecommendation: "go",
      aiScore: 80,
      aiRationale:
        "Occupied hotel work is familiar, the GC pays currently, and the site visit is tomorrow.",
      humanDecision: "go",
      humanDecisionNote:
        "Go, contingent on night-shift access confirmed at the site visit.",
      nextAction: "Attend the site visit and confirm occupied-floor access",
      next: 1,
      documentCompleteness: 71,
      samplePreconHours: 9,
      contact: ["Chris Dalton", "chris.dalton@bellemeade.example", "(615) 555-0160"],
    }),
    project(now, {
      id: "prj_12south",
      name: "12South Retail Shell",
      number: "SC-24041",
      location: "2300 12th Avenue South",
      city: "Nashville",
      trade: "painting",
      status: "submitted",
      gcId: "gc_ridgeline",
      ownerId: "usr_marcus",
      estimatedValue: 128400,
      due: -3,
      site: null,
      rfi: null,
      aiRecommendation: "go",
      aiScore: 73,
      aiRationale: "Small shell scope with a complete bid form. Submitted on time.",
      humanDecision: "go",
      humanDecisionNote: "Submitted.",
      nextAction: "Wait for the award and log the outcome",
      next: 4,
      documentCompleteness: 100,
      samplePreconHours: 16,
      contact: ["Elena Voss", "elena.voss@ridgeline.example", "(615) 555-0172"],
    }),
    project(now, {
      id: "prj_berry",
      name: "Berry Hill Warehouse Conversion",
      number: "SC-24022",
      location: "700 Craighead Street",
      city: "Nashville",
      trade: "painting",
      status: "won",
      gcId: "gc_stonebridge",
      ownerId: "usr_marcus",
      estimatedValue: 276000,
      due: -20,
      site: null,
      rfi: null,
      aiRecommendation: "go",
      aiScore: 84,
      aiRationale: "Exposed structure was quantified and the GC awarded the package.",
      humanDecision: "go",
      humanDecisionNote: "Awarded.",
      nextAction: "Hand the awarded scope to construction",
      next: 2,
      documentCompleteness: 100,
      samplePreconHours: 22,
      contact: ["Sam Ortiz", "sam.ortiz@stonebridge.example", "(615) 555-0186"],
    }),
    project(now, {
      id: "prj_donelson",
      name: "Donelson School Addition",
      number: "SC-24018",
      location: "2600 Lebanon Pike",
      city: "Nashville",
      trade: "painting",
      status: "lost",
      gcId: "gc_cumberland",
      ownerId: "usr_avery",
      estimatedValue: 198000,
      due: -15,
      site: null,
      rfi: null,
      aiRecommendation: "review",
      aiScore: 55,
      aiRationale:
        "Summer-school calendar compressed the shift window. The bid was not awarded.",
      humanDecision: "go",
      humanDecisionNote: "We bid and lost on price.",
      nextAction: "Record what the winning scope excluded",
      next: 1,
      documentCompleteness: 90,
      samplePreconHours: 13,
      contact: ["Noah Pitt", "noah.pitt@cumberlandgc.example", "(615) 555-0194"],
    }),
    project(now, {
      id: "prj_franklin",
      name: "Franklin Civic Center",
      number: "SC-24095",
      location: "100 2nd Avenue South",
      city: "Franklin",
      trade: "painting",
      status: "no_go",
      gcId: "gc_harpeth",
      ownerId: "usr_marcus",
      estimatedValue: 1200000,
      due: 4,
      site: null,
      rfi: null,
      aiRecommendation: "no_go",
      aiScore: 32,
      aiRationale:
        "The package is outside comfortable crew capacity and Harpeth payment history is slow.",
      humanDecision: "no_go",
      humanDecisionNote: "No go. Capacity and payment history.",
      nextAction: "No further action",
      next: null,
      documentCompleteness: 30,
      samplePreconHours: 3,
      contact: ["Priya Shah", "priya.shah@harpeth.example", "(615) 555-0118"],
    }),
    project(now, {
      id: "prj_sobro",
      name: "SoBro Apartments Phase 2",
      number: "SC-24102",
      location: "600 Lafayette Street",
      city: "Nashville",
      trade: "painting",
      status: "new",
      gcId: "gc_atlas",
      ownerId: "usr_avery",
      estimatedValue: 540000,
      due: 12,
      site: 7,
      rfi: 10,
      aiRecommendation: "review",
      aiScore: 64,
      aiRationale:
        "Multifamily volume is workable, but the invitation is missing the unit finish matrix.",
      humanDecision: null,
      humanDecisionNote: null,
      nextAction: "Screen the invitation and request the missing finish matrix",
      next: 3,
      documentCompleteness: 25,
      samplePreconHours: 1,
      contact: ["Jordan Ellis", "jordan.ellis@atlascommercial.example", "(615) 555-0133"],
    }),
    project(now, {
      id: "prj_yards",
      name: "Nashville Yards Lobby",
      number: "SC-24108",
      location: "1000 Broadway",
      city: "Nashville",
      trade: "flooring",
      status: "new",
      gcId: "gc_atlas",
      ownerId: "usr_avery",
      estimatedValue: 86000,
      due: 6,
      site: 5,
      rfi: 5,
      aiRecommendation: "review",
      aiScore: 48,
      aiRationale:
        "Flooring is configured for a later trade rollout. Do not treat this as a painting bid.",
      humanDecision: null,
      humanDecisionNote: null,
      nextAction: "Confirm whether flooring is active for this workspace",
      next: 2,
      documentCompleteness: 20,
      samplePreconHours: null,
      contact: ["Jordan Ellis", "jordan.ellis@atlascommercial.example", "(615) 555-0133"],
    }),
    project(now, {
      id: "prj_wedgewood",
      name: "Wedgewood Drywall Package",
      number: "SC-24077",
      location: "1400 Wedgewood Avenue",
      city: "Nashville",
      trade: "drywall",
      status: "reviewing",
      gcId: "gc_ridgeline",
      ownerId: "usr_avery",
      estimatedValue: 310000,
      due: 3,
      site: 2,
      rfi: 1,
      aiRecommendation: "go",
      aiScore: 71,
      aiRationale:
        "Drywall is enabled for this workspace and the GC relationship is current. Quote coverage is thin.",
      humanDecision: null,
      humanDecisionNote: null,
      nextAction: "Compare the drywall quote against the partition schedule",
      next: 2,
      documentCompleteness: 60,
      samplePreconHours: 7,
      contact: ["Elena Voss", "elena.voss@ridgeline.example", "(615) 555-0172"],
    }),
  ];

  const documents: Document[] = [];
  const scopeItems: ScopeItem[] = [];
  const takeoffItems: TakeoffItem[] = [];
  const rfis: Rfi[] = [];
  const quotes: Quote[] = [];
  const estimates: Estimate[] = [];
  const proposals: Proposal[] = [];
  const submissions: Submission[] = [];
  const audit: AuditEvent[] = [];

  for (const [index, item] of projects.entries()) {
    const bundle = buildBundle(item, at, workspace, now, index);
    documents.push(...bundle.documents);
    scopeItems.push(...bundle.scopeItems);
    takeoffItems.push(...bundle.takeoffItems);
    rfis.push(...bundle.rfis);
    quotes.push(...bundle.quotes);
    estimates.push(bundle.estimate);
    proposals.push(bundle.proposal);
    submissions.push(bundle.submission);
    audit.push(...bundle.audit);
  }

  replaceGulchDetails(
    at,
    scopeItems,
    takeoffItems,
    quotes,
    estimates,
    proposals,
    documents,
  );

  const tasks: Task[] = [
    task(
      "task_gulch_price",
      "prj_gulch",
      "Level quotes and set the bid price",
      "construction",
      "usr_marcus",
      at(1, 11),
      "approval",
      "/projects/prj_gulch/quotes",
    ),
    task(
      "task_green_takeoff",
      "prj_greenhills",
      "Approve clinic takeoff",
      "precon",
      "usr_avery",
      at(0, 14),
      "approval",
      "/projects/prj_greenhills/takeoff",
    ),
    task(
      "task_music_scope",
      "prj_music",
      "Review healthcare paint spec",
      "precon",
      "usr_avery",
      at(2, 15),
      "general",
      "/projects/prj_music/scope",
    ),
    task(
      "task_east_rfi",
      "prj_eastbank",
      "Send the overdue level-4 RFI",
      "precon",
      "usr_avery",
      at(-2, 15),
      "rfi",
      "/projects/prj_eastbank/rfis",
    ),
    task(
      "task_german_visit",
      "prj_germantown",
      "Site visit — occupied guest floors",
      "joint",
      "usr_marcus",
      at(1, 9),
      "site_visit",
      "/projects/prj_germantown",
    ),
    task(
      "task_sobro_screen",
      "prj_sobro",
      "Screen SoBro invitation",
      "precon",
      "usr_avery",
      at(3, 15),
      "general",
      "/projects/prj_sobro/documents",
    ),
    task(
      "task_wedge_quote",
      "prj_wedgewood",
      "Review drywall quote gaps",
      "construction",
      "usr_marcus",
      at(2, 16),
      "general",
      "/projects/prj_wedgewood/quotes",
    ),
    task(
      "task_12_outcome",
      "prj_12south",
      "Log the retail shell outcome when Ridgeline replies",
      "construction",
      "usr_marcus",
      at(4, 15),
      "general",
      "/projects/prj_12south/submission",
    ),
  ];

  const notifications: Notification[] = [
    note(
      "nt_1",
      "invitation",
      "Invitation — SoBro Apartments Phase 2",
      "Atlas Commercial sent a painting invitation. The unit finish matrix is missing.",
      "prj_sobro",
      at(-1, 9),
      false,
      "/inbox",
    ),
    note(
      "nt_2",
      "addendum",
      "Addendum 02 — The Gulch Office Tower",
      "Ridgeline revised the level 6 accent paint and door frame notes.",
      "prj_gulch",
      at(0, 8),
      false,
      "/projects/prj_gulch/documents",
    ),
    note(
      "nt_3",
      "quote",
      "Quote — Volunteer Finishes",
      "A painting quote arrived for The Gulch Office Tower.",
      "prj_gulch",
      at(0, 10),
      false,
      "/projects/prj_gulch/quotes",
    ),
    note(
      "nt_4",
      "rfi_response",
      "RFI answer — Music Row Medical Pavilion",
      "Cumberland answered the infection-control coating question.",
      "prj_music",
      at(-1, 16),
      true,
      "/projects/prj_music/rfis",
    ),
    note(
      "nt_5",
      "unmatched",
      "Quote needs a project match",
      "A flooring quote arrived without a project number.",
      null,
      at(0, 7),
      false,
      "/inbox",
    ),
    note(
      "nt_6",
      "approval",
      "Takeoff waiting — Green Hills Clinic",
      "The clinic bid is due today and the takeoff is not approved.",
      "prj_greenhills",
      at(0, 7, 30),
      false,
      "/projects/prj_greenhills/takeoff",
    ),
  ];

  const inbox: InboxItem[] = [
    {
      id: "in_sobro",
      type: "invitation",
      title: "SoBro Apartments Phase 2",
      summary: "Painting invitation from Atlas Commercial. Finish matrix not included.",
      receivedAt: at(-1, 9),
      read: false,
      projectId: "prj_sobro",
      suggestedProjectId: "prj_sobro",
    },
    {
      id: "in_gulch_add",
      type: "addendum",
      title: "Gulch Addendum 02",
      summary: "Level 6 accent color and hollow-metal frame notes changed.",
      receivedAt: at(0, 8),
      read: false,
      projectId: "prj_gulch",
      suggestedProjectId: "prj_gulch",
    },
    {
      id: "in_volunteer",
      type: "quote",
      title: "Volunteer Finishes — Gulch",
      summary: "Painting quote with frames and exposed structure included.",
      receivedAt: at(0, 10),
      read: false,
      projectId: "prj_gulch",
      suggestedProjectId: "prj_gulch",
    },
    {
      id: "in_music_rfi",
      type: "rfi_response",
      title: "Music Row RFI-016 answer",
      summary: "Low-VOC coating is acceptable in patient corridors.",
      receivedAt: at(-1, 16),
      read: true,
      projectId: "prj_music",
      suggestedProjectId: "prj_music",
    },
    {
      id: "in_unmatched",
      type: "unmatched",
      title: "Lobby flooring quote",
      summary:
        "A quote PDF arrived with no project number. It may belong to Nashville Yards Lobby.",
      receivedAt: at(0, 7),
      read: false,
      projectId: null,
      suggestedProjectId: "prj_yards",
    },
  ];

  return {
    workspace,
    users,
    generalContractors,
    subcontractors,
    projects,
    documents,
    scopeItems,
    takeoffItems,
    rfis,
    quotes,
    estimates,
    proposals,
    submissions,
    tasks,
    notifications,
    inbox,
    audit,
  };
}

type ProjectDraft = {
  id: string;
  name: string;
  number: string;
  location: string;
  city: string;
  trade: Project["trade"];
  status: Project["status"];
  gcId: string;
  ownerId: string;
  estimatedValue: number | null;
  due: number;
  dueHour?: number;
  site: number | null;
  siteHour?: number;
  rfi: number | null;
  aiRecommendation: Project["aiRecommendation"];
  aiScore: number;
  aiRationale: string;
  humanDecision: Project["humanDecision"];
  humanDecisionNote: string | null;
  nextAction: string;
  next: number | null;
  documentCompleteness: number;
  samplePreconHours: number | null;
  contact: [string, string, string];
};

function project(now: Date, draft: ProjectDraft): Project {
  const at = (day: number, hour = 15) => chicagoDateTime(now, day, hour);
  return {
    id: draft.id,
    name: draft.name,
    number: draft.number,
    location: draft.location,
    city: draft.city,
    state: "TN",
    trade: draft.trade,
    status: draft.status,
    gcId: draft.gcId,
    gcContactName: draft.contact[0],
    gcContactEmail: draft.contact[1],
    gcContactPhone: draft.contact[2],
    ownerId: draft.ownerId,
    estimatedValue: draft.estimatedValue,
    bidDueAt: at(draft.due, draft.dueHour ?? 15),
    timezone: "America/Chicago",
    siteVisitAt: draft.site == null ? null : at(draft.site, draft.siteHour ?? 10),
    rfiDueAt: draft.rfi == null ? null : at(draft.rfi, 15),
    aiRecommendation: draft.aiRecommendation,
    aiScore: draft.aiScore,
    aiRationale: draft.aiRationale,
    humanDecision: draft.humanDecision,
    humanDecisionNote: draft.humanDecisionNote,
    humanDecisionBy: draft.humanDecision ? "usr_marcus" : null,
    nextAction: draft.nextAction,
    nextActionDueAt: draft.next == null ? null : at(draft.next, 15),
    documentCompleteness: draft.documentCompleteness,
    samplePreconHours: draft.samplePreconHours,
    createdAt: at(-21, 9),
  };
}

function task(
  id: string,
  projectId: string,
  title: string,
  ownerGroup: Task["ownerGroup"],
  assigneeId: string,
  dueAt: string,
  kind: Task["kind"],
  href: string,
): Task {
  return {
    id,
    projectId,
    title,
    ownerGroup,
    assigneeId,
    dueAt,
    status: "open",
    kind,
    href,
  };
}

function note(
  id: string,
  type: Notification["type"],
  title: string,
  body: string,
  projectId: string | null,
  createdAt: string,
  read: boolean,
  href: string,
): Notification {
  return { id, type, title, body, projectId, createdAt, read, href };
}

function buildBundle(
  item: Project,
  at: (day: number, hour?: number, minute?: number) => string,
  workspace: Workspace,
  now: Date,
  index: number,
) {
  const closed =
    item.status === "submitted" || item.status === "won" || item.status === "lost";
  const drawingId = `${item.id}_dwg`;
  const specId = `${item.id}_spec`;
  const drawingName = `${item.number}-A-101-floor-plan.pdf`;
  const specName = `${item.number}-09-91-00-painting.pdf`;
  const documents: Document[] = [
    {
      id: drawingId,
      projectId: item.id,
      name: "Architectural floor plan",
      type: "drawing",
      version: "Issued for bid",
      revisionDate: at(-12, 9),
      receivedAt: at(-10, 9),
      reviewStatus: closed ? "reviewed" : "in_review",
      source: "GC invitation",
      filename: drawingName,
      pageCount: 14,
      changed: false,
      addendumNumber: null,
      notes: "Sample document. Not measured from an uploaded plan.",
    },
    {
      id: specId,
      projectId: item.id,
      name: "Painting specification",
      type: "specification",
      version: "Rev 1",
      revisionDate: at(-12, 9),
      receivedAt: at(-10, 9),
      reviewStatus: item.documentCompleteness > 70 ? "reviewed" : "unreviewed",
      source: "Specification manual",
      filename: specName,
      pageCount: 18,
      changed: false,
      addendumNumber: null,
      notes: null,
    },
    {
      id: `${item.id}_bid`,
      projectId: item.id,
      name: "Bid instructions and form",
      type: "bid_form",
      version: "Current",
      revisionDate: at(-9, 11),
      receivedAt: at(-9, 11),
      reviewStatus: closed ? "reviewed" : "unreviewed",
      source: "GC bid portal",
      filename: `${item.number}-bid-form.pdf`,
      pageCount: 6,
      changed: false,
      addendumNumber: null,
      notes: null,
    },
    {
      id: `${item.id}_add`,
      projectId: item.id,
      name: "Addendum 01",
      type: "addendum",
      version: "01",
      revisionDate: at(-2, 8),
      receivedAt: at(-2, 8),
      reviewStatus:
        item.id === "prj_gulch" ? "unreviewed" : closed ? "reviewed" : "in_review",
      source: "Email from GC",
      filename: `${item.number}-addendum-01.pdf`,
      pageCount: 3,
      changed: item.id === "prj_gulch",
      addendumNumber: "01",
      notes: item.id === "prj_gulch" ? "Superseded in part by Addendum 02." : null,
    },
  ];

  const scopeItems: ScopeItem[] = [
    {
      id: `${item.id}_scope_walls`,
      projectId: item.id,
      requirement: "Interior gypsum wall paint",
      aiFinding:
        "Sample finding: the finish schedule calls for eggshell latex on typical partitions. Confirm wet areas before pricing.",
      source: source(specId, specName, 6, null, "Rev 1"),
      riskNote: "Wet-area sheen is not consistent across rooms.",
      status: "included",
      reviewerId: "usr_avery",
      approval: closed ? "approved" : "pending",
    },
    {
      id: `${item.id}_scope_ceilings`,
      projectId: item.id,
      requirement: "Ceiling paint at exposed and gypsum ceilings",
      aiFinding:
        "Sample finding: ceiling scope appears included except mechanical rooms marked unfinished.",
      source: source(drawingId, drawingName, 2, "A-101", "Issued for bid"),
      riskNote: null,
      status: "included",
      reviewerId: "usr_avery",
      approval: closed ? "approved" : "draft",
    },
    {
      id: `${item.id}_scope_floor`,
      projectId: item.id,
      requirement: "Resilient flooring",
      aiFinding:
        "Sample finding: flooring is specified but is outside the painting trade unless the workspace enables it.",
      source: source(specId, specName, 2, null, "Rev 1"),
      riskNote: "Do not carry flooring in a painting bid.",
      status: item.trade === "flooring" ? "included" : "excluded",
      reviewerId: "usr_avery",
      approval: "pending",
    },
    {
      id: `${item.id}_scope_frames`,
      projectId: item.id,
      requirement: "Hollow-metal door frames",
      aiFinding:
        "Sample finding: frame painting is listed in the paint spec. Door slabs are prefinished.",
      source: source(specId, specName, 9, null, "Rev 1"),
      riskNote:
        "Confirm whether field painting of frames is required after installation.",
      status: "needs_clarification",
      reviewerId: "usr_avery",
      approval: "pending",
    },
  ];

  const takeoffItems: TakeoffItem[] = [
    takeoff(
      item.id,
      "wall_area",
      "Typical partitions",
      "Open office",
      3200,
      "SF",
      "Eggshell latex",
      drawingId,
      drawingName,
      "A-101",
      '1/8" = 1\'-0"',
    ),
    takeoff(
      item.id,
      "ceiling_area",
      "Gypsum ceilings",
      "Corridors",
      1400,
      "SF",
      "Flat white",
      drawingId,
      drawingName,
      "A-101",
      '1/8" = 1\'-0"',
    ),
    takeoff(
      item.id,
      "door_frame",
      "Hollow-metal frames",
      "Typical rooms",
      42,
      "EA",
      "Semi-gloss enamel",
      drawingId,
      drawingName,
      "A-601",
      "N.T.S.",
    ),
    takeoff(
      item.id,
      "trim",
      "Wood base",
      "Offices",
      860,
      "LF",
      "Semi-gloss enamel",
      drawingId,
      drawingName,
      "A-101",
      '1/8" = 1\'-0"',
    ),
    takeoff(
      item.id,
      "exposed_structure",
      "Exposed deck and steel",
      "Lobby",
      600,
      "SF",
      "Dryfall",
      drawingId,
      drawingName,
      "A-201",
      '1/8" = 1\'-0"',
    ),
  ].map((row) => ({
    ...row,
    approval: closed ? ("approved" as const) : ("pending" as const),
  }));

  const rfis: Rfi[] = [
    {
      id: `${item.id}_rfi_1`,
      projectId: item.id,
      number: `RFI-${String(index + 14).padStart(3, "0")}`,
      question:
        "Is field painting required on hollow-metal frames after installation, or are frames prefinished?",
      reason: "The paint spec and door schedule disagree.",
      status: closed
        ? "closed"
        : item.rfiDueAt && new Date(item.rfiDueAt) < now
          ? "ready_for_review"
          : "draft",
      source: source(specId, specName, 9, "A-601", "Rev 1"),
      reviewerId: "usr_avery",
      dueAt: item.rfiDueAt,
      aiDrafted: true,
      answer: closed ? "Frames are field painted. Door slabs are prefinished." : null,
      sentAt: closed ? at(-8, 11) : null,
    },
  ];

  const quoteSubs =
    item.trade === "drywall"
      ? ["sub_eastbank", "sub_riverbend"]
      : ["sub_midstate", "sub_volunteer"];
  const quotes: Quote[] = quoteSubs.map((subcontractorId, index) => ({
    id: `${item.id}_quote_${index + 1}`,
    projectId: item.id,
    subcontractorId,
    trade: item.trade === "drywall" && index === 0 ? "drywall" : "painting",
    amount: Math.round((item.estimatedValue ?? 100000) * (index === 0 ? 0.62 : 0.71)),
    validUntil: at(21, 17),
    inclusions:
      index === 0
        ? ["Walls", "Ceilings"]
        : ["Walls", "Ceilings", "Frames", "Exposed structure"],
    exclusions:
      index === 0
        ? ["High work above 12 feet", "Night shifts", "Frames"]
        : ["Flooring", "Abatement"],
    insuranceStatus:
      subcontractorId === "sub_midstate"
        ? "expiring"
        : subcontractorId === "sub_eastbank"
          ? "missing"
          : "current",
    missingScope: index === 0 ? ["Hollow-metal frames", "Exposed structure"] : [],
    riskFlags: index === 0 ? ["Excludes high work", "Insurance expiring or missing"] : [],
    notes:
      index === 0
        ? "Lower number leaves required scope out."
        : "Closer to the required scope. Not a recommendation.",
    receivedAt: at(-1, 10 + index),
    selected: false,
  }));

  const estimate: Estimate = {
    projectId: item.id,
    markupPercent: 12,
    contingencyPercent: 4,
    assumptions: [
      "Demo quantities are sample values for review, not measurements from uploaded drawings.",
      "One coat primer and two finish coats on new gypsum.",
    ],
    exclusions: ["Flooring unless the trade is flooring", "Hazardous material abatement"],
    allowances: ["Accent colors beyond the standard palette: $4,500"],
    lines: [
      line(
        `${item.id}_line_wall`,
        "Interior wall paint",
        3200,
        "SF",
        0.42,
        0.85,
        0,
        0.05,
        null,
      ),
      line(
        `${item.id}_line_ceiling`,
        "Ceiling paint",
        1400,
        "SF",
        0.38,
        0.72,
        0,
        0.04,
        null,
      ),
      line(
        `${item.id}_line_frame`,
        "Door frames",
        42,
        "EA",
        18,
        46,
        0,
        4,
        quotes[1]?.id ?? null,
      ),
      line(`${item.id}_line_trim`, "Trim", 860, "LF", 0.3, 1.1, 0, 0.05, null),
    ],
    bidPrice: closed ? item.estimatedValue : null,
    bidPriceSetBy: closed ? "usr_marcus" : null,
  };

  const bothApproved = closed || item.status === "no_go";
  const proposals: Proposal = {
    projectId: item.id,
    sections: {
      inclusions: workspace.proposalTemplate.inclusions,
      exclusions: workspace.proposalTemplate.exclusions,
      clarifications: workspace.proposalTemplate.clarifications,
      alternates:
        "Alternate 1: upgrade corridors to Level 5 finish. Price is not final until a lead sets it.",
      pricing: closed
        ? `Bid price ${item.estimatedValue ?? "unknown"}, set by the Construction Lead in this demo.`
        : "Pricing is a draft until the Construction Lead sets the bid price.",
      addenda: "Acknowledge every addendum listed before submission.",
    },
    unverifiedItems: closed
      ? []
      : ["Takeoff quantities are sample data", "Frame painting responsibility"],
    attachments: [
      { name: "Bid form", ready: closed },
      { name: "Insurance certificate", ready: true },
      { name: "Addenda acknowledgement", ready: closed },
    ],
    addendaAcknowledged: [
      { id: `${item.id}_add`, label: "Addendum 01", acknowledged: closed },
    ],
    approvals: {
      precon: bothApproved ? approved("usr_avery", at(-4, 15)) : emptySlot,
      construction: bothApproved ? approved("usr_marcus", at(-4, 16)) : emptySlot,
    },
  };

  const submissions: Submission = {
    projectId: item.id,
    requiredDocuments: [
      { name: "Proposal", ready: closed },
      { name: "Bid form", ready: closed },
      { name: "Insurance", ready: true },
      { name: "Addenda acknowledgement", ready: closed },
    ],
    submittedAt: closed ? at(-3, 14) : null,
    outcome:
      item.status === "won"
        ? "won"
        : item.status === "lost"
          ? "lost"
          : closed
            ? "pending"
            : null,
    outcomeNote:
      item.status === "won"
        ? "Awarded in this demo dataset."
        : item.status === "lost"
          ? "Not awarded. Sample outcome."
          : null,
    simulated: true,
  };

  const audit: AuditEvent[] = [
    {
      id: `${item.id}_audit_invite`,
      projectId: item.id,
      at: at(-10, 9),
      actorId: "usr_ai",
      actorRole: "ai_assistant",
      action: "Invitation organized",
      detail: "The assistant filed the invitation. No go/no-go decision was made.",
    },
    {
      id: `${item.id}_audit_status`,
      projectId: item.id,
      at: at(-1, 11),
      actorId: item.ownerId,
      actorRole: item.ownerId === "usr_marcus" ? "construction_lead" : "precon_lead",
      action: "Status updated",
      detail: `Demo history shows the project in ${item.status.replaceAll("_", " ")}.`,
    },
  ];

  return {
    documents,
    scopeItems,
    takeoffItems,
    rfis,
    quotes,
    estimate,
    proposal: proposals,
    submission: submissions,
    audit,
  };
}

function takeoff(
  projectId: string,
  category: TakeoffItem["category"],
  item: string,
  location: string,
  quantity: number,
  unit: string,
  finish: string,
  documentId: string,
  filename: string,
  sheet: string,
  scale: string,
): TakeoffItem {
  return {
    id: `${projectId}_${category}`,
    projectId,
    category,
    item,
    location,
    quantity,
    unit,
    finish,
    source: source(documentId, filename, 1, sheet, "Issued for bid"),
    scale,
    assumptions: "Sample quantity for the demo. Not measured from an uploaded drawing.",
    exclusions: "No patching beyond what the spec includes.",
    confidence: 0.62,
    approval: "pending",
    demo: true,
  };
}

function line(
  id: string,
  description: string,
  quantity: number,
  unit: string,
  materialCost: number,
  laborCost: number,
  subcontractorCost: number,
  otherCost: number,
  quoteId: string | null,
): Estimate["lines"][number] {
  return {
    id,
    description,
    quantity,
    unit,
    materialCost,
    laborCost,
    subcontractorCost,
    otherCost,
    quoteId,
    assumption: "Sample unit costs for demonstration.",
  };
}

function replaceGulchDetails(
  at: (day: number, hour?: number, minute?: number) => string,
  scopeItems: ScopeItem[],
  takeoffItems: TakeoffItem[],
  quotes: Quote[],
  estimates: Estimate[],
  proposals: Proposal[],
  documents: Document[],
) {
  documents.push({
    id: "prj_gulch_add2",
    projectId: "prj_gulch",
    name: "Addendum 02",
    type: "addendum",
    version: "02",
    revisionDate: at(0, 8),
    receivedAt: at(0, 8),
    reviewStatus: "unreviewed",
    source: "Email from Ridgeline Builders",
    filename: "SC-24081-addendum-02.pdf",
    pageCount: 4,
    changed: true,
    addendumNumber: "02",
    notes: "Changes the level 6 accent paint and clarifies hollow-metal frames.",
  });

  const wall = scopeItems.find((item) => item.id === "prj_gulch_scope_walls");
  if (wall) {
    wall.requirement = "Interior gypsum wall paint, levels 2–8";
    wall.aiFinding =
      "Sample finding: levels 2–8 gypsum partitions are included. Level 1 lobby accent is changed by Addendum 02 and is not verified.";
    wall.riskNote = "Addendum 02 is unreviewed.";
    wall.status = "included";
  }

  const walls = takeoffItems.find((item) => item.id === "prj_gulch_wall_area");
  if (walls) {
    walls.item = "Level 2 open office walls";
    walls.location = "Level 2";
    walls.quantity = 4280;
    walls.confidence = 0.71;
    walls.approval = "pending";
  }

  const gulchQuotes = quotes.filter((quote) => quote.projectId === "prj_gulch");
  const midstate = gulchQuotes[0];
  const volunteer = gulchQuotes[1];
  if (midstate && volunteer) {
    midstate.subcontractorId = "sub_midstate";
    midstate.amount = 241500;
    midstate.missingScope = [
      "Hollow-metal frames",
      "Exposed lobby structure",
      "Night shifts",
    ];
    midstate.riskFlags = [
      "Lowest number excludes required scope",
      "Insurance expires inside the project window",
    ];
    midstate.notes = "Do not treat the lower number as the best quote.";
    volunteer.subcontractorId = "sub_volunteer";
    volunteer.amount = 298750;
    volunteer.inclusions = [
      "Walls",
      "Ceilings",
      "Hollow-metal frames",
      "Exposed lobby structure",
    ];
    volunteer.missingScope = [];
    volunteer.riskFlags = ["Validity ends before a delayed award"];
    volunteer.notes =
      "Covers the scoped frames. Selection still belongs to the Construction Lead.";
  }
  quotes.push({
    id: "prj_gulch_quote_3",
    projectId: "prj_gulch",
    subcontractorId: "sub_riverbend",
    trade: "painting",
    amount: 312400,
    validUntil: at(18, 17),
    inclusions: ["Walls", "Ceilings", "Frames", "Night shifts"],
    exclusions: ["Exterior", "Flooring"],
    insuranceStatus: "current",
    missingScope: ["Exposed lobby structure"],
    riskFlags: ["Exposed structure omitted"],
    notes: "Includes night work for occupied floors. Exposed structure is missing.",
    receivedAt: at(-2, 13),
    selected: false,
  });

  const estimate = estimates.find((item) => item.projectId === "prj_gulch");
  if (estimate) {
    const wallLine = estimate.lines.find(
      (lineItem) => lineItem.id === "prj_gulch_line_wall",
    );
    if (wallLine) wallLine.quantity = 4280;
    estimate.assumptions.unshift(
      "Gulch quantities are labeled demo data and follow the sample takeoff.",
    );
  }

  const proposal = proposals.find((item) => item.projectId === "prj_gulch");
  if (proposal) {
    proposal.addendaAcknowledged.push({
      id: "prj_gulch_add2",
      label: "Addendum 02",
      acknowledged: false,
    });
    proposal.unverifiedItems = [
      "Addendum 02 accent color",
      "Level 2 wall quantity is sample data",
      "No subcontractor has been selected",
    ];
  }
}
