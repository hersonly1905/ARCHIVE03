/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MemoryImage {
  url: string;
  caption: string;
  aspectRatioClassName?: string;
}

export interface MonthData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgGradient: string;
  themeColor: string;
  musicMood: 'fresh' | 'comfort' | 'intense' | 'poem';
  musicLabel: string;
  images: MemoryImage[];
}

export type ExperiencePhase = 'LOADING' | 'TIMELINE' | 'CHAPTER_1' | 'CHAPTER_2' | 'CHAPTER_3' | 'MYSTERY_LOCKED' | 'MYSTERY_LOADING' | 'POEM' | 'FINAL_REVEAL';
