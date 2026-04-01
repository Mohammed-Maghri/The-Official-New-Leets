import React from "react";

const cloneData: null[] = [];

for (let i = 0; i < 100; i++) {
  cloneData.push(null);
}

const CloseIfNotClicked = (
  ref: React.RefObject<HTMLElement>,
  ClickedPlace: HTMLElement | null,
  triggerRef?: React.RefObject<HTMLElement>
) => {
  if (ref.current && ClickedPlace) {
    if (getComputedStyle(ref.current).display === "none") return;
    const isClickedInsideDropdown = ref.current.contains(ClickedPlace);
    const isClickedOnTrigger =
      triggerRef?.current?.contains(ClickedPlace) || false;
    if (!isClickedInsideDropdown && !isClickedOnTrigger) {
      ref.current.style.display = "none";
    }
  }
};

interface CursusNameId {
  name: string;
  id: number;
}

interface CampusNameId {
  name: string;
  id: number;
}

interface SearchDeliverData {
  page: number;
  set: boolean;
  month: number | string;
  year: number | string;
  cursus: CursusNameId;
  campus: CampusNameId;
}

const CursusList: CampusNameId[] = [
  { name: "Piscine", id: 9 },
  { name: "Cursus", id: 21 },
];
const YearList: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const MonthList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const monthsIndex: string[] = [
  "0",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const CampusList: CampusNameId[] = [
  { name: "All", id: 0 },
  { name: "Khouribga", id: 16 },
  { name: "Bengrir", id: 21 },
  { name: "Tetouan", id: 55 },
  { name: "Rabat", id: 75 },
  { name: "Paris", id: 1 },
  { name: "Lyon", id: 9 },
  { name: "Barcelona", id: 46 },
  { name: "Mulhouse", id: 48 },
  { name: "Lausanne", id: 47 },
  { name: "Istanbul", id: 49 },
  { name: "Berlin", id: 51 },
  { name: "Florence", id: 52 },
  { name: "Vienna", id: 53 },
  { name: "Prague", id: 56 },
  { name: "London", id: 57 },
  { name: "Porto", id: 58 },
  { name: "Luxembourg", id: 59 },
  { name: "Perpignan", id: 60 },
  { name: "Tokyo", id: 26 },
  { name: "Moscow", id: 17 },
  { name: "Madrid", id: 22 },
  { name: "Seoul", id: 29 },
  { name: "Rome", id: 30 },
  { name: "Yerevan", id: 32 },
  {name: "Amesterdam", id: 14},
  { name: "Bangkok", id: 33 },
  { name: "Amman", id: 35 },
  { name: "Malaga", id: 37 },
  { name: "Nice", id: 41 },
  { name: "Abu Dhabi", id: 43 },
  { name: "Wolfsburg", id: 44 },
];

export type { SearchDeliverData };
export {
  cloneData,
  CloseIfNotClicked,
  MonthList,
  CampusList,
  YearList,
  CursusList,
  monthsIndex,
};
