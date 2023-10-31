import {
  JSX,
} from "solid-js";

import { PageInfo } from "@/components/_PageInfo";
import { Timeline } from "@/components/movie/Timeline";
import { WebGpuViewer } from "@/components/movie/WebGpuViewer";

import styles from "./Movie.module.styl";

export const Movie = (
): JSX.Element => {

  return (
    <div
      class={styles.Movie}
    >
      <PageInfo
        title={(domain) => `movie - ${domain}`}
        description={"In production..."}
      />
      <WebGpuViewer />
      <Timeline />
    </div>
  );
};
export default Movie;
