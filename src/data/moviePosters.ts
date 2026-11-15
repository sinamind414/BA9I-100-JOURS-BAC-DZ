import week1Poster from '../assets/images/poster_week1_multiverse_1794679205778.jpg';
import week2Poster from '../assets/images/poster_week2_anime_door_1794679206486.jpg';
import week3Poster from '../assets/images/poster_week3_wild_robot_1794679220090.jpg';
import week4Poster from '../assets/images/poster_week4_interstellar_1794679206959.jpg';
import week5Poster from '../assets/images/poster_week5_tech_chaos_1794679208212.jpg';

const GENERATED_POSTER_BY_WEEK: Record<number, string> = {
  1: week1Poster,
  2: week2Poster,
  3: week3Poster,
  4: week4Poster,
  5: week5Poster,
};

export function getWeeklyMoviePosterSrc(
  week: number,
  fallbackPosterUrl?: string
): string {
  return (
    GENERATED_POSTER_BY_WEEK[week] ??
    fallbackPosterUrl ??
    `/posters/week-${week}.svg`
  );
}
