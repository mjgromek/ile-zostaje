// FROZEN EVIDENCE, not a fixture anyone may edit by hand.
//
// Every string below was read out of a real browser driven against the `v0.3.0`
// tag, checked out into its own worktree and served by its own Vite process on
// port 5182, at 320x568, pl-PL, on 2026-08-19. It is the instrument criterion 5
// and criterion 11 are measured with: "byte-identical to v0.3.0" is a claim
// about the tagged release, and only the tagged release can settle it.
//
// `band` is the band wrapper's textContent, so it carries the two captions and
// the year line as well as the share; `ladder` is the whole table including its
// visually-hidden caption; `total` is the total row; `sticky` is the mini-bar,
// read after scrolling to the bottom at 320x568 — the one viewport where it
// fires. Non-breaking spaces are the pl-PL grouping character and are preserved
// exactly: a test that normalised them would stop measuring what it claims to.
//
// To re-cut it: check out the tag into a worktree, serve it, and re-read. Never
// copy figures from this repository's own HEAD — that would make the baseline
// agree with the thing it is supposed to be checking.

export type Screen = {
  net: string;
  from: string;
  band: string;
  ladder: string;
  caption: string;
  total: string;
  sticky: string;
};

/** Keyed `<contract label>/<monthly gross as typed in the pl field>`. */
export const V030_SCREENS: Record<string, Screen> = {
  "Etat/6000": {
    "net": "4 420,43 zł",
    "from": "miesięcznie, z 6 000,00 zł brutto",
    "band": "Na konto 73,7%6 000,00 zł bruttoskładki i podatek 26,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 6 000,00 zł− 585,60 zł5 414,40 złSkładka rentowa1,5% od 6 000,00 zł− 90,00 zł5 324,40 złSkładka chorobowa2,45% od 6 000,00 zł− 147,00 zł5 177,40 złSkładka zdrowotna9% od 5 177,40 zł — po odjęciu składek ZUS− 465,97 zł4 711,43 złZaliczka na PIT12% od 4 927,00 zł, minus 300,00 zł kwoty zmniejszającej− 291,00 zł4 420,43 złNa kontoz 6 000,00 zł brutto4 420,43 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,00 zł brutto4 420,43 zł",
    "sticky": "Na konto·4 420,43 zł"
  },
  "Etat/12000": {
    "net": "8 488,87 zł",
    "from": "miesięcznie, z 12 000,00 zł brutto",
    "band": "Na konto 70,7%12 000,00 zł bruttoskładki i podatek 29,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 12 000,00 zł− 1 171,20 zł10 828,80 złSkładka rentowa1,5% od 12 000,00 zł− 180,00 zł10 648,80 złSkładka chorobowa2,45% od 12 000,00 zł− 294,00 zł10 354,80 złSkładka zdrowotna9% od 10 354,80 zł — po odjęciu składek ZUS− 931,93 zł9 422,87 złZaliczka na PIT12% od 10 105,00 zł, minus 300,00 zł kwoty zmniejszającej− 934,00 zł8 488,87 złNa kontoz 12 000,00 zł brutto8 488,87 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 000,00 zł brutto8 488,87 zł",
    "sticky": "Na konto·8 488,87 zł"
  },
  "Etat/20000": {
    "net": "12 561,78 zł",
    "from": "miesięcznie, z 20 000,00 zł brutto",
    "band": "Na konto 62,8%20 000,00 zł bruttoskładki i podatek 37,2%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 20 000,00 zł− 1 952,00 zł18 048,00 złSkładka rentowa1,5% od 20 000,00 zł− 300,00 zł17 748,00 złSkładka chorobowa2,45% od 20 000,00 zł− 490,00 zł17 258,00 złSkładka zdrowotna9% od 17 258,00 zł — po odjęciu składek ZUS− 1 553,22 zł15 704,78 złZaliczka na PIT12% od 17 008,00 zł, minus 300,00 zł kwoty zmniejszającej− 3 143,00 zł12 561,78 złNa kontoz 20 000,00 zł brutto12 561,78 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 20 000,00 zł brutto12 561,78 zł",
    "sticky": "Na konto·12 561,78 zł"
  },
  "Etat/6000,80": {
    "net": "4 421,06 zł",
    "from": "miesięcznie, z 6 000,80 zł brutto",
    "band": "Na konto 73,7%6 000,80 zł bruttoskładki i podatek 26,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 6 000,80 zł− 585,68 zł5 415,12 złSkładka rentowa1,5% od 6 000,80 zł− 90,01 zł5 325,11 złSkładka chorobowa2,45% od 6 000,80 zł− 147,02 zł5 178,09 złSkładka zdrowotna9% od 5 178,09 zł — po odjęciu składek ZUS− 466,03 zł4 712,06 złZaliczka na PIT12% od 4 928,00 zł, minus 300,00 zł kwoty zmniejszającej− 291,00 zł4 421,06 złNa kontoz 6 000,80 zł brutto4 421,06 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,80 zł brutto4 421,06 zł",
    "sticky": "Na konto·4 421,06 zł"
  },
  "Etat/12001,60": {
    "net": "8 490,12 zł",
    "from": "miesięcznie, z 12 001,60 zł brutto",
    "band": "Na konto 70,7%12 001,60 zł bruttoskładki i podatek 29,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 12 001,60 zł− 1 171,36 zł10 830,24 złSkładka rentowa1,5% od 12 001,60 zł− 180,02 zł10 650,22 złSkładka chorobowa2,45% od 12 001,60 zł− 294,04 zł10 356,18 złSkładka zdrowotna9% od 10 356,18 zł — po odjęciu składek ZUS− 932,06 zł9 424,12 złZaliczka na PIT12% od 10 106,00 zł, minus 300,00 zł kwoty zmniejszającej− 934,00 zł8 490,12 złNa kontoz 12 001,60 zł brutto8 490,12 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 001,60 zł brutto8 490,12 zł",
    "sticky": "Na konto·8 490,12 zł"
  },
  "Etat/19999,20": {
    "net": "12 562,15 zł",
    "from": "miesięcznie, z 19 999,20 zł brutto",
    "band": "Na konto 62,8%19 999,20 zł bruttoskładki i podatek 37,2%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 19 999,20 zł− 1 951,92 zł18 047,28 złSkładka rentowa1,5% od 19 999,20 zł− 299,99 zł17 747,29 złSkładka chorobowa2,45% od 19 999,20 zł− 489,98 zł17 257,31 złSkładka zdrowotna9% od 17 257,31 zł — po odjęciu składek ZUS− 1 553,16 zł15 704,15 złZaliczka na PIT12% od 17 007,00 zł, minus 300,00 zł kwoty zmniejszającej− 3 142,00 zł12 562,15 złNa kontoz 19 999,20 zł brutto12 562,15 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 19 999,20 zł brutto12 562,15 zł",
    "sticky": "Na konto·12 562,15 zł"
  },
  "Zlecenie/6000": {
    "net": "4 634,20 zł",
    "from": "miesięcznie, z 6 000,00 zł brutto",
    "band": "Na konto 77,2%6 000,00 zł bruttoskładki i podatek 22,8%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 6 000,00 zł− 585,60 zł5 414,40 złSkładka rentowa1,5% od 6 000,00 zł− 90,00 zł5 324,40 złSkładka zdrowotna9% od 5 324,40 zł — po odjęciu składek ZUS− 479,20 zł4 845,20 złZaliczka na PIT12% od 4 260,00 zł — po odjęciu 20% kosztów (1 064,88 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 211,00 zł4 634,20 złNa kontoz 6 000,00 zł brutto4 634,20 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,00 zł brutto4 634,20 zł",
    "sticky": "Na konto·4 634,20 zł"
  },
  "Zlecenie/12000": {
    "net": "8 968,41 zł",
    "from": "miesięcznie, z 12 000,00 zł brutto",
    "band": "Na konto 74,7%12 000,00 zł bruttoskładki i podatek 25,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 12 000,00 zł− 1 171,20 zł10 828,80 złSkładka rentowa1,5% od 12 000,00 zł− 180,00 zł10 648,80 złSkładka zdrowotna9% od 10 648,80 zł — po odjęciu składek ZUS− 958,39 zł9 690,41 złZaliczka na PIT12% od 8 519,00 zł — po odjęciu 20% kosztów (2 129,76 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 722,00 zł8 968,41 złNa kontoz 12 000,00 zł brutto8 968,41 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 000,00 zł brutto8 968,41 zł",
    "sticky": "Na konto·8 968,41 zł"
  },
  "Zlecenie/20000": {
    "net": "13 907,68 zł",
    "from": "miesięcznie, z 20 000,00 zł brutto",
    "band": "Na konto 69,5%20 000,00 zł bruttoskładki i podatek 30,5%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 20 000,00 zł− 1 952,00 zł18 048,00 złSkładka rentowa1,5% od 20 000,00 zł− 300,00 zł17 748,00 złSkładka zdrowotna9% od 17 748,00 zł — po odjęciu składek ZUS− 1 597,32 zł16 150,68 złZaliczka na PIT12% od 14 198,00 zł — po odjęciu 20% kosztów (3 549,60 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 2 243,00 zł13 907,68 złNa kontoz 20 000,00 zł brutto13 907,68 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 20 000,00 zł brutto13 907,68 zł",
    "sticky": "Na konto·13 907,68 zł"
  },
  "Zlecenie/6000,80": {
    "net": "4 634,85 zł",
    "from": "miesięcznie, z 6 000,80 zł brutto",
    "band": "Na konto 77,2%6 000,80 zł bruttoskładki i podatek 22,8%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 6 000,80 zł− 585,68 zł5 415,12 złSkładka rentowa1,5% od 6 000,80 zł− 90,01 zł5 325,11 złSkładka zdrowotna9% od 5 325,11 zł — po odjęciu składek ZUS− 479,26 zł4 845,85 złZaliczka na PIT12% od 4 260,00 zł — po odjęciu 20% kosztów (1 065,02 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 211,00 zł4 634,85 złNa kontoz 6 000,80 zł brutto4 634,85 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,80 zł brutto4 634,85 zł",
    "sticky": "Na konto·4 634,85 zł"
  },
  "Zlecenie/12001,60": {
    "net": "8 969,70 zł",
    "from": "miesięcznie, z 12 001,60 zł brutto",
    "band": "Na konto 74,7%12 001,60 zł bruttoskładki i podatek 25,3%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 12 001,60 zł− 1 171,36 zł10 830,24 złSkładka rentowa1,5% od 12 001,60 zł− 180,02 zł10 650,22 złSkładka zdrowotna9% od 10 650,22 zł — po odjęciu składek ZUS− 958,52 zł9 691,70 złZaliczka na PIT12% od 8 520,00 zł — po odjęciu 20% kosztów (2 130,04 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 722,00 zł8 969,70 złNa kontoz 12 001,60 zł brutto8 969,70 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 001,60 zł brutto8 969,70 zł",
    "sticky": "Na konto·8 969,70 zł"
  },
  "Zlecenie/19999,20": {
    "net": "13 907,03 zł",
    "from": "miesięcznie, z 19 999,20 zł brutto",
    "band": "Na konto 69,5%19 999,20 zł bruttoskładki i podatek 30,5%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeSkładka emerytalna9,76% od 19 999,20 zł− 1 951,92 zł18 047,28 złSkładka rentowa1,5% od 19 999,20 zł− 299,99 zł17 747,29 złSkładka zdrowotna9% od 17 747,29 zł — po odjęciu składek ZUS− 1 597,26 zł16 150,03 złZaliczka na PIT12% od 14 198,00 zł — po odjęciu 20% kosztów (3 549,46 zł) i składek ZUS, minus 300,00 zł kwoty zmniejszającej− 2 243,00 zł13 907,03 złNa kontoz 19 999,20 zł brutto13 907,03 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 19 999,20 zł brutto13 907,03 zł",
    "sticky": "Na konto·13 907,03 zł"
  },
  "Dzieło/6000": {
    "net": "5 724,00 zł",
    "from": "miesięcznie, z 6 000,00 zł brutto",
    "band": "Na konto 95,4%6 000,00 zł bruttoskładki i podatek 4,6%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 4 800,00 zł — po odjęciu 20% kosztów (1 200,00 zł), minus 300,00 zł kwoty zmniejszającej− 276,00 zł5 724,00 złNa kontoz 6 000,00 zł brutto5 724,00 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,00 zł brutto5 724,00 zł",
    "sticky": "Na konto·5 724,00 zł"
  },
  "Dzieło/12000": {
    "net": "11 148,00 zł",
    "from": "miesięcznie, z 12 000,00 zł brutto",
    "band": "Na konto 92,9%12 000,00 zł bruttoskładki i podatek 7,1%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 9 600,00 zł — po odjęciu 20% kosztów (2 400,00 zł), minus 300,00 zł kwoty zmniejszającej− 852,00 zł11 148,00 złNa kontoz 12 000,00 zł brutto11 148,00 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 000,00 zł brutto11 148,00 zł",
    "sticky": "Na konto·11 148,00 zł"
  },
  "Dzieło/20000": {
    "net": "17 180,00 zł",
    "from": "miesięcznie, z 20 000,00 zł brutto",
    "band": "Na konto 85,9%20 000,00 zł bruttoskładki i podatek 14,1%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 16 000,00 zł — po odjęciu 20% kosztów (4 000,00 zł), minus 300,00 zł kwoty zmniejszającej− 2 820,00 zł17 180,00 złNa kontoz 20 000,00 zł brutto17 180,00 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 20 000,00 zł brutto17 180,00 zł",
    "sticky": "Na konto·17 180,00 zł"
  },
  "Dzieło/6000,80": {
    "net": "5 724,80 zł",
    "from": "miesięcznie, z 6 000,80 zł brutto",
    "band": "Na konto 95,4%6 000,80 zł bruttoskładki i podatek 4,6%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 4 801,00 zł — po odjęciu 20% kosztów (1 200,16 zł), minus 300,00 zł kwoty zmniejszającej− 276,00 zł5 724,80 złNa kontoz 6 000,80 zł brutto5 724,80 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 6 000,80 zł brutto5 724,80 zł",
    "sticky": "Na konto·5 724,80 zł"
  },
  "Dzieło/12001,60": {
    "net": "11 149,60 zł",
    "from": "miesięcznie, z 12 001,60 zł brutto",
    "band": "Na konto 92,9%12 001,60 zł bruttoskładki i podatek 7,1%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 9 601,00 zł — po odjęciu 20% kosztów (2 400,32 zł), minus 300,00 zł kwoty zmniejszającej− 852,00 zł11 149,60 złNa kontoz 12 001,60 zł brutto11 149,60 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 12 001,60 zł brutto11 149,60 zł",
    "sticky": "Na konto·11 149,60 zł"
  },
  "Dzieło/19999,20": {
    "net": "17 179,20 zł",
    "from": "miesięcznie, z 19 999,20 zł brutto",
    "band": "Na konto 85,9%19 999,20 zł bruttoskładki i podatek 14,1%Stawki za rok 2026",
    "ladder": "Podział miesięcznej pensji bruttoSkąd ta różnicaZostajeZaliczka na PIT12% od 15 999,00 zł — po odjęciu 20% kosztów (3 999,84 zł), minus 300,00 zł kwoty zmniejszającej− 2 820,00 zł17 179,20 złNa kontoz 19 999,20 zł brutto17 179,20 zł",
    "caption": "Podział miesięcznej pensji brutto",
    "total": "Na kontoz 19 999,20 zł brutto17 179,20 zł",
    "sticky": "Na konto·17 179,20 zł"
  }
};
